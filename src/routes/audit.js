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
    let query = `SELECT * FROM "AuditLog" WHERE clienteid = $1`;
    const params = [req.clienteId];

    if (accion) {
      params.push(accion);
      query += ` AND accion = $${params.length}`;
    }
    if (agenteId) {
      params.push(agenteId);
      query += ` AND agenteid = $${params.length}`;
    }

    params.push(parseInt(limit), parseInt(offset));
    query += ` ORDER BY createdat DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

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
       WHERE clienteid = $1 AND agenteid = $2
       ORDER BY createdat DESC LIMIT $3`,
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
        agenteid,
        COUNT(*) as acciones,
        SUM("tokensusados") as total_tokens,
        SUM("costeeuros") as total_eur,
        MAX(createdat) as ultimo_uso
      FROM "TokenUsage"
      WHERE clienteid = $1
    `;
    const params = [req.clienteId];

    if (agenteId) {
      params.push(agenteId);
      query += ` AND agenteid = $${params.length}`;
    }

    query += ` GROUP BY agenteid ORDER BY total_tokens DESC NULLS LAST`;

    const result = await pool.query(query, params);
    res.json({ usage: result.rows });
  } catch (err) {
    console.error('Error tokens:', err.message, '| code:', err.code, '| pos:', err.position);
    res.status(500).json({ error: 'Error interno: ' + err.message.substring(0, 80) });
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
      `INSERT INTO "AuditLog" (id, clienteid, agenteid, accion, recursotipo, recursoid, detalle, costetokens, createdat)
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
