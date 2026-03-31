/**
 * POST /api/trabajos/:id/aprobar
 * Cliente aprueba un trabajo que requiere confirmación
 *
 * POST /api/trabajos/:id/rechazar
 * Cliente rechaza un trabajo
 *
 * GET  /api/trabajos/:id/approvals
 * Historial de aprobaciones de un trabajo
 */
const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

const AUDIT_ACTIONS = {
  APPROVE: 'JOB_APROBADO',
  REJECT: 'JOB_RECHAZADO',
  REQUEST: 'SOLICITUD_APROBACION',
};

// ─── APROBAR ───
router.post('/:id/aprobar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body || {};

    // Verificar que el trabajo existe y es del cliente
    const job = await pool.query(
      `SELECT * FROM "Trabajo" WHERE id = $1 AND clienteid = $2`,
      [id, req.clienteId]
    );
    if (job.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    const trabajo = job.rows[0];

    if (!trabajo.requiereAprobacion) {
      return res.status(400).json({ error: 'Este trabajo no requiere aprobación' });
    }
    if (trabajo.aprobadoAt) {
      return res.status(409).json({ error: 'Este trabajo ya fue aprobado o rechazado' });
    }

    // Aprobar
    await pool.query(
      `UPDATE "Trabajo" SET "aprobadoPor" = $1, "aprobadoAt" = NOW(), "notaAprobacion" = $2 WHERE id = $3`,
      [req.usuarioId, nota || null, id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO "AuditLog" (id, clienteid, agenteid, accion, recursotipo, recursoid, detalle, createdat)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [req.clienteId, trabajo.agenteId, AUDIT_ACTIONS.APPROVE, 'Trabajo', id,
        JSON.stringify({ trabajo: trabajo.titulo, aprobadoPor: req.usuarioId, nota })]
    );

    // Notificar al cliente
    await pool.query(
      `INSERT INTO "Notificacion" (id, clienteid, agenteid, tipo, titulo, contenido, createdat)
       VALUES (gen_random_uuid(), $1, $2, 'INFO', $3, $4, NOW())`,
      [req.clienteId, trabajo.agenteId,
        `✅ Trabajo aprobado: ${trabajo.titulo.substring(0, 50)}`,
        nota ? `Aprobado con nota: ${nota}` : 'Aprobado. El agente puede empezar.']
    );

    res.json({ ok: true, mensaje: 'Trabajo aprobado' });
  } catch (err) {
    console.error('Error aprobar:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── RECHAZAR ───
router.post('/:id/rechazar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body || {};

    const job = await pool.query(
      `SELECT * FROM "Trabajo" WHERE id = $1 AND clienteid = $2`,
      [id, req.clienteId]
    );
    if (job.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    const trabajo = job.rows[0];

    await pool.query(
      `UPDATE "Trabajo" SET "aprobadoPor" = $1, "aprobadoAt" = NOW(), "notaAprobacion" = $2 WHERE id = $3`,
      [req.usuarioId, nota || 'Rechazado por el cliente', id]
    );

    await pool.query(
      `UPDATE "Trabajo" SET estado = 'BLOCKED' WHERE id = $1`,
      [id]
    );

    await pool.query(
      `INSERT INTO "AuditLog" (id, clienteid, agenteid, accion, recursotipo, recursoid, detalle, createdat)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [req.clienteId, trabajo.agenteId, AUDIT_ACTIONS.REJECT, 'Trabajo', id,
        JSON.stringify({ trabajo: trabajo.titulo, razon: nota })]
    );

    res.json({ ok: true, mensaje: 'Trabajo rechazado y bloqueado' });
  } catch (err) {
    console.error('Error rechazar:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── HISTORIAL DE APROBACIONES ───
router.get('/:id/approvals', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const job = await pool.query(
      `SELECT * FROM "Trabajo" WHERE id = $1 AND clienteid = $2`,
      [id, req.clienteId]
    );
    if (job.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    const t = job.rows[0];
    res.json({
      requiereAprobacion: t.requiereAprobacion,
      aprobadoPor: t.aprobadoPor,
      aprobadoAt: t.aprobadoAt,
      notaAprobacion: t.notaAprobacion,
      estado: t.estado,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
