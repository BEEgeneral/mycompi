const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Obtener todos los trabajos del cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Soportar múltiples estados: ?estado=TODO&estado=IN_PROGRESS
    const estados = req.query.estado
      ? (Array.isArray(req.query.estado) ? req.query.estado : [req.query.estado])
      : [];
    const { agente_id, limit = 50 } = req.query;
    
    let query = `
      SELECT t.*, a.nombre as agente_nombre, a.tipo as agente_tipo
      FROM "Trabajo" t
      LEFT JOIN "Agente" a ON t."agenteId" = a.id
      WHERE t."clienteId" = $1
    `;
    const params = [req.clienteId];
    
    if (estados.length > 0) {
      query += ` AND t.estado = ANY($${params.length + 1})`;
      params.push(estados);
    }
    
    if (agente_id) {
      query += ` AND t."agenteId" = $${params.length + 1}`;
      params.push(agente_id);
    }
    
    query += ` ORDER BY t."createdAt" DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json({ trabajos: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error obteniendo trabajos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─── GET /api/trabajos/pending-approval ─── Jobs pendientes de approval
router.get('/pending-approval', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.nombre as agente_nombre, a.tipo as agente_tipo
       FROM "Trabajo" t
       LEFT JOIN "Agente" a ON t."agenteId" = a.id
       WHERE t."clienteId" = $1
         AND t.requiereAprobacion = true
         AND t."aprobadoAt" IS NULL
         AND t.estado NOT IN ('COMPLETED', 'FAILED', 'BLOCKED')
       ORDER BY t.prioridad = 'CRITICA' DESC, t."createdAt" ASC
       LIMIT 50`,
      [req.clienteId]
    );
    res.json({ trabajos: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error pending-approval:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener un trabajo específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.nombre as agente_nombre, a.tipo as agente_tipo
       FROM "Trabajo" t
       LEFT JOIN "Agente" a ON t."agenteId" = a.id
       WHERE t.id = $1 AND t."clienteId" = $2`,
      [req.params.id, req.clienteId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error obteniendo trabajo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear un trabajo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, agente_id, prioridad } = req.body;
    
    const result = await pool.query(
      `INSERT INTO "Trabajo" ("clienteId", "agenteId", titulo, descripcion, prioridad, estado, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, 'TODO', NOW(), NOW())
       RETURNING *`,
      [req.clienteId, agente_id || null, titulo, descripcion, prioridad || 'MEDIA']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando trabajo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar trabajo (estado, resultado, score)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, estado, prioridad, resultado, score } = req.body;
    
    let updateFields = [];
    let params = [];
    let paramCount = 1;
    
    if (titulo !== undefined) {
      updateFields.push(`titulo = $${paramCount++}`);
      params.push(titulo);
    }
    if (descripcion !== undefined) {
      updateFields.push(`descripcion = $${paramCount++}`);
      params.push(descripcion);
    }
    if (estado !== undefined) {
      updateFields.push(`estado = $${paramCount++}`);
      params.push(estado);
      if (estado === 'completado') {
        updateFields.push(`scored_at = CURRENT_TIMESTAMP`);
      }
    }
    if (prioridad !== undefined) {
      updateFields.push(`prioridad = $${paramCount++}`);
      params.push(prioridad);
    }
    if (resultado !== undefined) {
      updateFields.push(`resultado = $${paramCount++}`);
      params.push(resultado);
    }
    if (score !== undefined) {
      updateFields.push(`score = $${paramCount++}`);
      params.push(score);
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    params.push(req.params.id);
    params.push(req.clienteId);
    
    const result = await pool.query(
      `UPDATE "Trabajo" SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount++} AND "clienteId" = $${paramCount}
       RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando trabajo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Eliminar trabajo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM "Trabajo" WHERE id = $1 AND "clienteId" = $2 RETURNING id`,
      [req.params.id, req.clienteId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trabajo no encontrado' });
    }
    
    res.json({ message: 'Trabajo eliminado' });
  } catch (err) {
    console.error('Error eliminando trabajo:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener estadísticas del cliente
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = {};
    
    // Total trabajos
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM "Trabajo" WHERE "clienteId" = $1`,
      [req.clienteId]
    );
    stats.total = parseInt(totalResult.rows[0].total);
    
    // Por estado
    const estadoResult = await pool.query(
      `SELECT estado, COUNT(*) as count FROM "Trabajo" WHERE "clienteId" = $1 GROUP BY estado`,
      [req.clienteId]
    );
    stats.por_estado = estadoResult.rows.reduce((acc, row) => {
      acc[row.estado] = parseInt(row.count);
      return acc;
    }, {});
    
    // Promedio de score
    const scoreResult = await pool.query(
      `SELECT AVG(score) as promedio FROM "Trabajo" WHERE "clienteId" = $1 AND score IS NOT NULL`,
      [req.clienteId]
    );
    stats.promedio_score = scoreResult.rows[0].promedio ? parseFloat(scoreResult.rows[0].promedio).toFixed(1) : null;
    
    // Trabajos recientes
    const recientesResult = await pool.query(
      `SELECT * FROM "Trabajo" WHERE "clienteId" = $1 ORDER BY "createdAt" DESC LIMIT 5`,
      [req.clienteId]
    );
    stats.recientes = recientesResult.rows;
    
    res.json(stats);
  } catch (err) {
    console.error('Error obteniendo stats:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
