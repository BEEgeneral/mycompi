/**
 * GET  /api/audit           — historial de auditoría del cliente
 * GET  /api/audit/agente/:id — auditoría por agente
 * GET  /api/audit/tokens     — uso de tokens por agente
 * POST /api/trabajos/:id/audit — loguear una acción (interno agentes)
 */
const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');
const router = express.Router();

// ─── AUDIT LOG COMPLETO DEL CLIENTE ───
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, offset = 0, accion, agenteId } = req.query;
    let query = `SELECT * FROM "AuditLog" WHERE "clienteId" = $1`;
    const params = [req.clienteId];

    if (accion) {
      params.push(accion);
      query += ` AND accion = $${params.length}`;
    }
    if (agenteId) {
      params.push(agenteId);
      query += ` AND "agenteId" = $${params.length}`;
    }

    params.push(parseInt(limit), parseInt(offset));
    query += ` ORDER BY "createdAt" DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ logs: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error audit:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── AUDIT POR AGENTE ───
router.get('/agente/:agenteId', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const result = await pool.query(
      `SELECT * FROM "AuditLog"
       WHERE "clienteId" = $1 AND "agenteId" = $2
       ORDER BY "createdAt" DESC LIMIT $3`,
      [req.clienteId, req.params.agenteId, parseInt(limit)]
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── USO DE TOKENS POR AGENTE ───
router.get('/tokens', authMiddleware, async (req, res) => {
  try {
    const { agenteId } = req.query;
    let query = `
      SELECT
        "agenteId",
        COUNT(*) as acciones,
        SUM("tokensUsados") as total_tokens,
        SUM("costeEuros") as total_eur,
        MAX("createdAt") as ultimo_uso
      FROM "TokenUsage"
      WHERE "clienteId" = $1
    `;
    const params = [req.clienteId];

    if (agenteId) {
      params.push(agenteId);
      query += ` AND "agenteId" = $${params.length}`;
    }

    query += ` GROUP BY "agenteId" ORDER BY total_tokens DESC NULLS LAST`;

    const result = await pool.query(query, params);
    res.json({ usage: result.rows });
  } catch (err) {
    console.error('Error tokens:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── LOG ACCIÓN (interno — lo usan los agentes) ───
router.post('/log', async (req, res) => {
  try {
    const { agenteKey, clienteId, agenteId, accion, recursoTipo, recursoId, detalle, costeTokens } = req.body;
    if (agenteKey !== process.env.AGENT_API_KEY) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    if (!clienteId || !accion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    await pool.query(
      `INSERT INTO "AuditLog" (id, "clienteId", "agenteId", accion, "recursoTipo", "recursoId", detalle, "costeTokens", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())`,
      [clienteId, agenteId || null, accion, recursoTipo || 'General', recursoId || null,
        detalle ? JSON.stringify(detalle) : null, costeTokens || 0]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error audit log:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
