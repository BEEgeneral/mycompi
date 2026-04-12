/**
 * chat.js — Chat de Paco con contexto completo + SSE streaming
 *
 * POST /api/chat          → Enviar mensaje (SSE stream)
 * GET  /api/chat/history → Historial
 * GET  /api/chat/:id     → Estado de interacción
 *
 * Usa MiniMax API directamente para respuestas rápidas.
 * Mantiene contexto completo del cliente + tools disponibles.
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');
const { logInteraction } = require('../services/agentLoader');
const { getToolsDisponibles, ejecutarTool } = require('../services/toolRegistry');
const { Resend } = require('resend');

const RESEND = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ─────────────────────────────────────────
// Configuración MiniMax (llamada directa)
// ─────────────────────────────────────────
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const MINIMAX_MODEL = 'MiniMax-M2.7';
const PACO_TIMEOUT_MS = 60000;

// ─────────────────────────────────────────
// System prompt — Paco orquestador
// ─────────────────────────────────────────
const PACO_CORE = `Eres **Paco**, el orquestador de MyCompi — una plataforma SaaS que ofrece equipos de agentes IA especializados (llamados "Compis") para PYMES españolas.

TU IDENTIDAD:
- Primer punto de contacto con el cliente
- Coordinas y diriges al equipo de agentes especializados
- Sabes TODO sobre el equipo y puedes explicar qué hace cada agente
- Si el cliente pide algo concreto, lo resuelves o coordinas con el agente adecuado

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
- No seas genérico — da información específica
- Cuando puedas HACER algo (crear tarea, enviar email), hazlo usando las tools disponibles

REGLAS CLAVE:
- Si el cliente pide algo específico ("un informe de ventas", "crear una campaña"), CONFIRMA que lo haces y usa la tool apropiada
- Si no puedes hacer algo ahora, sé honesto y explica cuándo / cómo se resolverá
- Usa las tools para registrar tareas, consultar datos, enviar emails cuando tenga sentido
- NUNCA inventes datos que no tienes — si no sabes algo, dilo

HERRAMIENTAS DISPONIBLES (plan BASICO y superior):
- registrar_tarea: Crea una tarea para el equipo. Args: titulo (string), descripcion (string, opcional), prioridad (BAJA|MEDIA|ALTA|CRITICA), agenteId (string, opcional)
- obtener_tareas: Lista tareas del cliente. Args: estado (TODO|IN_PROGRESS|COMPLETED, opcional), limite (numero, opcional)
- actualizar_tarea: Cambia estado/prioridad de una tarea. Args: tareaId (string, requerido), estado (opcional), prioridad (opcional)

HERRAMIENTAS PLAN EQUIPO:
- send_email: Envía un email. Args: para (string), asunto (string), html (string, opcional), texto (string, opcional)
- send_email_batch: Envía email a múltiples destinatarios. Args: para (array de strings), asunto (string), html (string)

HERRAMIENTAS PLAN DIRECCION:
- scrape_web: Obtiene contenido de una URL. Args: url (string), pregunta (string, opcional)
- buscar_en_web: Busca en Google. Args: consulta (string), numResultados (numero, opcional)
- publicar_tweet: Publica un tweet. Args: texto (string, max 280 chars)`;

// ─────────────────────────────────────────
// Construir contexto completo del cliente
// ─────────────────────────────────────────
async function buildClienteContext(clienteId) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        agentes: {
          where: { activo: true },
          select: { id: true, nombre: true, tipo: true }
        }
      }
    });

    if (!cliente) return { cliente: null, context: '' };

    const docs = await prisma.documento.findMany({
      where: { clienteId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const tareasPendientes = await prisma.trabajo.count({
      where: { clienteId, estado: { in: ['TODO', 'IN_PROGRESS'] } }
    });

    const agentesActivos = cliente.agentes.map(a => a.nombre).join(', ') || 'Ninguno todavía';

    const docsText = docs.length > 0
      ? `\n**DOCUMENTOS:**\n${docs.map(d => `- [${d.tipo}] ${d.titulo}: ${d.contenido.slice(0, 150)}`).join('\n')}`
      : '\n**DOCUMENTOS:** Sin documentos aún';

    const context = `
**INFO DEL CLIENTE:**
- Nombre: ${cliente.nombre}
- Empresa: ${cliente.empresa || 'No especificada'}
- Plan: ${cliente.plan}
- Email: ${cliente.email}
${cliente.webUrl ? `- Web: ${cliente.webUrl}` : ''}

**EQUIPO ASIGNADO:** ${agentesActivos}
**TAREAS PENDIENTES:** ${tareasPendientes}
${docsText}`;

    return { cliente, context };
  } catch (err) {
    console.error('Error buildClienteContext:', err.message);
    return { cliente: null, context: '' };
  }
}

// ─────────────────────────────────────────
// Construir prompt para Paco
// ─────────────────────────────────────────
async function buildPacoPrompt(mensaje, clienteId, historial = []) {
  const { context } = await buildClienteContext(clienteId);

  if (!context) {
    return `${PACO_CORE}\n\n[ERROR: Cliente no encontrado]`;
  }

  const historialTexto = historial.length > 0
    ? `\n\n**CONVERSACIÓN RECIENTE:**\n${historial.map(m => {
      const rol = m.role === 'user' ? 'Cliente' : 'Paco';
      return `${rol}: ${m.content}`;
    }).join('\n')}`
    : '\n\n(Primera interacción — sin historial previo)';

  return `${PACO_CORE}

---

## CONTEXTO DEL CLIENTE ACTUAL
${context}

${historialTexto}

---

**Cliente ahora:** ${mensaje}

Responde como Paco. Si puedes usar una tool para resolver la petición, incluye en tu respuesta (NO fuera de ella) un bloque JSON:
\`\`\`json
{"tool": "nombre_tool", "params": {...}}
\`\`\`

Pero solo si es algo concreto que el cliente pide. Para preguntas normales, responde directamente sin tool.`;
}

// ─────────────────────────────────────────
// Parser SSE robusto — acumula líneas completas
// ─────────────────────────────────────────
class SSEParser {
  constructor() {
    this.buffer = '';
    this.eventType = 'message';
  }

  // Recibe un chunk y devuelve array de mensajes SSE completos procesables
  parseChunk(chunk) {
    this.buffer += chunk;
    const events = [];
    let lines = this.buffer.split('\n');

    // La última línea puede estar incompleta si el chunk no terminó en \n
    this.buffer = lines.pop() || '';

    for (const raw of lines) {
      // Una línea SSE puede ser:
      //   event: type
      //   data: payload
      //   (línea vacía = fin de evento en teoría, pero usamos \n como separador)
      const line = raw.trim();
      if (!line) continue;

      if (line.startsWith('event:')) {
        this.eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (data) {
          events.push({ type: this.eventType, data });
        }
      }
      // Ignorar otros tipos de línea (id:, retry:, etc.)
    }

    return events;
  }

  flush() {
    // Procesar lo que quede en el buffer como última línea
    if (this.buffer.trim()) {
      const line = this.buffer.trim();
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        if (data) return [{ type: this.eventType, data }];
      }
    }
    return [];
  }
}

// ─────────────────────────────────────────
// Llamar a MiniMax con streaming SSE
// ─────────────────────────────────────────
async function* callMiniMaxStream(prompt) {
  if (!MINIMAX_API_KEY) {
    yield '⚠️ Sistema no configurado: MINIMAX_API_KEY no disponible.\n\n';
    return;
  }

  const systemPart = prompt.split('**Cliente ahora:')[0];
  const userContent = '**Cliente ahora:** ' + (prompt.split('**Cliente ahora:**').pop() || '');

  const messages = [
    { role: 'system', content: systemPart.trim() },
    { role: 'user', content: userContent }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PACO_TIMEOUT_MS);

    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages,
        max_tokens: 1500,
        temperature: 0.7,
        stream: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      yield `❌ Error de MiniMax (${response.status}): ${errorText.slice(0, 200)}\n`;
      return;
    }

    // Parser SSE robusto
    const parser = new SSEParser();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        for (const event of parser.flush()) {
          if (event.type === 'message' && event.data && event.data !== '[DONE]') {
            try {
              const parsed = JSON.parse(event.data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch { /* ignore */ }
          }
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const events = parser.parseChunk(chunk);

      for (const event of events) {
        if (event.type === 'message' && event.data) {
          if (event.data === '[DONE]') {
            for (const e of parser.flush()) {
              if (e.type === 'message' && e.data && e.data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(e.data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) yield content;
                } catch { /* ignore */ }
              }
            }
            return;
          }
          try {
            const parsed = JSON.parse(event.data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch { /* ignore */ }
        }
      }
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      yield '⏱️ Timeout (60s) esperando respuesta de MiniMax.\n';
    } else {
      yield `❌ Error conectando con MiniMax: ${err.message}\n`;
    }
  }
}

// ─────────────────────────────────────────
// Fallback si OpenClaw no está disponible
// ─────────────────────────────────────────
function getFallbackResponse(mensaje) {
  const msg = mensaje.toLowerCase();

  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto') || msg.includes(' cuesta')) {
    return `Nuestros planes:\n\n💼 **Básico** — 10€/mes (Laura + manager)\n📂 **Equipo** — 49€/mes (Laura, Enzo, Carlos + manager)\n🏢 **Dirección** — 147€/mes (Todos + director)\n\n¿Quieres más info sobre alguno?`;
  }

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return `¡Hola! 👋 Soy Paco, tu orquestador en MyCompi.\n\nPuedo ayudarte con:\n\n📊 **Marketing** — Enzo crea campañas y contenido\n💼 **Ventas** — Carlos gestiona leads\n💬 **Atención al cliente** — Laura responde dudas\n⚙️ **Operaciones** — Elena automatiza procesos\n💻 **Desarrollo** — Marcos construye tu web\n\n¿Qué necesitas?`;
  }

  if (msg.includes('tarea') || (msg.includes('crear') && msg.includes('tarea'))) {
    return `¡Genial! Puedo crear una tarea para tu equipo.\n\nSolo dime:\n1. ¿Qué necesitas?\n2. ¿Qué agente debería encargarse?\n3. ¿Prioridad alta, media o baja?\n\nLo registro y el equipo lo ejecuta.`;
  }

  if (msg.includes('lead') || msg.includes('cliente') || msg.includes('venta')) {
    return `Para ventas y gestión de clientes, Carlos es el agente ideal. Él puede:\n\n📋 Seguimiento de leads\n🤝 Cualificación automática\n📧 Secuencias de email\n💰 Cierre de operaciones\n\n¿Quieres que le pase tu consulta o crees una tarea para él?`;
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
// Extraer tool calls de la respuesta del modelo
// ─────────────────────────────────────────
function extractToolCalls(texto) {
  const toolCalls = [];
  const seen = new Set();

  // Buscar bloques JSON en la respuesta
  const jsonBlocks = texto.match(/```json\s*\{[\s\S]*?\}\s*```/gi) || [];

  for (const block of jsonBlocks) {
    const jsonStr = block.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tool && !seen.has(parsed.tool)) {
        seen.add(parsed.tool);
        toolCalls.push(parsed);
      }
    } catch {
      // Try to extract tool name
      const m = jsonStr.match(/"tool"\s*:\s*"([^"]+)"/);
      if (m && !seen.has(m[1])) {
        seen.add(m[1]);
        toolCalls.push({ tool: m[1], params: {} });
      }
    }
  }

  // Also search for inline JSON: {"tool": "name", ...}
  const inlineMatches = texto.matchAll(/\{[^{}]*"tool"\s*:\s*"([^"]+)"[^{}]*\}/g);
  for (const m of inlineMatches) {
    const jsonStr = m[0];
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tool && !seen.has(parsed.tool)) {
        seen.add(parsed.tool);
        toolCalls.push(parsed);
      }
    } catch { /* ignore */ }
  }

  return toolCalls;
}

// ─────────────────────────────────────────
// Ejecutar tool calls detectados
// ─────────────────────────────────────────
async function ejecutarToolCalls(toolCalls, contexto) {
  const resultados = [];

  for (const call of toolCalls) {
    const toolId = call.tool;
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
      select: { mensajeOriginal: true, respuestaAgente: true }
    });
    historial = interacciones.reverse().flatMap(m => [
      { role: 'user', content: m.mensajeOriginal },
      { role: 'assistant', content: m.respuestaAgente || '' }
    ]);
  } catch (err) {
    console.warn('Error obteniendo historial:', err.message);
  }

  // ─── SEED PLAN 30 DÍAS — mensaje especial para activar el plan ───
  if (mensaje.trim() === '__SEED_PLAN_30__') {
    try {
      const { seed } = require('../scripts/seed-plan-30dias');
      await seed(clienteId);

      // Guardar en memoria/agente para tracking
      try {
        await prisma.interaccionChat.create({
          data: {
            clienteId,
            agenteId: 'paco',
            tipoPeticion: 'MODIFICAR_SOLICITUD',
            mensajeOriginal: '[Seed plan 30 días activado]',
            respuestaAgente: 'Plan de 30 días activado correctamente',
            estadoChat: 'COMPLETED',
            resultadoExitoso: true,
          }
        });
      } catch (e) { /* no critical */ }

      return res.json({
        ok: true,
        interaccionId: null,
        respuesta: '✅ Plan de 30 días activado. Los Compis ya tienen sus tareas.',
        agenteId: 'paco',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error seed plan 30:', err);
      return res.json({
        ok: false,
        respuesta: '⚠️ No pude activar el plan. Avisa a un administrador.',
        agenteId: 'paco',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ─── ONBOARDING — mensaje especial para primera bienvenida ───
  if (mensaje.trim() === '__MYCOMPI_ONBOARDING__') {
    const clienteData = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { nombre: true, plan: true, createdAt: true }
    });

    const onboardingPrompt = `Eres Paco, el orquestador de MyCompi. Un nuevo cliente acaba de entrar a su dashboard por primera vez.

**Cliente:** ${clienteData?.nombre || 'Cliente'}
**Plan:** ${clienteData?.plan || 'BASICO'}

Tu trabajo ahora es enviarle UN SOLO mensaje de bienvenida que:
1. Le salude de forma cálida y cercana
2. Le explique brevemente qué puede hacer (3-4 cosas concretas que Pacocoordina)
3. Le proponga un primer paso concreto (ej: "Dime en qué trabaja tu empresa y te presento al equipo")
4. Sea corto — máximo 4-5 líneas
5. Tono informal, directo,emoji, sin ser corporativo

Responde SOLO con el mensaje a enviar. No pongas nombre del cliente en el mensaje.

Respuesta:`;

    let respuestaOnboarding = '';
    try {
      const stream = callMiniMaxStream(onboardingPrompt);
      for await (const chunk of stream) {
        respuestaOnboarding += chunk;
      }
    } catch (err) {
      respuestaOnboarding = `¡Hola! 👋 Soy Paco, tu orquestador en MyCompi.\n\nTu equipo de Compis está listo para trabajar. Dime en qué trabaja tu empresa y te presento al equipo. 🚀`;
    }

    // Guardar interacción
    try {
      await prisma.interaccionChat.create({
        data: {
          clienteId,
          agenteId: 'paco',
          tipoPeticion: 'CONSULTAR_INFO',
          mensajeOriginal: '[Onboarding automático]',
          respuestaAgente: respuestaOnboarding,
          estadoChat: 'COMPLETED',
          resultadoExitoso: true,
        }
      });
    } catch (e) { console.error('Error guardando onboarding:', e.message); }

    return res.json({
      ok: true,
      interaccionId: null,
      respuesta: respuestaOnboarding,
      agenteId: 'paco',
      timestamp: new Date().toISOString(),
    });
  }

  // Construir prompt
  const prompt = await buildPacoPrompt(mensaje.trim(), clienteId, historial);

  // Crear interaccion en BD
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

  // ─── LLAMADA A MINIMAX (respuesta simple JSON) ───
  let respuestaCompleta = '';

  try {
    // Llamada streaming interna para obtener respuesta
    const stream = callMiniMaxStream(prompt);
    for await (const chunk of stream) {
      respuestaCompleta += chunk;
    }
  } catch (err) {
    console.error('[Chat] Error en stream:', err.message);
    respuestaCompleta = getFallbackResponse(mensaje.trim());
  }

  // Detectar y ejecutar tools
  const toolCalls = extractToolCalls(respuestaCompleta);
  const toolResults = [];

  if (toolCalls.length > 0) {
    const contextoTool = {
      plan,
      clienteId,
      prisma,
      resend: RESEND,
      fetch,
      twitterToken: null,
    };

    for (const result of await ejecutarToolCalls(toolCalls, contextoTool)) {
      toolResults.push(result);
    }
  }

  // ─── RESPONDER AL CLIENTE ───
  res.json({
    ok: true,
    interaccionId,
    respuesta: respuestaCompleta,
    agenteId: 'paco',
    timestamp: new Date().toISOString(),
    toolsEjecutadas: toolResults.map(r => ({ tool: r.tool, ok: r.ok })),
  });

  // ─── GUARDAR EN BD (post-response) ───
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
      toolsEjecutadas: toolCalls.map(t => t.tool),
    });
  } catch (err) {
    console.warn('Error en logInteraction:', err.message);
  }

  console.log(`[Chat] Interaccion ${interaccionId} completada — ${respuestaCompleta.length} chars, ${toolCalls.length} tools`);
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

// Alias — GET /api/chat → historial
router.get('/', authMiddleware, async (req, res) => {
  req.url = '/history';
  router.handle(req, res);
});

// ─────────────────────────────────────────
// GET /api/chat/:id — Estado
// ─────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const interaccion = await prisma.interaccionChat.findUnique({
      where: { id: req.params.id, clienteId: req.clienteId },
    });
    if (!interaccion) return res.status(404).json({ error: 'No encontrado' });
    res.json(interaccion);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// POST /api/chat/:id/acepta|rechaza
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
