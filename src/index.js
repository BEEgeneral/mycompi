require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
// RAW BODY para webhook de Stripe
// Necesita el body sin parsear para verificar la firma HMAC
// ─────────────────────────────────────────
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// ─────────────────────────────────────────
// MIDDLEWARE global (para todas las demás rutas)
// ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Log de inicio
console.log('🚀 MyCompi starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'NOT SET');

// Inicializar DB
if (process.env.DATABASE_URL) {
  const { initDB } = require('./models/db');
  initDB().then(() => {
    console.log('✅ Database initialized');
  }).catch(err => {
    console.error('❌ Database init failed:', err.message);
  });
} else {
  console.log('⚠️ No DATABASE_URL - running without DB');
}

// Rutas
const clientesRoutes = require('./routes/clientes');
const agentesRoutes = require('./routes/agentes');
const trabajosRoutes = require('./routes/trabajos');
const pagosRoutes = require('./routes/pagos');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const emailRoutes = require('./routes/email');
const adminRoutes = require('./routes/admin');
const digestRoutes = require('./routes/digest');
const stripeRoutes = require('./routes/stripe');
const toolsRoutes = require('./routes/tools');
const { router: notificacionesRoutes } = require('./routes/notificaciones');
const colaRoutes = require('./routes/cola');
const workerRoutes = require('./routes/worker');

const { AGENTS } = require('./services/agentLoader');

app.use('/api/clientes', clientesRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/trabajos', trabajosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/auth', authRoutes.router);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/cola', colaRoutes);
app.use('/api/worker', workerRoutes);

// Exponer AGENTS para las rutas
app.use((req, res, next) => {
  req.app.set('AGENTS', AGENTS);
  next();
});

app.use('/api/admin', adminRoutes);
app.use('/api/orchestrator', digestRoutes);
app.use('/api/tools', toolsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────
// CHAT PANEL — static build del chat
// ─────────────────────────────────────────
const chatStatic = express.static(path.join(__dirname, '../public/chat'));
app.use('/chat', (req, res, next) => {
  // Servir index.html del chat para cualquier ruta /chat/*
  req.url = req.url.split('?')[0];
  if (!path.extname(req.url) || req.url === '/') {
    return res.sendFile('index.html', { root: path.join(__dirname, '../public/chat') });
  }
  chatStatic(req, res, next);
});

// SPA catch-all
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile('index.html', { root: 'public' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─────────────────────────────────────────
// CRON JOBS — Tareas automáticas
// ─────────────────────────────────────────
let cronNightShiftStarted = false;

function startCronJobs() {
  if (cronNightShiftStarted) return;
  cronNightShiftStarted = true;

  // Night shift V2: cada día a las 8:00 AM (hora del servidor)
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Iniciando night shift V2 automático...');
    try {
      const { runNightShiftV2 } = require('./services/agentWorker');
      await runNightShiftV2();
      console.log('[CRON] Night shift V2 completado');
    } catch (err) {
      console.error('[CRON] Error en night shift:', err.message);
    }
  }, {
    timezone: 'Europe/Madrid'
  });

  console.log('[CRON] Jobs programados: Night shift V2 diario a las 8:00 AM (Madrid)');
}

app.listen(PORT, () => {
  console.log(`🚀 MyCompi corriendo en puerto ${PORT}`);
  startCronJobs();
});

module.exports = app;
