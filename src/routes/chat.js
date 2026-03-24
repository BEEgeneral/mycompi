/**
 * chat.js — Chat del cliente con el Orquestador
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// GUARDAR INTERACCIÓN
// POST /api/chat/interaccion
// ─────────────────────────────────────────
router.post('/interaccion', authMiddleware, async (req, res) => {
  const { tipoPeticion, mensajeOriginal, respuestaAgente, clienteAcepta } = req.body;
  if (!tipoPeticion || !mensajeOriginal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId: req.clienteId,
        agenteId: 'orquestador',
        tipoPeticion,
        mensajeOriginal,
        respuestaAgente,
        clienteAcepta: clienteAcepta ?? null,
      }
    });
    res.json({ ok: true, interaccion });
  } catch (err) {
    console.error('Error guardando interaccion:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// OBTENER ÚLTIMAS INTERACCIONES
// GET /api/chat/interacciones?limit=20
// ─────────────────────────────────────────
router.get('/interacciones', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    const interacciones = await prisma.interaccionChat.findMany({
      where: { clienteId: req.clienteId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        tipoPeticion: true,
        mensajeOriginal: true,
        resumen: true,
        respuestaAgente: true,
        clienteAcepta: true,
        resultadoExitoso: true,
        createdAt: true,
        agente: { select: { nombre: true, emoji: true } },
      }
    });
    res.json({ interacciones });
  } catch (err) {
    console.error('Error obteniendo interacciones:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// CONFIRMAR / RECHAZAR INTERACCIÓN
// POST /api/chat/interaccion/:id/acepta
// POST /api/chat/interaccion/:id/rechaza
// ─────────────────────────────────────────
router.post('/interaccion/:id/acepta', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: true },
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

router.post('/interaccion/:id/rechaza', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: false },
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

// ─────────────────────────────────────────
// ACTUALIZAR RESULTADO (post-ejecución)
// POST /api/chat/interaccion/:id/resultado
// ─────────────────────────────────────────
router.post('/interaccion/:id/resultado', authMiddleware, async (req, res) => {
  const { resultadoExitoso } = req.body;
  try {
    const updated = await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { resultadoExitoso: resultadoExitoso ?? null },
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

module.exports = router;
