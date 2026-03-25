const express = require('express');
const { pool } = require('../models/db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Obtener cliente actual
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, email, slug, plan, estado, created_at 
       FROM clientes WHERE id = $1`,
      [req.clienteId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error obteniendo cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar cliente
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, plan } = req.body;
    
    const result = await pool.query(
      `UPDATE clientes 
       SET nombre = COALESCE($1, nombre), 
           email = COALESCE($2, email),
           plan = COALESCE($3, plan),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [nombre, email, plan, req.clienteId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando cliente:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener usuarios del cliente
router.get('/usuarios', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, activo, created_at 
       FROM usuarios WHERE cliente_id = $1`,
      [req.clienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Agregar usuario
router.post('/usuarios', authMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO usuarios (cliente_id, nombre, email, password_hash, rol) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, rol, activo`,
      [req.clienteId, nombre, email, passwordHash, rol || 'viewer']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error agregando usuario:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email ya existe' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener memoria del cliente
router.get('/memoria', authMiddleware, async (req, res) => {
  try {
    const { layer } = req.query;
    let query = 'SELECT layer, contenido, updated_at FROM memoria WHERE cliente_id = $1';
    const params = [req.clienteId];
    
    if (layer) {
      query += ' AND layer = $2';
      params.push(layer);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo memoria:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar memoria
router.put('/memoria', authMiddleware, async (req, res) => {
  try {
    const { layer, contenido } = req.body;
    
    const result = await pool.query(
      `INSERT INTO memoria (cliente_id, layer, contenido) 
       VALUES ($1, $2, $3)
       ON CONFLICT (cliente_id, layer) 
       DO UPDATE SET contenido = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.clienteId, layer, contenido]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando memoria:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener documentos
router.get('/documentos', authMiddleware, async (req, res) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM documentos WHERE cliente_id = $1';
    const params = [req.clienteId];
    
    if (tipo) {
      query += ' AND tipo = $2';
      params.push(tipo);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error obteniendo documentos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar documento
router.put('/documentos/:tipo', authMiddleware, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { titulo, contenido } = req.body;
    
    const result = await pool.query(
      `INSERT INTO documentos (cliente_id, tipo, titulo, contenido) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cliente_id, tipo) 
       DO UPDATE SET titulo = $3, contenido = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.clienteId, tipo, titulo, contenido]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando documento:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Obtener standups/decisiones del Orquestador (para cliente)
router.get('/decisiones', authMiddleware, async (req, res) => {
  try {
    const { limit = 14 } = req.query;
    const fs = require('fs');
    const path = require('path');
    const standupsDir = path.join(__dirname, '../../memory/daily-standups');

    if (!fs.existsSync(standupsDir)) {
      return res.json({ ok: true, standups: [], decisiones: [], toughLove: [] });
    }

    const files = fs.readdirSync(standupsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, parseInt(limit));

    const standups = files.map(f => ({
      fecha: f.replace('.md', ''),
      contenido: fs.readFileSync(path.join(standupsDir, f), 'utf8'),
    }));

    // Extraer solo lo que el cliente necesita ver
    const decisiones = [];
    const toughLove = [];
    const prioridades = [];

    standups.forEach(s => {
      const lines = s.contenido.split('\n');
      let seccion = null;
      lines.forEach(line => {
        if (line.startsWith('### Decisiones')) seccion = 'decisiones';
        else if (line.startsWith('### Prioridades')) seccion = 'prioridades';
        else if (line.startsWith('### Tough Love')) seccion = 'tough';
        else if (line.startsWith('### Email enviado')) seccion = null;
        else if (seccion === 'decisiones' && line.trim().startsWith('- ')) {
          decisiones.push({ fecha: s.fecha, texto: line.trim().slice(2) });
        }
        else if (seccion === 'prioridades' && line.trim().startsWith('- ')) {
          prioridades.push({ fecha: s.fecha, texto: line.trim().slice(2) });
        }
        else if (seccion === 'tough' && line.trim().startsWith('>')) {
          toughLove.push({ fecha: s.fecha, texto: line.trim().slice(1).trim() });
        }
      });
    });

    res.json({ ok: true, standups, decisiones, prioridades, toughLove });
  } catch (err) {
    console.error('Error obteniendo decisiones:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
