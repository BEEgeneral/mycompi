/**
 * Rutas de agentes — CRUD completo
 * Tabla: Agente (clienteId, nombre, tipo, budgetTokensMes, tokensUsadosMes, etc.)
 */
const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// ─── GET /api/agentes ─── Todos los agentes del cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "Agente" WHERE "clienteId" = $1 ORDER BY "createdAt" DESC`,
      [req.clienteId]
    );
    res.json({ agentes: result.rows });
  } catch (err) {
    console.error('Error obteniendo agentes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── GET /api/agentes/:id ─── Un agente específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "Agente" WHERE id = $1 AND "clienteId" = $2`,
      [req.params.id, req.clienteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error obteniendo agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── POST /api/agentes ─── Crear agente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, tipo, email, personalidad, bio, habilidades, horario, config, estado } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre requerido' });

    const result = await pool.query(
      `INSERT INTO "Agente" ("clienteId", nombre, tipo, email, personalidad, bio, habilidades, horario, config, estado, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [req.clienteId, nombre, tipo || 'SUPPORT', email || null, personalidad || null, bio || null,
       habilidades || null, horario || null, config ? JSON.stringify(config) : '{}', estado || 'ACTIVE']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── PUT /api/agentes/:id ─── Actualizar agente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, tipo, email, personalidad, bio, habilidades, horario, config, estado,
            budgetTokensMes, alertaPorcentaje, tokensUsadosMes } = req.body;

    const result = await pool.query(
      `UPDATE "Agente" SET
        nombre = COALESCE($1, nombre),
        tipo = COALESCE($2, tipo),
        email = COALESCE($3, email),
        personalidad = COALESCE($4, personalidad),
        bio = COALESCE($5, bio),
        habilidades = COALESCE($6, habilidades),
        horario = COALESCE($7, horario),
        config = COALESCE($8, config),
        estado = COALESCE($9, estado),
        "budgetTokensMes" = COALESCE($10, "budgetTokensMes"),
        "alertaPorcentaje" = COALESCE($11, "alertaPorcentaje"),
        "tokensUsadosMes" = COALESCE($12, "tokensUsadosMes"),
        "updatedAt" = NOW()
       WHERE id = $13 AND "clienteId" = $14
       RETURNING *`,
      [nombre, tipo, email, personalidad, bio, habilidades, horario,
       config ? JSON.stringify(config) : null, estado,
       budgetTokensMes, alertaPorcentaje, tokensUsadosMes,
       req.params.id, req.clienteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── DELETE /api/agentes/:id ─── Eliminar agente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM "Agente" WHERE id = $1 AND "clienteId" = $2 RETURNING id`,
      [req.params.id, req.clienteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
