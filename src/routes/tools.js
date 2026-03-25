/**
 * tools.js — Endpoint centralizado para ejecución de tools por agentes
 *
 * Los agentes (via Paco) piden ejecutar tools.
 * Se verifica plan, permisos, y se delega al registry.
 */

const express = require('express')
const router = express.Router()
const { authMiddleware } = require('./auth')
const { getToolsDisponibles, puedeEjecutarTool, ejecutarTool } = require('../services/toolRegistry')

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getResend() {
  try {
    const { Resend } = require('resend')
    return new Resend(process.env.RESEND_API_KEY)
  } catch {
    return null
  }
}

function getClienteContext(clienteId, prisma) {
  // Trae solo lo que necesita ejecutarTool — nada sensitive
  return { clienteId, prisma }
}

// ─────────────────────────────────────────
// LISTAR TOOLS DISPONIBLES
// GET /api/tools
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cliente = await req.prisma.cliente.findUnique({
      where: { id: req.clienteId },
      select: { plan: true, nombre: true },
    })

    const tools = getToolsDisponibles(cliente?.plan || 'BASICO')

    res.json({
      ok: true,
      plan: cliente?.plan || 'BASICO',
      tools,
      total: tools.length,
    })
  } catch (err) {
    console.error('Error listando tools:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

// ─────────────────────────────────────────
// EJECUTAR UNA TOOL
// POST /api/tools/ejecutar
// ─────────────────────────────────────────
router.post('/ejecutar', authMiddleware, async (req, res) => {
  try {
    const { tool, params } = req.body

    if (!tool) {
      return res.status(400).json({ error: 'Falta el parámetro "tool"' })
    }

    // Obtener plan del cliente
    const cliente = await req.prisma.cliente.findUnique({
      where: { id: req.clienteId },
      select: { plan: true, nombre: true },
    })

    const plan = cliente?.plan || 'BASICO'

    // Verificar permisos
    const puede = puedeEjecutarTool(tool, plan)
    if (!puede.puede) {
      return res.status(403).json({
        ok: false,
        error: puede.razon,
        tool,
        planRequerido: plan,
      })
    }

    // Ejecutar
    const resend = getResend()
    const contexto = {
      plan,
      clienteId: req.clienteId,
      prisma: req.prisma,
      resend,
      fetch: global.fetch || fetch,
      twitterToken: req.headers['x-twitter-token'] || null,
    }

    const resultado = await ejecutarTool(tool, params || {}, contexto)

    res.json({
      ok: resultado.ok,
      tool,
      resultado,
    })
  } catch (err) {
    console.error(`Error en POST /tools/ejecutar:`, err)
    res.status(500).json({ error: 'Error interno al ejecutar tool' })
  }
})

// ─────────────────────────────────────────
// EJECUTAR MÚLTIPLES TOOLS (batch)
// POST /api/tools/batch
// ─────────────────────────────────────────
router.post('/batch', authMiddleware, async (req, res) => {
  try {
    const { tasks } = req.body // [{tool, params}]

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Falta "tasks" como array' })
    }

    const cliente = await req.prisma.cliente.findUnique({
      where: { id: req.clienteId },
      select: { plan: true },
    })
    const plan = cliente?.plan || 'BASICO'
    const resend = getResend()

    const resultados = []
    for (const task of tasks) {
      const { tool, params } = task
      const puede = puedeEjecutarTool(tool, plan)
      if (!puede.puede) {
        resultados.push({ tool, ok: false, error: puede.razon })
        continue
      }
      const contexto = {
        plan,
        clienteId: req.clienteId,
        prisma: req.prisma,
        resend,
        fetch: global.fetch || fetch,
        twitterToken: req.headers['x-twitter-token'] || null,
      }
      const r = await ejecutarTool(tool, params || {}, contexto)
      resultados.push({ tool, ok: r.ok, resultado: r })
    }

    res.json({ ok: true, resultados })
  } catch (err) {
    console.error('Error en batch:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

module.exports = router
