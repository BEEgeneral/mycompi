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

// ─────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────
const fs = require('fs')
const path = require('path')
const RESET_TOKENS_FILE = path.join(__dirname, '../lib/resetTokens.json')

function loadResetTokens() {
  try {
    return JSON.parse(fs.readFileSync(RESET_TOKENS_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function saveResetTokens(tokens) {
  fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens))
}

// Genera token y envía email de recuperación
router.post('/recuperar', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email requerido' })

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return res.json({ ok: true })
    }

    const crypto = require('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = Date.now() + 24 * 60 * 60 * 1000

    const tokens = loadResetTokens()
    tokens[token] = { usuarioId: usuario.id, expiry }
    saveResetTokens(tokens)

    const resetLink = `https://mycompi.onrender.com/#/reset-password?token=${token}`

    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    resend.emails.send({
      from: 'MyCompi <noreply@mycompi.com>',
      to: email,
      subject: 'Recupera tu contraseña de MyCompi',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111;">Recupera tu contraseña</h2>
          <p style="color: #555;">Hola ${usuario.nombre},</p>
          <p style="color: #555;">Recibiste este email porque pediste recuperar tu contraseña.</p>
          <a href="${resetLink}" style="display: inline-block; background: #FDC239; color: #111; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0;">Reiniciar contraseña</a>
          <p style="color: #888; font-size: 12px;">Si no pediste esto, ignora este email. El enlace expira en 24h.</p>
        </div>
      `
    }).catch(err => {
      console.error('Error enviando email Resend:', err?.message || err)
    })

    res.json({ ok: true })
  } catch (err) {
    console.error('Error en /recuperar:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

// Reset password con token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' })
    if (password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' })

    const tokens = loadResetTokens()
    const record = tokens[token]

    if (!record || record.expiry < Date.now()) {
      return res.status(400).json({ error: 'Token inválido o expirado' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.usuario.update({
      where: { id: record.usuarioId },
      data: { passwordHash }
    })

    delete tokens[token]
    saveResetTokens(tokens)

    res.json({ ok: true })
  } catch (err) {
    console.error('Error en /reset-password:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

module.exports = { router, authMiddleware }
