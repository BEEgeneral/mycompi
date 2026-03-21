require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Log de inicio
console.log('🚀 MyCompi starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'NOT SET');

// Inicializar DB (optional - app works without)
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
const adminRoutes = require('./routes/admin');

app.use('/api/clientes', clientesRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/trabajos', trabajosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/auth', authRoutes.router);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 MyCompi corriendo en puerto ${PORT}`);
});

module.exports = app;
