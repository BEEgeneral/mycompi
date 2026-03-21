/**
 * admin.js — Rutas de administración (MyCompi Admin)
 * 
 * Solo para uso interno de Alberto (owner)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('./auth');
const { listarAgentes, getAgenteInfo, buildContext, logInteraction } = require('../services/agentLoader');

const router = express.Router();

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const AGENTS_PATH = path.join(__dirname, '../../agents');

// Middleware: solo owner puede acceder
async function ownerOnly(req, res, next) {
  // Por ahora, verificamos por header o IP localhost
  // En producción usar auth con rol específico
  const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
  const isOwner = req.headers['x-owner-key'] === process.env.OWNER_KEY;
  
  if (!isLocalhost && !isOwner) {
    return res.status(403).json({ error: 'Acceso denegado. Solo el owner.' });
  }
  next();
}

// ─────────────────────────────────────────
// LISTAR AGENTES
// GET /api/admin/agentes
// ─────────────────────────────────────────

router.get('/agentes', ownerOnly, (req, res) => {
  try {
    const agentes = listarAgentes();
    res.json({ ok: true, agentes });
  } catch (err) {
    console.error('Error listando agentes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// OBTENER AGENTE
// GET /api/admin/agentes/:id
// ─────────────────────────────────────────

router.get('/agentes/:id', ownerOnly, (req, res) => {
  try {
    const { id } = req.params;
    const info = getAgenteInfo(id);
    
    if (!info) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    // Cargar contenido de archivos
    const agentPath = path.join(AGENTS_PATH, info.path);
    const archivos = {};
    
    ['SOUL.md', 'IDENTITY.md', 'SKILL.md', 'MEMORY.md'].forEach(file => {
      const filePath = path.join(agentPath, file);
      if (fs.existsSync(filePath)) {
        archivos[file] = fs.readFileSync(filePath, 'utf8');
      }
    });
    
    res.json({
      ok: true,
      agente: { ...info, archivos },
    });
  } catch (err) {
    console.error('Error obteniendo agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// CREAR / ACTUALIZAR AGENTE
// PUT /api/admin/agentes/:id
// ─────────────────────────────────────────

router.put('/agentes/:id', ownerOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, emoji, soul, identity, skill, memory } = req.body;
    
    // Obtener path del agente
    const { AGENTS } = require('../services/agentLoader');
    const config = AGENTS[id];
    
    if (!config) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    const agentPath = path.join(AGENTS_PATH, config.path);
    
    // Crear directorio si no existe
    if (!fs.existsSync(agentPath)) {
      fs.mkdirSync(path.join(agentPath, 'overlays'), { recursive: true });
      fs.mkdirSync(path.join(agentPath, 'scripts'), { recursive: true });
    }
    
    // Guardar archivos
    const updates = [];
    
    if (soul !== undefined) {
      fs.writeFileSync(path.join(agentPath, 'SOUL.md'), soul);
      updates.push('SOUL.md');
    }
    
    if (identity !== undefined) {
      fs.writeFileSync(path.join(agentPath, 'IDENTITY.md'), identity);
      updates.push('IDENTITY.md');
    }
    
    if (skill !== undefined) {
      fs.writeFileSync(path.join(agentPath, 'SKILL.md'), skill);
      updates.push('SKILL.md');
    }
    
    if (memory !== undefined) {
      fs.writeFileSync(path.join(agentPath, 'MEMORY.md'), memory);
      updates.push('MEMORY.md');
    }
    
    res.json({
      ok: true,
      agente: id,
      actualizados: updates,
    });
  } catch (err) {
    console.error('Error actualizando agente:', err);
    res.status(500).json({ error: 'Error al guardar' });
  }
});

// ─────────────────────────────────────────
// CREAR NUEVO AGENTE
// POST /api/admin/agentes
// ─────────────────────────────────────────

router.post('/agentes', ownerOnly, (req, res) => {
  try {
    const { id, nombre, emoji } = req.body;
    
    if (!id || !nombre) {
      return res.status(400).json({ error: 'id y nombre son requeridos' });
    }
    
    // Normalizar id (lowercase, no espacios)
    const agentId = id.toLowerCase().replace(/\s+/g, '-');
    const agentPath = path.join(AGENTS_PATH, agentId);
    
    if (fs.existsSync(agentPath)) {
      return res.status(400).json({ error: 'Ya existe un agente con ese id' });
    }
    
    // Crear estructura
    fs.mkdirSync(path.join(agentPath, 'overlays'), { recursive: true });
    fs.mkdirSync(path.join(agentPath, 'scripts'), { recursive: true });
    
    // Archivos base
    const identityContent = `# IDENTITY.md — Agente ${nombre} MyCompi

- **Nombre:** ${nombre}
- **Rol:** ${req.body.rol || 'Agente'}
- **Organización:** MyCompi
- **Tipo:** Agente IA
- **Emoji:** ${emoji || '🤖'}
- **Canal principal:** Texto
`;

    const soulContent = soul || `# SOUL.md — Agente ${nombre} MyCompi

## Quién soy

Soy **${nombre}**, un profesional digital especializado en ${req.body.especialidad || 'tu área'}.

## Mi filosofía

[Completa esta sección]

## Mi expertise

- [ Lista de capacidades ]

## Mi estilo

- [ Cómo te comunicas ]
`;

    fs.writeFileSync(path.join(agentPath, 'IDENTITY.md'), identityContent);
    fs.writeFileSync(path.join(agentPath, 'SOUL.md'), soulContent);
    fs.writeFileSync(path.join(agentPath, 'SKILL.md'), '# SKILL.md\n\n## Capacidades\n\n[Define qué sabe hacer este agente]');
    fs.writeFileSync(path.join(agentPath, 'MEMORY.md'), '# MEMORY.md\n\n## Aprendizaje acumulado\n\n_Inicializado: ' + new Date().toISOString().split('T')[0] + '_\n');

    res.json({
      ok: true,
      agente: {
        id: agentId,
        nombre,
        emoji: emoji || '🤖',
        path: agentId,
      },
      mensaje: 'Agente creado. Edita SOUL.md para definir su personalidad.',
    });
  } catch (err) {
    console.error('Error creando agente:', err);
    res.status(500).json({ error: 'Error al crear agente' });
  }
});

// ─────────────────────────────────────────
// VER OVERLAYS DE UN AGENTE
// GET /api/admin/agentes/:id/clientes
// ─────────────────────────────────────────

router.get('/agentes/:id/clientes', ownerOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { AGENTS } = require('../services/agentLoader');
    const config = AGENTS[id];
    
    if (!config) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    const overlaysPath = path.join(AGENTS_PATH, config.path, 'overlays');
    
    if (!fs.existsSync(overlaysPath)) {
      return res.json({ ok: true, clientes: [] });
    }
    
    const clientes = fs.readdirSync(overlaysPath).filter(f => {
      const userPath = path.join(overlaysPath, f, 'USER.md');
      return fs.existsSync(userPath);
    });
    
    res.json({ ok: true, agentes: id, clientes });
  } catch (err) {
    console.error('Error listando clientes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// VER / EDITAR OVERLAY DE UN CLIENTE
// GET/PUT /api/admin/agentes/:id/clientes/:clienteId
// ─────────────────────────────────────────

router.get('/agentes/:id/clientes/:clienteId', ownerOnly, (req, res) => {
  try {
    const { id, clienteId } = req.params;
    const { AGENTS } = require('../services/agentLoader');
    const config = AGENTS[id];
    
    if (!config) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    const clientPath = path.join(AGENTS_PATH, config.path, 'overlays', clienteId);
    
    if (!fs.existsSync(clientPath)) {
      return res.status(404).json({ error: 'Cliente no encontrado para este agente' });
    }
    
    const userPath = path.join(clientPath, 'USER.md');
    const memoriaPath = path.join(clientPath, 'memoria');
    
    const user = fs.existsSync(userPath) ? fs.readFileSync(userPath, 'utf8') : '';
    
    let memoria = [];
    if (fs.existsSync(memoriaPath)) {
      memoria = fs.readdirSync(memoriaPath)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          fecha: f.replace('.md', ''),
          contenido: fs.readFileSync(path.join(memoriaPath, f), 'utf8'),
        }));
    }
    
    res.json({
      ok: true,
      agente: id,
      cliente: clienteId,
      user,
      memoria,
    });
  } catch (err) {
    console.error('Error obteniendo overlay:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.put('/agentes/:id/clientes/:clienteId', ownerOnly, (req, res) => {
  try {
    const { id, clienteId } = req.params;
    const { user } = req.body;
    const { AGENTS } = require('../services/agentLoader');
    const config = AGENTS[id];
    
    if (!config) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    const clientPath = path.join(AGENTS_PATH, config.path, 'overlays', clienteId);
    
    if (!fs.existsSync(clientPath)) {
      fs.mkdirSync(path.join(clientPath, 'memoria'), { recursive: true });
    }
    
    if (user !== undefined) {
      fs.writeFileSync(path.join(clientPath, 'USER.md'), user);
    }
    
    res.json({ ok: true, agente: id, cliente: clienteId });
  } catch (err) {
    console.error('Error actualizando overlay:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// DASHBOARD DE COSTOS Y MÉTRICAS
// GET /api/admin/metrics/dashboard
// ─────────────────────────────────────────

router.get('/metrics/dashboard', ownerOnly, (req, res) => {
  try {
    const tokenController = require('../services/tokenController');
    const dashboard = tokenController.dashboard();
    res.json({ ok: true, ...dashboard });
  } catch (err) {
    console.error('Error obteniendo dashboard:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// MÉTRICAS DE UN CLIENTE
// GET /api/admin/metrics/cliente/:id
// ─────────────────────────────────────────

router.get('/metrics/cliente/:id', ownerOnly, (req, res) => {
  try {
    const { id } = req.params;
    const tokenController = require('../services/tokenController');
    const metricas = tokenController.metricasCliente(id);
    res.json({ ok: true, ...metricas });
  } catch (err) {
    console.error('Error obteniendo metricas cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// ESTADO DEL TOKEN CONTROLLER
// GET /api/admin/metrics/estado
// ─────────────────────────────────────────

router.get('/metrics/estado', ownerOnly, (req, res) => {
  try {
    const tokenController = require('../services/tokenController');
    const estado = tokenController.estado();
    res.json({ ok: true, ...estado });
  } catch (err) {
    console.error('Error obteniendo estado:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// HISTORIAL DE LOGS (últimos)
// GET /api/admin/metrics/logs
// ─────────────────────────────────────────

router.get('/metrics/logs', ownerOnly, (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const fs = require('fs');
    const path = require('path');
    const logsFile = path.join(__dirname, '../../data/token-logs.json');

    if (!fs.existsSync(logsFile)) {
      return res.json({ ok: true, logs: [] });
    }

    const logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    const recientes = logs.slice(-Math.min(parseInt(limit), 500)).reverse();

    res.json({ ok: true, total: logs.length, logs: recientes });
  } catch (err) {
    console.error('Error obteniendo logs:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// MODELOS DISPONIBLES Y SUS COSTOS
// GET /api/admin/metricos/modelos
// ─────────────────────────────────────────

router.get('/metrics/modelos', ownerOnly, (req, res) => {
  try {
    const { MODELOS } = require('../services/tokenController');
    res.json({ ok: true, modelos: MODELOS });
  } catch (err) {
    console.error('Error obteniendo modelos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// PLANES DISPONIBLES
// GET /api/admin/metricos/planes
// ─────────────────────────────────────────

router.get('/metrics/planes', ownerOnly, (req, res) => {
  try {
    const { PLANES } = require('../services/tokenController');
    res.json({ ok: true, planes: PLANES });
  } catch (err) {
    console.error('Error obteniendo planes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
