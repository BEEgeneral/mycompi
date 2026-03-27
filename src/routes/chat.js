/**
 * chat.js — Chat con OpenClaw real para Paco
 *
 * POST /api/chat  → llama a OpenClaw gateway y devuelve respuesta
 * GET  /api/chat  → historial de mensajes
 * GET  /api/chat/:id → estado de un mensaje
 *
 * Usa el endpoint /v1/chat/completions del gateway de OpenClaw
 * (disponible en localhost:18789 cuando ambos corren en el mismo host)
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// Configuración OpenClaw (desde variables de entorno o valores por defecto)
// ─────────────────────────────────────────
const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Contexto del sistema para Paco
const PACO_SYSTEM_PROMPT = `Eres **Paco**, el orquestador de MyCompi — una plataforma SaaS que ofrece equipos de agentes IA especializados para PYMES españolas.

TU IDENTIDAD: Eres el primer punto de contacto con el cliente. Tu trabajo es recibir peticiones, responder de forma útil, y coordinar con los agentes especializados cuando sea necesario.

EQUIPO DE AGENTES:
- 💬 **Laura Montes** — Atención al Cliente (soporte 24/7)
- 📊 **Enzo Herrera** — Marketing (campañas, contenido, SEO)
- 💼 **Carlos Mendoza** — Ventas (leads, cierre, seguimiento)
- ⚙️ **Elena Ortega** — Operaciones (automatizaciones)
- 📈 **Diana Palau** — Data (métricas y análisis)
- 💻 **Marcos Fernández** — Desarrollo Web (web y e-commerce)
- 🤖 **Pelayo** — Asistente personal

PLANES DISPONIBLES:
- **Básico** (10€/mes) → Laura + manager
- **Equipo** (49€/mes) → Laura, Enzo, Carlos + manager
- **Dirección** (147€/mes) → Todos los agentes + manager + director

TU ESTILO:
- Informal, directo, cercano — tutea siempre
- Usa emojis de forma natural, no en exceso
- Responde en español de España
- Si no sabes algo, dilo honestamente
- Siempre sugiere el siguiente paso concreto
- Cuando derive a otro agente, sé específico sobre qué podrán hacer

RESPUESTAS:
- Cuando el cliente pregunte por su equipo, menciona los agentes que tiene según su plan
- Cuando pida algo de un agente específico, confirma que se lo derivas
- Para preguntas de información general, responde tú directamente con ayuda del equipo
- Sé proactivo: sugiere cosas útiles que podrían necesitar según el contexto`;

const PACO_TIMEOUT_MS = 25000; // 25 segundos

// ─────────────────────────────────────────
// Llamada al gateway de OpenClaw via HTTP
// ─────────────────────────────────────────
async function callOpenClaw(mensaje, clienteNombre, plan, historial = []) {
  if (!OPENCLAW_TOKEN) {
    console.warn('[Paco] OPENCLAW_TOKEN no configurado, usando fallback');
    return null;
  }

  // Construir mensajes para OpenAI-compatible API
  const messages = [
    { role: 'system', content: `${PACO_SYSTEM_PROMPT}\n\nCliente actual: ${clienteNombre} (plan: ${plan})` },
    ...historial.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: mensaje }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PACO_TIMEOUT_MS);

    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
        'x-openclaw-agent-id': 'main'
      },
      body: JSON.stringify({
        model: 'minimax/MiniMax-M2.7',
        messages,
        max_tokens: 1024,
        temperature: 0.8
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Paco] OpenClaw error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[Paco] Respuesta vacía de OpenClaw');
      return null;
    }

    return content;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[Paco] Timeout llamando a OpenClaw');
    } else {
      console.error('[Paco] Error conectando a OpenClaw:', err.message);
    }
    return null;
  }
}

// ─────────────────────────────────────────
// FALLBACK — respuestas predefinidas
// ─────────────────────────────────────────
function getFallbackResponse(mensaje, clienteNombre, plan) {
  const msg = mensaje.toLowerCase();

  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto') || msg.includes(' cuesta')) {
    return `¡Hola${clienteNombre ? ', ' + clienteNombre.split(' ')[0] : ''}! Tienes el plan **${plan}**. Nuestros precios:\n\n💼 **Básico** — 10€/mes\n📂 **Equipo** — 49€/mes\n🏢 **Dirección** — 147€/mes\n\n¿Quieres cambiar de plan o profundizar en alguno?`;
  }

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas') || msg.includes('buen día')) {
    return `¡Hola${clienteNombre ? ', ' + clienteNombre.split(' ')[0] : ''}! 👋\n\nSoy **Paco**, tu orquestador en MyCompi. Coordino un equipo de agentes especializados para tu negocio.\n\nPuedo ayudarte con:\n\n📊 **Marketing** — Enzo crea campañas y contenido\n💼 **Ventas** — Carlos gestiona leads y cierra\n💬 **Atención al cliente** — Laura responde dudas\n⚙️ **Operaciones** — Elena automatiza procesos\n📈 **Data** — Diana analiza métricas\n💻 **Desarrollo** — Marcos construye tu web\n\n¿qué necesitas?`;
  }

  if (msg.includes('equipo') || msg.includes('agente')) {
    const agentes = plan === 'DIRECCION'
      ? 'Laura, Enzo, Carlos, Elena, Diana y Marcos'
      : plan === 'EQUIPO'
      ? 'Laura, Enzo y Carlos'
      : 'Laura (atención al cliente)';
    return `Tu equipo actual incluye: **${agentes}**.\n\nCada agente es un profesional especializado que trabaja 24/7 para tu negocio. ¿Quieres que coordine algo específico con alguno de ellos?`;
  }

  if (msg.includes('lead') || msg.includes('cliente') || msg.includes('venta')) {
    return `Para gestionar ventas y clientes, Carlos (nuestro agente de Ventas) es el más indicado. Él puede:\n\n📋 Hacer seguimiento de leads\n🤝 Cualificarlos automáticamente\n📧 Enviar secuencias de email\n💰 Cerrar operaciones\n\n¿Quieres que le pase tu consulta?`;
  }

  if (msg.includes('marketing') || msg.includes('campaña') || msg.includes('contenido') || msg.includes('seo')) {
    return `Enzo, nuestro agente de Marketing, puede ayudarte con:\n\n📝 Creación de contenido para redes\n📣 Campañas de email marketing\n🔍 SEO y posicionamiento\n🎨 Diseños y creatividades\n\n¿Qué quieres empezar?`;
  }

  if (msg.includes('web') || msg.includes('página') || msg.includes('e-commerce')) {
    return `Marcos, nuestro agente de Desarrollo Web, puede crear:\n\n🌐 Páginas web profesionales\necommerce Tiendas online con pasarela de pago\n📱 Landing pages de alta conversión\n\n¿Tienes un proyecto en mente?`;
  }

  if (msg.includes(' automatiz') || msg.includes('proceso') || msg.includes('eficiencia')) {
    return `Elena, de Operaciones, puede automatizar procesos repetitivos de tu negocio:\n\n🔄 Envío automático de emails\n📊 Reportes periódicos\n✅ Tareas programadas\n🔗 Integraciones entre herramientas\n\n¿Cuál es el proceso que quieres automatizar?`;
  }

  if (msg.includes('data') || msg.includes('métrica') || msg.includes('analítica') || msg.includes('analytics')) {
    return `Diana, nuestra agente de Data, puede ayudarte con:\n\n📈 Reporting y dashboards\n🔍 Análisis de tendencias\n💡 Insights de negocio\n📊 Predicciones basadas en datos\n\n¿Qué quieres medir o analizar?`;
  }

  if (msg.includes('ayuda')) {
    return `Puedo ayudarte con casi cualquier cosa relacionada con tu negocio. Solo dime qué necesitas y yo coordino con el agente adecuado.\n\nAlgunos ejemplos:\n• "Crea una campaña de email"\n• "Resumen de mis leads"\n• "Automatiza mi respuesta a clientes"\n• "Analiza mi tráfico web"`;
  }

  return `He recibido tu mensaje: "${mensaje.slice(0, 50)}${mensaje.length > 50 ? '...' : ''}"\n\nLo estoy procesando. Si es urgente, dime qué necesitas y lo traslado al agente correspondiente.\n\nTambién puedes preguntarme sobre precios, tu equipo, o qué pueden hacer Laura, Enzo, Carlos, Elena, Diana o Marcos.`;
}

// ─────────────────────────────────────────
// ENVIAR MENSAJE
// POST /api/chat
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const clienteId = req.clienteId;

  // Obtener datos del cliente
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

  // Obtener historial reciente para contexto
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

  // Intentar OpenClaw, si falla usar fallback
  let respuestaTexto = await callOpenClaw(mensaje.trim(), clienteNombre, plan, historial);

  if (!respuestaTexto) {
    respuestaTexto = getFallbackResponse(mensaje.trim(), clienteNombre, plan);
  }

  // Guardar en BD
  let interaccionId = null;
  try {
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId,
        agenteId: 'paco',
        tipoPeticion: 'CONSULTAR_INFO',
        mensajeOriginal: mensaje.trim(),
        respuestaAgente: respuestaTexto,
        estadoChat: 'COMPLETED',
        resultadoExitoso: true,
      }
    });
    interaccionId = interaccion.id;
  } catch (err) {
    console.error('Error guardando interaccion:', err.message);
  }

  res.json({
    ok: true,
    interaccionId,
    respuesta: respuestaTexto,
    agenteId: 'paco',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────
// HISTORIAL
// GET /api/chat?limit=50
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
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
        agenteId: true,
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
        estado: item.estadoChat,
      });
      if (item.respuestaAgente) {
        mensajes.push({
          id: `agent-${item.id}`,
          role: 'assistant',
          content: item.respuestaAgente,
          timestamp: item.createdAt,
          agenteId: item.agenteId || 'paco',
          estado: item.estadoChat,
        });
      }
    }

    res.json({ historial: mensajes });
  } catch (err) {
    console.error('Error historial:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// ESTADO DE UN MENSAJE
// GET /api/chat/:id
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
// FEEDBACK
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
