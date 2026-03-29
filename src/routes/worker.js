/**
 * worker.js — Endpoints para trigger manual del agent worker
 *
 * POST /api/worker/execute/:taskId  → ejecutar una tarea específica
 * POST /api/worker/process/:clienteId → procesar tareas pendientes de un cliente
 * POST /api/worker/nightshift       → ejecutar night shift manualmente
 * GET  /api/worker/status           → estado del worker
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { executeTask, processPendingTasks, runNightShift, runOnboardingResearch } = require('../services/agentWorker');

// ─────────────────────────────────────────
// Ejecutar una tarea específica
// POST /api/worker/execute/:taskId
// ─────────────────────────────────────────
router.post('/execute/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;

  try {
    console.log(`[Worker] Ejecutando tarea ${taskId} por request de ${req.usuario.email}`);
    const resultado = await executeTask(taskId);
    res.json({ ok: true, taskId, ...resultado });
  } catch (err) {
    console.error(`[Worker] Error ejecutando ${taskId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Procesar tareas pendientes de un cliente
// POST /api/worker/process/:clienteId
// Admin only
// ─────────────────────────────────────────
router.post('/process/:clienteId', authMiddleware, async (req, res) => {
  if (req.usuario.rol_platform !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo administradores' });
  }

  const { clienteId } = req.params;

  try {
    console.log(`[Worker] Procesando tareas para cliente ${clienteId}`);
    const resultados = await processPendingTasks(clienteId);
    res.json({ ok: true, clienteId, resultados });
  } catch (err) {
    console.error(`[Worker] Error procesando cliente ${clienteId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Trigger night shift manualmente
// POST /api/worker/nightshift
// Admin only
// ─────────────────────────────────────────
router.post('/nightshift', authMiddleware, async (req, res) => {
  if (req.usuario.rol_platform !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo administradores' });
  }

  try {
    console.log(`[Worker] Night shift triggered by ${req.usuario.email}`);
    await runNightShift();
    res.json({ ok: true, mensaje: 'Night shift completado' });
  } catch (err) {
    console.error('[Worker] Error en night shift:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Trigger onboarding research para un cliente
// POST /api/worker/research/:clienteId
// Admin only
// ─────────────────────────────────────────
router.post('/research/:clienteId', authMiddleware, async (req, res) => {
  if (req.usuario.rol_platform !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo administradores' });
  }

  const { clienteId } = req.params;

  // Ejecutar async y responder inmediatamente
  res.json({ ok: true, mensaje: 'Research iniciado en background' });

  try {
    console.log(`[Worker] Onboarding research para cliente ${clienteId}`);
    const resultado = await runOnboardingResearch(clienteId);
    console.log(`[Worker] Research completado:`, resultado);
  } catch (err) {
    console.error(`[Worker] Error en research ${clienteId}:`, err.message);
  }
});

// ─────────────────────────────────────────
// Status del worker
// GET /api/worker/status
// ─────────────────────────────────────────
router.get('/status', authMiddleware, async (req, res) => {
  if (req.usuario.rol_platform !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo administradores' });
  }

  const { prisma } = require('../lib/db');

  try {
    const [total, pending, inProgress, completed, failed] = await Promise.all([
      prisma.trabajo.count(),
      prisma.trabajo.count({ where: { estado: 'TODO' } }),
      prisma.trabajo.count({ where: { estado: 'IN_PROGRESS' } }),
      prisma.trabajo.count({ where: { estado: 'COMPLETED' } }),
      prisma.trabajo.count({ where: { estado: 'FAILED' } }),
    ]);

    res.json({
      worker: 'online',
      tareas: { total, pending, inProgress, completed, failed },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
