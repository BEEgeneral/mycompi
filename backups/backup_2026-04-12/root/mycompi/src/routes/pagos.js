const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Planes disponibles
const PLANES = {
  basico: { precio: 10, agentes: 1, nombre: '1 Agente' },
  equipo: { precio: 49, agentes: 6, nombre: 'Equipo (Manager + 5)' },
  direccion: { precio: 150, agentes: 10, nombre: 'Equipo + Dirección' },
  completo: { precio: 269, agentes: 20, nombre: 'Completo' }
};

// Obtener planes disponibles
router.get('/planes', (req, res) => {
  res.json(PLANES);
});

// Obtener suscripción actual
router.get('/suscripcion', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT plan, estado FROM clientes WHERE id = $1`,
      [req.clienteId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    const plan = result.rows[0];
    res.json({
      plan: plan.plan,
      estado: plan.estado,
      ...PLANES[plan.plan]
    });
  } catch (err) {
    console.error('Error obteniendo suscripción:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Cambiar plan
router.put('/plan', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!PLANES[plan]) {
      return res.status(400).json({ error: 'Plan inválido' });
    }
    
    const result = await pool.query(
      `UPDATE clientes SET plan = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [plan, req.clienteId]
    );
    
    res.json({ 
      message: 'Plan actualizado',
      plan: result.rows[0].plan,
      ...PLANES[result.rows[0].plan]
    });
  } catch (err) {
    console.error('Error cambiando plan:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener historial de pagos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM pagos WHERE cliente_id = $1 ORDER BY created_at DESC`,
      [req.clienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo pagos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear pago (simulado - en producción usaría Stripe)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cantidad, concepto, stripe_payment_id } = req.body;
    
    const result = await pool.query(
      `INSERT INTO pagos (cliente_id, cantidad, concepto, stripe_payment_id, status, fecha_pago) 
       VALUES ($1, $2, $3, $4, 'completado', CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.clienteId, cantidad, concepto, stripe_payment_id || 'simulado']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando pago:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Webhook de Stripe (placeholder)
router.post('/webhook', async (req, res) => {
  const { type, data } = req.body;
  
  // En producción: verificar firma de Stripe
  // Procesar evento según type
  
  console.log(`Webhook recibido: ${type}`);
  
  res.json({ received: true });
});

// Obtener balance (simulado)
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    // En producción: obtener de Stripe Connect
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(cantidad), 0) as total_ingresos,
        COUNT(*) as total_pagos
       FROM pagos 
       WHERE cliente_id = $1 AND status = 'completado'`,
      [req.clienteId]
    );
    
    res.json({
      balance: parseFloat(result.rows[0].total_ingresos),
      totalPagos: parseInt(result.rows[0].total_pagos)
    });
  } catch (err) {
    console.error('Error obteniendo balance:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
