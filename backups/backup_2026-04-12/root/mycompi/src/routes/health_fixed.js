const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, "ultimoHeartbeat", "activoHeartbeat", "tokensUsadosMes", "budgetTokensMes" FROM "Agente" WHERE activo = true'
    );
    const agentes = result.rows;
    const now = new Date();
    const checks = agentes.map(a => {
      const msSinceHb = a.ultimoHeartbeat ? (now - new Date(a.ultimoHeartbeat)) : null;
      const status = !a.ultimoHeartbeat ? 'unknown'
        : msSinceHb < 5 * 60 * 1000 ? 'ok'
        : msSinceHb < 30 * 60 * 1000 ? 'degraded'
        : 'offline';
      const budgetPct = a.budgetTokensMes ? Math.round((parseInt(a.tokensUsadosMes||0) / parseInt(a.budgetTokensMes||1)) * 100) : 0;
      return {
        agenteId: a.id,
        nombre: a.nombre,
        status,
        msSinceHeartbeat: msSinceHb,
        budgetPct,
        tokensUsados: a.tokensUsadosMes,
        budgetTokens: a.budgetTokensMes
      };
    });
    res.json({ checks, timestamp: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
