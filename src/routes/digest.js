const express = require('express')
const router = express.Router()
const { authMiddleware } = require('./auth')
const prisma = require('../lib/db')

/**
 * GET /api/orchestrator/daily-digest
 * Genera y envía el daily digest al cliente
 * 
 * Puede llamarse:
 * - Manualmente desde el dashboard
 * - Por cron job nightly
 */
router.get('/daily-digest', authMiddleware, async (req, res) => {
  try {
    const { clienteId } = req
    const tokenController = require('../services/tokenController')
    
    // Obtener cliente con email
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { usuarios: { where: { rol: 'OWNER' } } }
    })
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }
    
    const ownerEmail = cliente.usuarios[0]?.email
    if (!ownerEmail) {
      return res.status(400).json({ error: 'No hay email de contacto para este cliente' })
    }
    
    // Obtener logs de las últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const logs = tokenController.obtenerLogs ? tokenController.obtenerLogs() : []
    const recentLogs = logs.filter(l => l.clienteId === clienteId && new Date(l.timestamp) > yesterday)
    
    // Generar digest
    const { generateDigest, generateDigestPlain } = require('../services/digestService')
    const { html, subject, proactiveTasks } = generateDigest({
      logs: recentLogs,
      clienteNombre: cliente.nombre,
      clienteEmail: ownerEmail,
      plan: cliente.plan,
    })
    
    // Enviar email via Resend
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    try {
      await resend.emails.send({
        from: 'MyCompi <noreply@mycompi.com>',
        to: ownerEmail,
        subject,
        html,
      })
    } catch (emailErr) {
      console.error('Error enviando digest:', emailErr?.message || emailErr)
    }
    
    res.json({
      ok: true,
      email: ownerEmail,
      sessions: recentLogs.length,
      agents: [...new Set(recentLogs.map(l => l.agente).filter(Boolean))],
      proactiveTasks,
    })
  } catch (err) {
    console.error('Error en daily-digest:', err)
    res.status(500).json({ error: 'Error al generar digest' })
  }
})

/**
 * GET /api/orchestrator/digest/preview
 * Previsualiza el digest sin enviarlo
 */
router.get('/digest/preview', authMiddleware, async (req, res) => {
  try {
    const { clienteId } = req
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    const tokenController = require('../services/tokenController')
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const logs = tokenController.obtenerLogs ? tokenController.obtenerLogs() : []
    const recentLogs = logs.filter(l => l.clienteId === clienteId && new Date(l.timestamp) > yesterday)
    
    const { generateDigest, generateDigestPlain } = require('../services/digestService')
    const { html, subject } = generateDigest({
      logs: recentLogs,
      clienteNombre: cliente?.nombre || 'Cliente',
      clienteEmail: 'preview@mycompi.com',
      plan: cliente?.plan || 'BASICO',
    })
    
    res.json({ subject, html })
  } catch (err) {
    console.error('Error en digest preview:', err)
    res.status(500).json({ error: 'Error al generar preview' })
  }
})

module.exports = router
