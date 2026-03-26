const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Obtener todos los trabajos del cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado, agente_id, limit = 50 } = req.query;
    
    let query = `
      SELECT t.*, a.nombre as agente_nombre, a.tipo as agente_tipo
      FROM trabajos t
      LEFT JOIN agentes a ON t.agente_id = a.id
      WHERE t.cliente_id = $1
    `;
    const params = [req.clienteId];
    
    if (estado) {
      query += ` AND t.estado = $${params.length + 1}`;
      params.push(estado);
    }
    
    if (agente_id) {
      query += ` AND t.agente_id = $${params.length + 1}`;
      params.push(agente_id);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo trabajos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener un trabajo específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.nombre as agente_nombre, a.tipo as agente_tipo
       FROM trabajos t
       LEFT JOIN agentes a ON t.agente_id = a.id
       WHERE t.id = $1 AND t.cliente_id = $2`,
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
      `INSERT INTO trabajos (cliente_id, agente_id, titulo, descripcion, prioridad, estado) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente')
       RETURNING *`,
      [req.clienteId, agente_id || null, titulo, descripcion, prioridad || 'media']
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
      `UPDATE trabajo SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount++} AND cliente_id = $${paramCount}
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
      `DELETE FROM trabajos WHERE id = $1 AND cliente_id = $2 RETURNING id`,
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
      `SELECT COUNT(*) as total FROM trabajos WHERE cliente_id = $1`,
      [req.clienteId]
    );
    stats.total = parseInt(totalResult.rows[0].total);
    
    // Por estado
    const estadoResult = await pool.query(
      `SELECT estado, COUNT(*) as count FROM trabajos WHERE cliente_id = $1 GROUP BY estado`,
      [req.clienteId]
    );
    stats.por_estado = estadoResult.rows.reduce((acc, row) => {
      acc[row.estado] = parseInt(row.count);
      return acc;
    }, {});
    
    // Promedio de score
    const scoreResult = await pool.query(
      `SELECT AVG(score) as promedio FROM trabajos WHERE cliente_id = $1 AND score IS NOT NULL`,
      [req.clienteId]
    );
    stats.promedio_score = scoreResult.rows[0].promedio ? parseFloat(scoreResult.rows[0].promedio).toFixed(1) : null;
    
    // Trabajos recientes
    const recientesResult = await pool.query(
      `SELECT * FROM trabajos WHERE cliente_id = $1 ORDER BY created_at DESC LIMIT 5`,
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
