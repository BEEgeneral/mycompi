/**
 * notificaciones.js — Notificaciones proactivas
 *
 * POST /api/notificaciones/interna  → crear notificación (agentes, con API key)
 * POST /api/notificaciones           → crear notificación (cliente auth)
 * GET  /api/notificaciones           → listar notificaciones del cliente
 * GET  /api/notificaciones/no-leidas → contar no leídas
 * PATCH /api/notificaciones/:id/leida → marcar como leída
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

const AGENT_API_KEY = process.env.AGENT_API_KEY || 'mycompi-agent-secret';

// ─────────────────────────────────────────
// Crear notificación (interno — llamado por agentes)
// POST /api/notificaciones/interna
// ─────────────────────────────────────────
router.post('/interna', async (req, res) => {
  const key = req.headers['x-agent-key'];
  if (key !== AGENT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { clienteId, agenteId, tipo, titulo, contenido } = req.body;

  if (!clienteId || !titulo || !contenido) {
    return res.status(400).json({ error: 'clienteId, titulo y contenido requeridos' });
  }

  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        clienteId,
        agenteId: agenteId || 'sistema',
        tipo: tipo || 'INFO',
        titulo: titulo.slice(0, 200),
        contenido: contenido.slice(0, 1000),
      }
    });
    res.json({ ok: true, id: notificacion.id });
  } catch (err) {
    console.error('Error creando notificación interna:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Crear notificación (cliente auth)
// POST /api/notificaciones
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { agenteId, tipo, titulo, contenido } = req.body;

  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'titulo y contenido requeridos' });
  }

  const clienteId = req.clienteId;

  try {
    const notificacion = await prisma.notificacion.create({
      data: {
        clienteId,
        agenteId: agenteId || 'paco',
        tipo: tipo || 'INFO',
        titulo: titulo.slice(0, 200),
        contenido,
      }
    });

    res.json({ ok: true, id: notificacion.id });
  } catch (err) {
    console.error('Error creando notificación:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Listar notificaciones (con paginación)
// GET /api/notificaciones?limit=20&offset=0
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;
  const clienteId = req.clienteId;
  const soloNoLeidas = req.query['solo-no-leidas'] === 'true';

  const where = { clienteId };
  if (soloNoLeidas) {
    where.leida = false;
  }

  try {
    const [notificaciones, total] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          agenteId: true,
          tipo: true,
          titulo: true,
          contenido: true,
          leida: true,
          createdAt: true,
        }
      }),
      prisma.notificacion.count({ where })
    ]);

    res.json({ data: notificaciones, total });
  } catch (err) {
    console.error('Error listando notificaciones:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Contar no leídas
// GET /api/notificaciones/no-leidas
// ─────────────────────────────────────────
router.get('/no-leidas', authMiddleware, async (req, res) => {
  const clienteId = req.clienteId;

  try {
    const count = await prisma.notificacion.count({
      where: { clienteId, leida: false }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Marcar como leída
// PATCH /api/notificaciones/:id/leida
// ─────────────────────────────────────────
router.patch('/:id/leida', authMiddleware, async (req, res) => {
  try {
    await prisma.notificacion.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { leida: true }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

// ─────────────────────────────────────────
// Marcar todas como leídas
// POST /api/notificaciones/marcar-todas-leidas
// ─────────────────────────────────────────
router.post('/marcar-todas-leidas', authMiddleware, async (req, res) => {
  const clienteId = req.clienteId;

  try {
    await prisma.notificacion.updateMany({
      where: { clienteId, leida: false },
      data: { leida: true }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = { router };
