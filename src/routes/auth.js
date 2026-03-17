const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../models/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mycompi-secret-key';

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, nombreEmpresa } = req.body;
    
    // Generar slug desde nombre empresa
    const slug = nombreEmpresa.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Crear cliente
    const clienteResult = await pool.query(
      `INSERT INTO clientes (nombre, email, slug, plan) 
       VALUES ($1, $2, $3, 'trial') 
       RETURNING id, nombre, email, slug, plan`,
      [nombreEmpresa, email, slug]
    );
    const cliente = clienteResult.rows[0];
    
    // Crear usuario owner
    const usuarioResult = await pool.query(
      `INSERT INTO usuarios (cliente_id, nombre, email, password_hash, rol) 
       VALUES ($1, $2, $3, $4, 'owner') 
       RETURNING id, nombre, email, rol`,
      [cliente.id, nombre, email, passwordHash]
    );
    
    // Generar token
    const token = jwt.sign(
      { usuarioId: usuarioResult.rows[0].id, clienteId: cliente.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      cliente: { id: cliente.id, nombre: cliente.nombre, slug: cliente.slug },
      usuario: usuarioResult.rows[0]
    });
  } catch (err) {
    console.error('Error en register:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email o slug ya existente' });
    }
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      `SELECT u.*, c.nombre as cliente_nombre, c.slug, c.plan 
       FROM usuarios u 
       JOIN clientes c ON u.cliente_id = c.id 
       WHERE u.email = $1 AND u.activo = true`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const usuario = result.rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { usuarioId: usuario.id, clienteId: usuario.cliente_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      cliente: { id: usuario.cliente_id, nombre: usuario.cliente_nombre, slug: usuario.slug, plan: usuario.plan }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Middleware para verificar token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.usuarioId;
    req.clienteId = decoded.clienteId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Obtener usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol, c.id as cliente_id, c.nombre as cliente_nombre, c.slug, c.plan 
       FROM usuarios u 
       JOIN clientes c ON u.cliente_id = c.id 
       WHERE u.id = $1`,
      [req.usuarioId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en /me:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = { router, authMiddleware };
