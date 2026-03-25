/**
 * toolRegistry.js — Registro centralizado de herramientas disponibles
 *
 * Define qué tools tiene cada plan y cómo se ejecutan.
 * Las tools son funciones que los agentes pueden invocar via MyCompi API.
 */

const TOOLS = {}

// ─────────────────────────────────────────
// DEFINICIÓN DE TOOLS
// ─────────────────────────────────────────

TOOLS.send_email = {
  nombre: 'Enviar email',
  descripcion: 'Envía un email desde noreply@mycompi.com a un destinatario',
  plan: 'BASICO',
  args: {
    tipo: 'object',
    properties: {
      para: { type: 'string', description: 'Dirección de email del destinatario' },
      asunto: { type: 'string', description: 'Asunto del email' },
      html: { type: 'string', description: 'Cuerpo del email en HTML' },
      texto: { type: 'string', description: 'Versión texto plano del email (alternativa a html)' },
    },
    required: ['para', 'asunto'],
  },
  ejecutar: async ({ para, asunto, html, texto }, { clienteId, resend }) => {
    const result = await resend.emails.send({
      from: 'MyCompi <noreply@mycompi.com>',
      to: para,
      subject: asunto,
      html: html || undefined,
      text: texto || undefined,
    })
    return { ok: true, messageId: result.data?.id || result.id }
  },
}

TOOLS.send_email_batch = {
  nombre: 'Enviar email masivo',
  descripcion: 'Envía el mismo email a múltiples destinatarios',
  plan: 'EQUIPO',
  args: {
    tipo: 'object',
    properties: {
      para: { type: 'array', items: { type: 'string' }, description: 'Lista de emails' },
      asunto: { type: 'string', description: 'Asunto del email' },
      html: { type: 'string', description: 'Cuerpo del email en HTML' },
    },
    required: ['para', 'asunto'],
  },
  ejecutar: async ({ para, asunto, html }, { resend }) => {
    const resultados = []
    for (const email of para) {
      try {
        const r = await resend.emails.send({
          from: 'MyCompi <noreply@mycompi.com>',
          to: email,
          subject: asunto,
          html,
        })
        resultados.push({ email, ok: true, id: r.data?.id || r.id })
      } catch (err) {
        resultados.push({ email, ok: false, error: err.message })
      }
    }
    return { ok: true, resultados }
  },
}

TOOLS.registrar_tarea = {
  nombre: 'Registrar tarea',
  descripcion: 'Crea una tarea en el sistema de tracking del cliente',
  plan: 'BASICO',
  args: {
    tipo: 'object',
    properties: {
      titulo: { type: 'string', description: 'Título de la tarea' },
      descripcion: { type: 'string', description: 'Descripción detallada' },
      prioridad: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], default: 'MEDIA' },
      agenteId: { type: 'string', description: 'ID del agente que debe ejecutarla' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Tags para categorizar' },
    },
    required: ['titulo'],
  },
  ejecutar: async (params, { clienteId, prisma }) => {
    const tarea = await prisma.trabajo.create({
      data: {
        clienteId,
        agenteId: params.agenteId || 'orquestador',
        titulo: params.titulo,
        descripcion: params.descripcion || null,
        prioridad: params.prioridad || 'MEDIA',
        tags: params.tags || [],
        estado: 'TODO',
      },
    })
    return { ok: true, tareaId: tarea.id, titulo: tarea.titulo }
  },
}

TOOLS.obtener_tareas = {
  nombre: 'Obtener tareas',
  descripcion: 'Lista las tareas del cliente, opcionalmente filtradas por estado o agente',
  plan: 'BASICO',
  args: {
    tipo: 'object',
    properties: {
      estado: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'FAILED'], description: 'Filtrar por estado' },
      agenteId: { type: 'string', description: 'Filtrar por agente' },
      limite: { type: 'number', default: 20, description: 'Número máximo de tareas' },
    },
  },
  ejecutar: async (params, { clienteId, prisma }) => {
    const where = { clienteId }
    if (params.estado) where.estado = params.estado
    if (params.agenteId) where.agenteId = params.agenteId

    const tareas = await prisma.trabajo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limite || 20,
      select: { id: true, titulo: true, estado: true, prioridad: true, agenteId: true, createdAt: true, completedAt: true },
    })
    return { ok: true, tareas, total: tareas.length }
  },
}

TOOLS.actualizar_tarea = {
  nombre: 'Actualizar tarea',
  descripcion: 'Cambia el estado o contenido de una tarea existente',
  plan: 'BASICO',
  args: {
    tipo: 'object',
    properties: {
      tareaId: { type: 'string', description: 'ID de la tarea' },
      estado: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BLOCKED'] },
      prioridad: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] },
    },
    required: ['tareaId'],
  },
  ejecutar: async ({ tareaId, estado, prioridad }, { clienteId, prisma }) => {
    const data = {}
    if (estado) data.estado = estado
    if (prioridad) data.prioridad = prioridad
    if (estado === 'COMPLETED') data.completedAt = new Date()

    const updated = await prisma.trabajo.updateMany({
      where: { id: tareaId, clienteId },
      data,
    })
    return { ok: updated.count > 0, actualizados: updated.count }
  },
}

TOOLS.scrape_web = {
  nombre: 'Scrapear web',
  descripcion: 'Obtiene el contenido de texto de una URL (útil para investigación)',
  plan: 'DIRECCION',
  args: {
    tipo: 'object',
    properties: {
      url: { type: 'string', description: 'URL a scrapear' },
      pregunta: { type: 'string', description: 'Pregunta específica sobre el contenido de la página' },
    },
    required: ['url'],
  },
  ejecutar: async ({ url, pregunta }, { fetch }) => {
    // Fetch via oxylabs o similar — por ahora fallback a fetch nativo
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MyCompiBot/1.0)' },
        signal: AbortSignal.timeout(10000),
      })
      const text = await res.text()
      // Extraer texto útil (básico)
      const cleaned = text
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000)

      return {
        ok: true,
        url,
        contenido: pregunta ? `Pregunta: ${pregunta}\n\n${cleaned.slice(0, 2000)}` : cleaned.slice(0, 3000),
      }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  },
}

TOOLS.publicar_tweet = {
  nombre: 'Publicar tweet',
  descripcion: 'Publica un tweet en la cuenta de Twitter/X del cliente',
  plan: 'DIRECCION',
  args: {
    tipo: 'object',
    properties: {
      texto: { type: 'string', description: 'Contenido del tweet (máx 280 caracteres)', maxLength: 280 },
    },
    required: ['texto'],
  },
  ejecutar: async ({ texto }, { twitterToken }) => {
    if (!twitterToken) return { ok: false, error: 'Twitter no conectado para este cliente' }
    // Twitter API v2
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${twitterToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texto }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.detail || 'Error de Twitter' }
    return { ok: true, tweetId: data.data?.id, texto }
  },
}

TOOLS.buscar_en_web = {
  nombre: 'Buscar en web',
  descripcion: 'Busca información en Google/web para investigación',
  plan: 'DIRECCION',
  args: {
    tipo: 'object',
    properties: {
      consulta: { type: 'string', description: 'Consulta de búsqueda' },
      numResultados: { type: 'number', default: 5, description: 'Número de resultados' },
    },
    required: ['consulta'],
  },
  ejecutar: async ({ consulta, numResultados = 5 }, { fetch }) => {
    // Usar un microservicio de búsqueda o fallback
    // Por ahora: busca via DuckDuckGo (HTML simple)
    try {
      const q = encodeURIComponent(consulta)
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}&kl=es-es`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      })
      const text = await res.text()
      // Parse básico de resultados
      const results = []
      const matches = text.matchAll(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)
      let count = 0
      for (const m of matches) {
        if (count >= numResultados) break
        results.push({ titulo: m[2].trim(), url: m[1] })
        count++
      }
      return { ok: true, consulta, resultados: results.slice(0, numResultados) }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  },
}

// ─────────────────────────────────────────
// HELPERS PÚBLICOS
// ─────────────────────────────────────────

/**
 * Devuelve la lista de tools disponibles para un plan dado
 */
function getToolsDisponibles(plan) {
  return Object.entries(TOOLS)
    .filter(([, tool]) => {
      const planOrden = ['BASICO', 'EQUIPO', 'DIRECCION', 'COMPLETO']
      const nivelPlan = planOrden.indexOf(plan)
      const nivelTool = planOrden.indexOf(tool.plan)
      return nivelPlan >= nivelTool
    })
    .map(([id, tool]) => ({
      id,
      nombre: tool.nombre,
      descripcion: tool.descripcion,
      args: tool.args,
    }))
}

/**
 * Verifica si un cliente puede ejecutar una tool
 */
function puedeEjecutarTool(toolId, plan) {
  const tool = TOOLS[toolId]
  if (!tool) return { puede: false, razon: 'Tool no existe' }

  const planOrden = ['BASICO', 'EQUIPO', 'DIRECCION', 'COMPLETO']
  const nivelPlan = planOrden.indexOf(plan)
  const nivelTool = planOrden.indexOf(tool.plan)

  if (nivelPlan < nivelTool) {
    return { puede: false, razon: `Esta tool requiere plan ${tool.plan}` }
  }
  return { puede: true }
}

/**
 * Ejecuta una tool si el cliente tiene permisos
 */
async function ejecutarTool(toolId, params, contexto) {
  const { plan, clienteId, prisma, resend, fetch, twitterToken } = contexto

  const puede = puedeEjecutarTool(toolId, plan)
  if (!puede.puede) {
    return { ok: false, error: puede.razon }
  }

  const tool = TOOLS[toolId]
  try {
    const resultado = await tool.ejecutar(params, { clienteId, prisma, resend, fetch, twitterToken })
    return resultado
  } catch (err) {
    console.error(`Error ejecutando tool ${toolId}:`, err)
    return { ok: false, error: err.message }
  }
}

module.exports = {
  TOOLS,
  getToolsDisponibles,
  puedeEjecutarTool,
  ejecutarTool,
}
