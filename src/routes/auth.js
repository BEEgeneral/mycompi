require('dotenv').config()
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const prisma = require('../lib/db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

// Validation schemas
const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password mínimo 8 caracteres'),
  nombreEmpresa: z.string().min(2, 'Nombre empresa mínimo 2 caracteres')
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido')
})

// Helper: generar slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Helper: generar tokens
function generateTokens(usuarioId, clienteId) {
  const accessToken = jwt.sign(
    { usuarioId, clienteId },
    JWT_SECRET,
    { expiresIn: '15m' }
  )
  const refreshToken = jwt.sign(
    { usuarioId, clienteId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
  return { accessToken, refreshToken }
}

// Registro
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const { nombre, email, password, nombreEmpresa } = data

    // Verificar email único
    const existingUser = await prisma.usuario.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email ya registrado' })
    }

    // Generar slug único
    let slug = generateSlug(nombreEmpresa)
    const existingSlug = await prisma.cliente.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Crear cliente + usuario owner en transacción
    const result = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: {
          nombre: nombreEmpresa,
          slug,
          email,
          plan: 'BASICO'
        }
      })

      const usuario = await tx.usuario.create({
        data: {
          clienteId: cliente.id,
          nombre,
          email,
          passwordHash,
          rol: 'OWNER'
        }
      })

      return { cliente, usuario }
    })

    const tokens = generateTokens(result.usuario.id, result.cliente.id)

    res.status(201).json({
      tokens,
      cliente: {
        id: result.cliente.id,
        nombre: result.cliente.nombre,
        slug: result.cliente.slug,
        plan: result.cliente.plan
      },
      usuario: {
        id: result.usuario.id,
        nombre: result.usuario.nombre,
        email: result.usuario.email,
        rol: result.usuario.rol,
        rol_platform: 'CLIENT'
      }
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Error en register:', err)
    res.status(500).json({ error: 'Error al registrar' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    const { email, password } = data

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { cliente: true }
    })

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const validPassword = await bcrypt.compare(password, usuario.passwordHash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Actualizar último acceso
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() }
    })

    const tokens = generateTokens(usuario.id, usuario.clienteId)

    res.json({
      tokens,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rol_platform: usuario.rol_platform
      },
      cliente: {
        id: usuario.cliente.id,
        nombre: usuario.cliente.nombre,
        slug: usuario.cliente.slug,
        plan: usuario.cliente.plan
      }
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' })
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
    const tokens = generateTokens(decoded.usuarioId, decoded.clienteId)

    res.json(tokens)
  } catch (err) {
    res.status(401).json({ error: 'Refresh token inválido' })
  }
})

// Middleware auth
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuarioId = decoded.usuarioId
    req.clienteId = decoded.clienteId
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Obtener usuario actual
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            plan: true,
            logo: true,
            webUrl: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      idioma: usuario.idioma,
      timezone: usuario.timezone,
      cliente: usuario.cliente
    })
  } catch (err) {
    console.error('Error en /me:', err)
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
})

module.exports = { router, authMiddleware }
