/**
 * chat.js — Chat de Paco via OpenClaw con contexto completo + SSE streaming
 *
 * POST /api/chat          → Enviar mensaje (inicia SSE stream)
 * GET  /api/chat/history  → Historial de mensajes
 * GET  /api/chat/:id     → Estado de una interacción
 *
 * Cambios vs versión anterior:
 * - Usa OpenClaw como brain (no MiniMax directo)
 * - Inyecta contexto completo del cliente (empresa, plan, docs, tareas)
 * - Acceso a tools reales (registrar_tarea, send_email, etc.)
 * - SSE streaming para respuesta en tiempo real
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');
const { buildContext, logInteraction } = require('../services/agentLoader');
const { getToolsDisponibles, ejecutarTool } = require('../services/toolRegistry');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');

const RESEND = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ─────────────────────────────────────────
// Configuración OpenClaw
// ─────────────────────────────────────────
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN || '';
const PACO_TIMEOUT_MS = 60000; // 60 segundos max para Paco

// ─────────────────────────────────────────
// Contexto del sistema — Paco como orquestador
// ─────────────────────────────────────────
const PACO_CORE = `Eres **Paco**, el orquestador de MyCompi — una plataforma SaaS que ofrece equipos de agentes IA especializados (called "Compis") para PYMES españolas.

TU IDENTIDAD:
- Primer punto de contacto con el cliente
- Coordinas y diriges al equipo de agentes especializados
- Sabes TODO sobre el equipo y puedes explicar qué hace cada agente
- Si el cliente pide algo concreto, coordinas con el agente adecuado o lo resuelves tú mismo

EQUIPO DE AGENTES DISPONIBLES:
- 💬 Laura Montes — Atención al Cliente (soporte 24/7, FAQ, resolver dudas)
- 📊 Enzo Herrera — Marketing (campañas, contenido, SEO, redes sociales)
- 💼 Carlos Mendoza — Ventas (leads, cierre, seguimiento comercial)
- ⚙️ Elena Ortega — Operaciones (automatizaciones, integraciones, procesos)
- 📈 Diana Palau — Data (métricas, análisis, dashboards, reporting)
- 💻 Marcos Fernández — Desarrollo Web (web, e-commerce, landing pages)
- 🤖 Pelayo — Asistente personal (tareas variadas)

PLANES:
- Básico (10€/mes) → Laura + manager
- Equipo (49€/mes) → Laura, Enzo, Carlos + manager
- Dirección (147€/mes) → Todos + manager + director

TU ESTILO:
- Informal, directo, cercano — tutea siempre
- Usa emojis de forma natural
- Responde en español de España
- SIEMPRE propón siguiente paso concreto y accionable
- No seas genérico — si el cliente pregunta algo, dale información específica
- Cuando puedas HACER algo (crear tarea, enviar email), hazlo usando las tools disponibles

REGLAS CLAVE:
- Si el cliente pide algo específico ("un informe de ventas", "crear una campaña"), CONFIRMA que lo haces y usa la tool apropiada
- Si no puedes hacer algo ahora, sé honesto y explica cuándo / cómo se resolverá
- Usa las tools para registrar tareas, consultar datos, enviar emails cuando tenga sentido
- NUNCA inventes datos que no tienes — si no sabes algo, dilo`;

const PACO_MEMORY_REMINDER = `Esta información te ayuda a conocer mejor al cliente. Úsala para dar respuestas más personalizadas y relevantes.`;

// ─────────────────────────────────────────
// Construir contexto completo del cliente
// ─────────────────────────────────────────
async function buildClienteContext(clienteId) {
  // Cargar cliente + documentos + tareas recientes
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      agentes: {
        where: { activo: true },
        select: { id: true, nombre: true, tipo: true }
      }
    }
  });

  if (!cliente) return { cliente: null, docs: [], tareas: [], context: '' };

  // Documentos relevantes
  const docs = await prisma.documento.findMany({
    where: { clienteId },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  // Tareas recientes (últimas 5)
  const tareas = await prisma.trabajo.findMany({
    where: { clienteId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      titulo: true,
      estado: true,
      prioridad: true,
      createdAt: true,
      agente: { select: { nombre: true } }
    }
  });

  // Tareas pendientes
  const tareasPendientes = await prisma.trabajo.count({
    where: { clienteId, estado: { in: ['TODO', 'IN_PROGRESS'] } }
  });

  // Notificaciones no leídas
  const notificacionesNoLeidas = await prisma.notificacion.count({
    where: { clienteId, leida: false }
  });

  // Agents activos para este cliente
  const agentesActivos = cliente.agentes.map(a => a.nombre).join(', ') || 'Ninguno todavía';

  const context = `
**INFO DEL CLIENTE:**
- Nombre: ${cliente.nombre}
- Empresa: ${cliente.empresa || 'No especificada'}
- Plan: ${cliente.plan}
- Email: ${cliente.email}
${cliente.webUrl ? `- Web: ${cliente.webUrl}` : ''}

**EQUIPO ASIGNADO:** ${agentesActivos}

${docs.length > 0 ? `**DOCUMENTOS DEL CLIENTE:**
${docs.map(d => `- [${d.tipo}] ${d.titulo}: ${d.contenido.slice(0, 200)}${d.contenido.length > 200 ? '...' : ''}`).join('\n')}` : '**DOCUMENTOS:** Sin documentos aún'}

${tareas.length > 0 ? `**TAREAS RECIENTES:**
${tareas.map(t => `- ${t.estado === 'COMPLETED' ? '✅' : t.estado === 'IN_PROGRESS' ? '🔄' : '📋'} [${t.estado}] ${t.titulo} (${t.agente?.nombre || 'sin agente'})`).join('\n')}` : '**TAREAS:** Sin tareas aún'}

**RESUMEN:** ${tareasPendientes} tarea(s) pendiente(s) · ${notificacionesNoLeidas} notificación(es) sin leer`;

  return { cliente, docs, tareas, context, agentesActivos };
}

// ─────────────────────────────────────────
// Construir prompt completo para Paco
// ─────────────────────────────────────────
async function buildPacoPrompt(mensaje, clienteId, historial = []) {
  const { context } = await buildClienteContext(clienteId);

  if (!context) {
    return {
      prompt: `${PACO_CORE}\n\n[ERROR: Cliente no encontrado]`,
      tools: []
    };
  }

  // Construir historial conversacional (últimos 10 mensajes)
  const historialTexto = historial.length > 0
    ? `\n\n**CONVERSACIÓN RECIENTE:**\n${historial.map(m => {
      const rol = m.role === 'user' ? 'Cliente' : 'Paco';
      return `${rol}: ${m.content}`;
    }).join('\n')}`
    : '\n\n(Primera interacción — sin historial previo)';

  // Tools disponibles para este cliente (el plan se determina desde el contexto)
  const planMatch = context.match(/Plan: (\w+)/);
  const plan = planMatch ? planMatch[1] : 'BASICO';
  const tools = getToolsDisponibles(plan);

  const fullPrompt = `${PACO_CORE}

---

## CONTEXTO DEL CLIENTE ACTUAL
${context}

${PACO_MEMORY_REMINDER}
${historialTexto}

---

**Cliente ahora:** ${mensaje}

Responde como Paco. Si puedes usar una tool para resolver la petición del cliente, hazlo inline (no menciones que vas a usarla, simplemente inclúyela en tu respuesta como un bloque JSON que diga {"tool": "nombre", "params": {...}}).`;

  return { prompt: fullPrompt, tools };
}

// ─────────────────────────────────────────
// Llamar a OpenClaw con streaming
// ─────────────────────────────────────────
async function* callOpenClawStream(prompt, clienteNombre, tools = []) {
  if (!OPENCLAW_TOKEN) {
    yield '⚠️ Sistema no configurado: OpenClaw token no disponible. Respondo con lo que sé.\n\n';
    return;
  }

  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: prompt.split('**Cliente ahora:** ').pop() }
  ];

  // Reconstruir prompt como system + user
  const systemPart = prompt.split('**Cliente ahora:')[0];
  const userPart = prompt.split('**Cliente ahora:').pop();

  const apiMessages = [
    { role: 'system', content: systemPart },
    { role: 'user', content: `**Cliente ahora:** ${userPart}` }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PACO_TIMEOUT_MS);

    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax/MiniMax-M2.7',
        messages: apiMessages,
        max_tokens: 1500,
        temperature: 0.7,
        stream: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      yield `❌ Error de OpenClaw (${response.status}): ${errorText.slice(0, 200)}\n`;
      return;
    }

    // Streaming SSE
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip non-JSON SSE lines
          }
        }
      }
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      yield '⏱️ Timeout (60s) esperando respuesta de OpenClaw.\n';
    } else {
      yield `❌ Error conectando con OpenClaw: ${err.message}\n`;
    }
  }
}

// ─────────────────────────────────────────
// Llamada NO-streaming a OpenClaw (fallback)
// ─────────────────────────────────────────
async function callOpenClawSync(prompt, clienteNombre) {
  if (!OPENCLAW_TOKEN) {
    return getFallbackResponse(prompt);
  }

  const systemPart = prompt.split('**Cliente ahora:')[0];
  const userPart = `**Cliente ahora:** ${prompt.split('**Cliente ahora:**').pop()}`;

  const messages = [
    { role: 'system', content: systemPart },
    { role: 'user', content: userPart }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PACO_TIMEOUT_MS);

    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax/MiniMax-M2.7',
        messages,
        max_tokens: 1500,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenClaw ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respuesta vacía de OpenClaw');
    return content;

  } catch (err) {
    if (err.name === 'AbortError') {
      return '⏱️ Timeout esperando respuesta. Por favor, intenta de nuevo.';
    }
    throw err;
  }
}

// ─────────────────────────────────────────
// Fallback inteligente si OpenClaw no está
// ─────────────────────────────────────────
function getFallbackResponse(mensaje) {
  const msg = mensaje.toLowerCase();

  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto') || msg.includes(' cuesta')) {
    return `Nuestros planes:\n\n💼 **Básico** — 10€/mes (Laura + manager)\n📂 **Equipo** — 49€/mes (Laura, Enzo, Carlos + manager)\n🏢 **Dirección** — 147€/mes (Todos + director)\n\n¿Quieres más info sobre alguno?`;
  }

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return `¡Hola! 👋 Soy Paco, tu orquestador en MyCompi.\n\nPuedo ayudarte con:\n\n📊 **Marketing** — Enzo crea campañas y contenido\n💼 **Ventas** — Carlos gestiona leads\n💬 **Atención al cliente** — Laura responde dudas\n⚙️ **Operaciones** — Elena automatiza procesos\n💻 **Desarrollo** — Marcos construye tu web\n\n¿Qué necesitas?`;
  }

  if (msg.includes('tarea') || msg.includes('crear') || msg.includes('hacer')) {
    return `¡Genial! Puedo crear una tarea para tu equipo.\n\nSolo dime:\n1. ¿Qué necesitas que hagamos?\n2. ¿Qué agente debería encargarse?\n3. ¿Prioridad alta, media o baja?\n\nLo registro y el equipo lo ejecuta.`;
  }

  if (msg.includes('lead') || msg.includes('cliente') || msg.includes('venta')) {
    return `Para ventas y gestión de clientes, Carlos es el agente ideal. Él puede:\n\n📋 Seguimiento de leads\n🤝 Cualificación automática\n📧 Secuencias de email\n💰 Cierre de operaciones\n\n¿Quieres que le pase tu consulta o que crees una tarea para él?`;
  }

  if (msg.includes('web') || msg.includes('página') || msg.includes('e-commerce')) {
    return `Marcos, nuestro agente de Desarrollo Web, puede crear:\n\n🌐 Páginas web profesionales\necommerce Tiendas online\n📱 Landing pages de alta conversión\n\n¿Tienes un proyecto en mente? Puedo crear una tarea para él ahora mismo.`;
  }

  if (msg.includes('ayuda')) {
    return `Puedo ayudarte con casi cualquier cosa:\n\n• "Crea una campaña de email"\n• "Resumen de mis leads"\n• "Automatiza el follow-up"\n• "Analiza mi tráfico web"\n• "Genera un informe"\n\nSolo dime qué necesitas y coordinamos con el equipo.`;
  }

  return `¡Recibido! Lo coordino con el equipo ahora.\n\nAlgunas cosas que podemos hacer ahora mismo:\n• Crear una tarea para un agente específico\n• Enviar un email\n• Revisar tus tareas pendientes\n\n¿Qué prefieres?`;
}

// ─────────────────────────────────────────
// Extraer tool calls del texto de respuesta
// ─────────────────────────────────────────
function extractToolCalls(texto) {
  const toolCalls = [];
  const jsonRegex = /```json\s*\{[\s\S]*?\}\s*```|```\{[\s\S]*?\}```|\{"tool":\s*"([^"]+)"[^}]*\}/g;
  let match;

  while ((match = jsonRegex.exec(texto)) !== null) {
    try {
      let jsonStr = match[0];
      // Remove code fences if present
      jsonStr = jsonStr.replace(/```json\s*/i, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.tool || parsed.action) {
        toolCalls.push(parsed);
      }
    } catch (e) {
      // Try to extract raw JSON
      const rawMatch = match[0].match(/"(tool|action)"\s*:\s*"([^"]+)"/);
      if (rawMatch) {
        toolCalls.push({ tool: rawMatch[2], params: {} });
      }
    }
  }

  return toolCalls;
}

// ─────────────────────────────────────────
// Ejecutar tools detectadas en la respuesta
// ─────────────────────────────────────────
async function ejecutarToolCalls(toolCalls, contexto) {
  const resultados = [];

  for (const call of toolCalls) {
    const toolId = call.tool || call.action;
    if (!toolId) continue;

    try {
      const resultado = await ejecutarTool(toolId, call.params || {}, contexto);
      resultados.push({ tool: toolId, ok: resultado.ok, resultado });
    } catch (err) {
      resultados.push({ tool: toolId, ok: false, error: err.message });
    }
  }

  return resultados;
}

// ─────────────────────────────────────────
// POST /api/chat — Enviar mensaje (SSE streaming)
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const clienteId = req.clienteId;

  // Obtener datos básicos del cliente
  let clienteNombre = '';
  let plan = 'BASICO';
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { nombre: true, plan: true }
    });
    if (cliente) {
      clienteNombre = cliente.nombre;
      plan = cliente.plan;
    }
  } catch (err) {
    console.error('Error obteniendo cliente:', err.message);
  }

  // Obtener historial para contexto
  let historial = [];
  try {
    const interacciones = await prisma.interaccionChat.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        mensajeOriginal: true,
        respuestaAgente: true
      }
    });
    historial = interacciones.reverse().flatMap(m => [
      { role: 'user', content: m.mensajeOriginal },
      { role: 'assistant', content: m.respuestaAgente || '' }
    ]);
  } catch (err) {
    console.warn('Error obteniendo historial:', err.message);
  }

  // Construir prompt con contexto completo
  const { prompt } = await buildPacoPrompt(mensaje.trim(), clienteId, historial);

  // Crear interaccion en BD (estado PENDING)
  let interaccionId = null;
  try {
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId,
        agenteId: 'paco',
        tipoPeticion: 'CONSULTAR_INFO',
        mensajeOriginal: mensaje.trim(),
        respuestaAgente: '',
        estadoChat: 'PROCESSING',
      }
    });
    interaccionId = interaccion.id;
  } catch (err) {
    console.error('Error creando interaccion:', err.message);
  }

  // ─── STREAMING SSE ───
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  // Enviar evento inicial
  res.write(`data: ${JSON.stringify({ type: 'start', interaccionId })}\n\n`);

  let respuestaCompleta = '';
  const toolCallsDetectadas = [];

  // Streaming del modelo
  try {
    const stream = callOpenClawStream(prompt, clienteNombre);

    for await (const chunk of stream) {
      if (chunk) {
        respuestaCompleta += chunk;
        // Enviar chunk al cliente
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }
    }
  } catch (err) {
    console.error('[Chat] Error en stream:', err.message);
    respuestaCompleta = getFallbackResponse(mensaje.trim());
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: respuestaCompleta })}\n\n`);
  }

  // Detectar y ejecutar tools
  const toolCalls = extractToolCalls(respuestaCompleta);
  let toolResults = [];

  if (toolCalls.length > 0) {
    res.write(`data: ${JSON.stringify({ type: 'info', content: '🔧 Ejecutando acciones solicitadas...' })}\n\n`);

    const contextoTool = {
      plan,
      clienteId,
      prisma,
      resend: RESEND,
      fetch,
      twitterToken: null,
    };

    toolResults = await ejecutarToolCalls(toolCalls, contextoTool);

    // Informar resultados
    for (const result of toolResults) {
      if (result.ok) {
        let msg = `✅ ${result.tool} completado`;
        if (result.resultado?.tareaId) msg += ` (tarea: ${result.resultado.titulo})`;
        if (result.resultado?.messageId) msg += ` (email ID: ${result.resultado.messageId})`;
        res.write(`data: ${JSON.stringify({ type: 'tool_result', content: msg, tool: result.tool, ok: true })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ type: 'tool_result', content: `❌ ${result.tool}: ${result.error}`, tool: result.tool, ok: false })}\n\n`);
      }
    }
  }

  // Final
  res.write(`data: ${JSON.stringify({ type: 'end', interaccionId })}\n\n`);
  res.end();

  // ─── GUARDAR EN BD (post-streaming) ───
  try {
    await prisma.interaccionChat.update({
      where: { id: interaccionId },
      data: {
        respuestaAgente: respuestaCompleta,
        estadoChat: 'COMPLETED',
        resultadoExitoso: true,
      }
    });
  } catch (err) {
    console.error('Error actualizando interaccion:', err.message);
  }

  // Log en memoria distribuida
  try {
    logInteraction('paco', clienteId, {
      mensaje: mensaje.trim(),
      respuesta: respuestaCompleta,
      toolsEjecutadas: toolResults.map(t => t.tool),
    });
  } catch (err) {
    console.warn('Error en logInteraction:', err.message);
  }

  console.log(`[Chat] Interaccion ${interaccionId} completada — ${respuestaCompleta.length} chars`);
});

// ─────────────────────────────────────────
// GET /api/chat/history — Historial
// ─────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const clienteId = req.clienteId;

  try {
    const interacciones = await prisma.interaccionChat.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        mensajeOriginal: true,
        respuestaAgente: true,
        createdAt: true,
        estadoChat: true,
      }
    });

    const mensajes = [];
    for (const item of interacciones.reverse()) {
      mensajes.push({
        id: `user-${item.id}`,
        role: 'user',
        content: item.mensajeOriginal,
        timestamp: item.createdAt,
        agenteId: 'paco',
      });
      if (item.respuestaAgente) {
        mensajes.push({
          id: `agent-${item.id}`,
          role: 'assistant',
          content: item.respuestaAgente,
          timestamp: item.createdAt,
          agenteId: 'paco',
        });
      }
    }

    res.json({ historial: mensajes });
  } catch (err) {
    console.error('Error historial:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Alias — GET /api/chat sin path = historial
router.get('/', authMiddleware, async (req, res) => {
  req.url = '/history';
  router.handle(req, res);
});

// ─────────────────────────────────────────
// GET /api/chat/:id — Estado de mensaje
// ─────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const interaccion = await prisma.interaccionChat.findUnique({
      where: { id: req.params.id, clienteId: req.clienteId },
    });
    if (!interaccion) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    res.json(interaccion);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// POST /api/chat/:id/acepta|rechaza — Feedback
// ─────────────────────────────────────────
router.post('/:id/acepta', authMiddleware, async (req, res) => {
  try {
    await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: true },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

router.post('/:id/rechaza', authMiddleware, async (req, res) => {
  try {
    await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: false },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

module.exports = router;
