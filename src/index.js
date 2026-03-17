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

// Rutas
const clientesRoutes = require('./routes/clientes');
const agentesRoutes = require('./routes/agentes');
const trabajosRoutes = require('./routes/trabajos');
const pagosRoutes = require('./routes/pagos');
const authRoutes = require('./routes/auth');

app.use('/api/clientes', clientesRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/trabajos', trabajosRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/auth', authRoutes);

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
