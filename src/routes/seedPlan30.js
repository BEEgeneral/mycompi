/**
 * POST /api/clientes/:id/seed-plan-30dias
 * Crea las tareas del plan 30 días para un cliente.
 * Lo llama Paco automáticamente al terminar el onboarding.
 */
const { pool } = require('../models/db');
const { seed } = require('../../scripts/seed-plan-30dias');
const express = require('express');
const router = express.Router();

router.post('/:id/seed-plan-30dias', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el cliente existe
    const cliente = await pool.query(
      `SELECT id, nombre FROM "Cliente" WHERE id = $1`,
      [id]
    );
    if (cliente.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    console.log(`🌱 Seed plan 30 días para cliente: ${cliente.rows[0].nombre} (${id})`);

    // Verificar que no tenga ya trabajos del plan (evitar duplicados)
    const existing = await pool.query(
      `SELECT COUNT(*) FROM "Trabajo" WHERE "clienteId" = $1 AND (titulo LIKE '🔍%' OR titulo LIKE '📋%') LIMIT 1`,
      [id]
    );

    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Este cliente ya tiene un plan 30 días activo',
        trabajos: parseInt(existing.rows[0].count),
      });
    }

    // Ejecutar seed
    await seed(id);

    // Responder
    res.json({
      ok: true,
      cliente: cliente.rows[0].nombre,
      mensaje: 'Plan 30 días creado. Los agentes han recibido sus tareas.',
    });
  } catch (err) {
    console.error('Error seed-plan-30dias:', err);
    res.status(500).json({ error: 'Error interno al crear el plan de 30 días' });
  }
});

module.exports = router;
