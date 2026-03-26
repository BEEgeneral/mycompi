const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Obtener todos los agentes del cliente
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM agentes WHERE cliente_id = $1 ORDER BY created_at DESC`,
      [req.clienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo agentes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener un agente específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM agentes WHERE id = $1 AND cliente_id = $2`,
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

// Crear un agente
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, tipo, core_expertise, especializacion, config } = req.body;
    
    const result = await pool.query(
      `INSERT INTO agentes (cliente_id, nombre, tipo, core_expertise, especializacion, config) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.clienteId, nombre, tipo, core_expertise, especializacion, JSON.stringify(config || {})]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar agente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, tipo, core_expertise, especializacion, estado, config } = req.body;
    
    const result = await pool.query(
      `UPDATE agentes 
       SET nombre = COALESCE($1, nombre),
           tipo = COALESCE($2, tipo),
           core_expertise = COALESCE($3, core_expertise),
           especializacion = COALESCE($4, especializacion),
           estado = COALESCE($5, estado),
           config = COALESCE($6, config)
       WHERE id = $7 AND cliente_id = $8
       RETURNING *`,
      [nombre, tipo, core_expertise, especializacion, estado, config ? JSON.stringify(config) : null, req.params.id, req.clienteId]
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

// Eliminar agente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM agentes WHERE id = $1 AND cliente_id = $2 RETURNING id`,
      [req.params.id, req.clienteId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    res.json({ message: 'Agente eliminado' });
  } catch (err) {
    console.error('Error eliminando agente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener skills de un agente
router.get('/:id/skills', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM skills WHERE agente_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo skills:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear skill para un agente
router.post('/:id/skills', authMiddleware, async (req, res) => {
  try {
    // Verificar que el agente pertenece al cliente
    const agenteCheck = await pool.query(
      `SELECT id FROM agentes WHERE id = $1 AND cliente_id = $2`,
      [req.params.id, req.clienteId]
    );
    
    if (agenteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    
    const { nombre, contenido } = req.body;
    
    const result = await pool.query(
      `INSERT INTO skills (agente_id, nombre, contenido) 
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, nombre, contenido]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando skill:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtenerlearnings del cliente
router.get('/learnings', authMiddleware, async (req, res) => {
  try {
    const { query, tags } = req.query;
    
    let sql = 'SELECT * FROM learnings WHERE cliente_id = $1';
    const params = [req.clienteId];
    
    if (query) {
      sql += ` AND (titulo ILIKE $2 OR contenido ILIKE $2)`;
      params.push(`%${query}%`);
    }
    
    if (tags) {
      const tagsArray = tags.split(',');
      sql += ` AND tags && $${params.length + 1}`;
      params.push(tagsArray);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo learnings:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Crear learning
router.post('/learnings', authMiddleware, async (req, res) => {
  try {
    const { titulo, contenido, tags } = req.body;
    
    const result = await pool.query(
      `INSERT INTO learnings (cliente_id, titulo, contenido, tags) 
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.clienteId, titulo, contenido, tags || []]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando learning:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
