const express = require('express');
const router = express.Router();
const { pool } = require('../models/db');
const { authMiddleware, ownerOnly } = require('./auth');

router.get('/metrics/business', ownerOnly, async (req, res) => {
  try {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const sieteDias = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [clientes, agentes, trabajos, pagos, notificaciones] = await Promise.all([
      pool.query('SELECT id, plan FROM "Cliente" WHERE activo = true'),
      pool.query('SELECT id, nombre, "activoHeartbeat" FROM "Agente"'),
      pool.query('SELECT estado, "createdAt" FROM "Trabajo" WHERE "createdAt" >= $1', [inicioMes]),
      pool.query('SELECT monto FROM "Pago" WHERE "fechaPago" >= $1 AND estado = $2', [inicioMes, 'COMPLETED']),
      pool.query('SELECT count(*) as c FROM "Notificacion" WHERE "createdAt" >= $1', [sieteDias]),
    ]);

    const precios = { BASICO: 49, ESTANDAR: 99, PREMIUM: 199, COMPLETO: 49 };
    const mrrFromPagos = pagos.rows.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    const mrrFromPlanes = clientes.rows.reduce((sum, c) => sum + (precios[c.plan] || 49), 0);
    const mrr = mrrFromPagos > 0 ? mrrFromPagos : mrrFromPlanes;
    const mrrSource = mrrFromPagos > 0 ? 'pagos_stripe' : 'planes';

    const clientesActivos = clientes.rows.length;
    const agentesActivos = agentes.rows.filter(a => a.activoHeartbeat).length;
    const trabajosCompletados = trabajos.rows.filter(t => t.estado === 'COMPLETED').length;
    const trabajosPendientes = trabajos.rows.filter(t => t.estado !== 'COMPLETED').length;

    const funnel = {
      registros: clientes.rows.length,
      emailVerificado: clientes.rows.length,
      primerAcceso: clientesActivos,
      primerMensaje: trabajos.rows.length,
      retenido: trabajosCompletados > 0 ? Math.round((trabajosCompletados / clientesActivos) * 100) : 0,
    };

    res.json({
      ok: true,
      mrr: Math.round(mrr * 100) / 100,
      mrrSource,
      clientesActivos,
      agentesActivos,
      trabajos: {
        total: trabajos.rows.length,
        completados: trabajosCompletados,
        pendientes: trabajosPendientes,
      },
      funnel,
      notificaciones7d: parseInt(notificaciones.rows[0]?.c || 0),
    });
  } catch (err) {
    console.error('Error /metrics/business:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
