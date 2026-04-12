/**
 * cola.js — Cola de tareas por agente
 *
 * POST /api/cola           → crear tarea
 * GET  /api/cola           → listar tareas (filtrable por agente, estado)
 * GET  /api/cola/:id       → ver tarea
 * PATCH /api/cola/:id       → actualizar estado/progreso
 * POST /api/cola/:id/complete → marcar completada con resultado
 * POST /api/cola/:id/fail    → marcar como fallida
 * POST /api/cola/:id/assign   → asignar a agente
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// Crear tarea
// POST /api/cola
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { titulo, descripcion, prioridad, agenteId, tags, inputData } = req.body;
  const clienteId = req.clienteId;

  if (!titulo?.trim()) {
    return res.status(400).json({ error: 'Título requerido' });
  }

  try {
    // Si no se especifica agente,去找 Paco como orquestador
    const agenteDestino = agenteId || 'paco';

    const tarea = await prisma.trabajo.create({
      data: {
        clienteId,
        agenteId: agenteDestino,
        titulo: titulo.trim().slice(0, 200),
        descripcion: descripcion?.trim() || null,
        prioridad: prioridad || 'MEDIA',
        estado: 'TODO',
        tags: tags || [],
        inputData: inputData || null,
      }
    });

    res.status(201).json({ ok: true, tarea });
  } catch (err) {
    console.error('Error creando tarea:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Listar tareas
// GET /api/cola?agenteId=laura&estado=TODO&limit=50&offset=0
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const clienteId = req.clienteId;
  const { agenteId, estado, prioridad, limit = 50, offset = 0 } = req.query;

  const where = { clienteId };
  if (agenteId) where.agenteId = agenteId;
  if (estado) where.estado = estado;
  if (prioridad) where.prioridad = prioridad;

  try {
    const [tareas, total] = await Promise.all([
      prisma.trabajo.findMany({
        where,
        orderBy: [
          { prioridad: 'desc' }, // CRITICA > ALTA > MEDIA > BAJA
          { createdAt: 'desc' }
        ],
        take: Math.min(parseInt(limit), 100),
        skip: parseInt(offset),
        include: {
          agente: { select: { id: true, nombre: true, email: true } }
        }
      }),
      prisma.trabajo.count({ where })
    ]);

    res.json({ tareas, total });
  } catch (err) {
    console.error('Error listando tareas:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Ver tarea
// GET /api/cola/:id
// ─────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clienteId = req.clienteId;

  try {
    const tarea = await prisma.trabajo.findFirst({
      where: { id, clienteId },
      include: {
        agente: { select: { id: true, nombre: true, email: true } }
      }
    });

    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(tarea);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// Actualizar tarea
// PATCH /api/cola/:id
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clienteId = req.clienteId;
  const { estado, prioridad, titulo, descripcion, tags } = req.body;

  const data = {};
  if (estado) data.estado = estado;
  if (prioridad) data.prioridad = prioridad;
  if (titulo !== undefined) data.titulo = titulo.slice(0, 200);
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (tags !== undefined) data.tags = tags;

  try {
    const tarea = await prisma.trabajo.findFirst({
      where: { id, clienteId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const updated = await prisma.trabajo.update({
      where: { id },
      data
    });

    res.json({ ok: true, tarea: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

// ─────────────────────────────────────────
// Completar tarea
// POST /api/cola/:id/complete
// ─────────────────────────────────────────
router.post('/:id/complete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clienteId = req.clienteId;
  const { outputData } = req.body;

  try {
    const tarea = await prisma.trabajo.findFirst({
      where: { id, clienteId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const updated = await prisma.trabajo.update({
      where: { id },
      data: {
        estado: 'COMPLETED',
        completedAt: new Date(),
        outputData: outputData || null,
      }
    });

    res.json({ ok: true, tarea: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error completando tarea' });
  }
});

// ─────────────────────────────────────────
// Marcar tarea como fallida
// POST /api/cola/:id/fail
// ─────────────────────────────────────────
router.post('/:id/fail', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clienteId = req.clienteId;
  const { errorMsg } = req.body;

  try {
    const tarea = await prisma.trabajo.findFirst({
      where: { id, clienteId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const updated = await prisma.trabajo.update({
      where: { id },
      data: {
        estado: 'FAILED',
        errorMsg: errorMsg || 'Error desconocido',
      }
    });

    res.json({ ok: true, tarea: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error marcando tarea' });
  }
});

// ─────────────────────────────────────────
// Asignar tarea a agente
// POST /api/cola/:id/assign
// ─────────────────────────────────────────
router.post('/:id/assign', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const clienteId = req.clienteId;
  const { agenteId } = req.body;

  if (!agenteId) return res.status(400).json({ error: 'agenteId requerido' });

  try {
    const tarea = await prisma.trabajo.findFirst({
      where: { id, clienteId }
    });
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

    const updated = await prisma.trabajo.update({
      where: { id },
      data: { agenteId }
    });

    res.json({ ok: true, tarea: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error asignando tarea' });
  }
});

// ─────────────────────────────────────────
// Resumen de cola (para dashboard)
// GET /api/cola/resumen
// ─────────────────────────────────────────
router.get('/resumen/stats', authMiddleware, async (req, res) => {
  const clienteId = req.clienteId;

  try {
    const [total, pending, inProgress, completed, failed] = await Promise.all([
      prisma.trabajo.count({ where: { clienteId } }),
      prisma.trabajo.count({ where: { clienteId, estado: 'TODO' } }),
      prisma.trabajo.count({ where: { clienteId, estado: 'IN_PROGRESS' } }),
      prisma.trabajo.count({ where: { clienteId, estado: 'COMPLETED' } }),
      prisma.trabajo.count({ where: { clienteId, estado: 'FAILED' } }),
    ]);

    // Tareas por prioridad
    const porPrioridad = await prisma.trabajo.groupBy({
      by: ['prioridad'],
      where: { clienteId, estado: { not: 'COMPLETED' } },
      _count: { id: true }
    });

    // Tareas recientes completadas (últimas 7 días)
    const recentlyCompleted = await prisma.trabajo.count({
      where: {
        clienteId,
        estado: 'COMPLETED',
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    res.json({
      total,
      pending,
      inProgress,
      completed,
      failed,
      recentlyCompleted,
      porPrioridad: porPrioridad.reduce((acc, p) => {
        acc[p.prioridad] = p._count.id;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Error resumen cola:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
