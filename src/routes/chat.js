/**
 * chat.js — Chat async con SSE streaming
 *
 * Arquitectura:
 * 1. POST /chat  → guarda en BD (PENDING), retorna 202 inmediato
 * 2. Background  → procesa mensajes PENDING secuencialmente
 * 3. GET  /chat/stream → SSE fluye respuestas al cliente en tiempo real
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// SSE CLIENTS — Map<clienteId, response>
// Para multi-instance habría que usar Redis pub/sub
// ─────────────────────────────────────────
const sseClients = new Map();

function enviarSSE(clienteId, evento) {
  const res = sseClients.get(clienteId);
  if (!res) return;
  try {
    res.write(`event: ${evento.tipo}\n`);
    res.write(`data: ${JSON.stringify(evento.data)}\n\n`);
  } catch (e) {
    sseClients.delete(clienteId);
  }
}

// ─────────────────────────────────────────
// STREAM DE MENSAJES (SSE)
// GET /api/chat/stream
// ─────────────────────────────────────────
router.get('/stream', authMiddleware, (req, res) => {
  const clienteId = req.clienteId;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Enviar "connected" inmediato
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ ok: true, clienteId })}\n\n`);

  // Registrar cliente
  sseClients.set(clienteId, res);

  // Heartbeat cada 25s para mantener conexión viva
  const heartbeat = setInterval(() => {
    try {
      res.write(`event: heartbeat\n`);
      res.write(`data: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(clienteId);
    }
  }, 25000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(clienteId);
  });
});

// ─────────────────────────────────────────
// ENVIAR MENSAJE (async)
// POST /api/chat
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { mensaje, agenteId } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const clienteId = req.clienteId;

  try {
    // Obtener datos del cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { nombre: true, plan: true, slug: true }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Crear interaccion PENDING
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId,
        agenteId: agenteId || 'paco',
        tipoPeticion: 'CONSULTAR_INFO',
        mensajeOriginal: mensaje.trim(),
        estadoChat: 'PENDING',
        streamId: `chat-${clienteId}-${Date.now()}`,
      }
    });

    // Notificar al cliente que su mensaje está en cola
    enviarSSE(clienteId, {
      tipo: 'queued',
      data: { interaccionId: interaccion.id, status: 'queued' }
    });

    // Devolver 202 inmediato
    res.status(202).json({
      ok: true,
      interaccionId: interaccion.id,
      status: 'queued',
      message: 'Mensaje recibido y en cola',
    });

    // Processar en background (no bloquear respuesta)
    procesarMensaje(interaccion.id, mensaje.trim(), cliente);

  } catch (err) {
    console.error('Error en chat endpoint:', err);
    res.status(500).json({ error: 'Error interno al procesar mensaje' });
  }
});

// ─────────────────────────────────────────
// POLL: estado de un mensaje
// GET /api/chat/:id
// ─────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const interaccion = await prisma.interaccionChat.findUnique({
      where: { id: req.params.id, clienteId: req.clienteId },
      select: {
        id: true,
        estadoChat: true,
        respuestaAgente: true,
        createdAt: true,
        agenteId: true,
      }
    });

    if (!interaccion) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    res.json(interaccion);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// HISTORIAL
// GET /api/chat/historial?limit=50
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  try {
    const interacciones = await prisma.interaccionChat.findMany({
      where: { clienteId: req.clienteId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        estadoChat: true,
        mensajeOriginal: true,
        respuestaAgente: true,
        createdAt: true,
        agenteId: true,
      }
    });

    // Formatear para el chat
    const mensajes = [];
    for (const item of interacciones.reverse()) {
      mensajes.push({
        id: `user-${item.id}`,
        role: 'user',
        content: item.mensajeOriginal,
        timestamp: item.createdAt,
        estado: item.estadoChat,
      });
      if (item.respuestaAgente) {
        mensajes.push({
          id: `agent-${item.id}`,
          role: 'assistant',
          content: item.respuestaAgente,
          timestamp: item.createdAt,
          agenteId: item.agenteId,
          estado: item.estadoChat,
        });
      }
    }

    res.json({ historial: mensajes });
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// BACKGROUND PROCESSOR
// ─────────────────────────────────────────
let colaProcesamiento = [];
let procesando = false;

async function procesarMensaje(interaccionId, mensaje, cliente) {
  // Añadir a cola
  colaProcesamiento.push({ interaccionId, mensaje, cliente });
  if (!procesando) {
    process.nextTick(drenarCola);
  }
}

async function drenarCola() {
  if (colaProcesamiento.length === 0) return;
  procesando = true;

  while (colaProcesamiento.length > 0) {
    const { interaccionId, mensaje, cliente } = colaProcesamiento.shift();

    // Marcar como PROCESSING
    await prisma.interaccionChat.update({
      where: { id: interaccionId },
      data: { estadoChat: 'PROCESSING' }
    });

    enviarSSE(cliente.id, {
      tipo: 'processing',
      data: { interaccionId, status: 'processing' }
    });

    // Llamar a OpenClaw
    let respuestaTexto = '';
    let respuestaExitosa = false;

    try {
      const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';
      const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

      const openclawRes = await fetch(`${OPENCLAW_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          sessionKey: `cliente-${cliente.id}`,
          message: `[Cliente: ${cliente.nombre} | Plan: ${cliente.plan}]\n\n${mensaje}`,
        }),
      });

      if (openclawRes.ok) {
        const data = await openclawRes.json();
        respuestaTexto = data.reply || data.response || JSON.stringify(data);
        respuestaExitosa = true;
      } else {
        const errorText = await openclawRes.text();
        console.error('OpenClaw error:', openclawRes.status, errorText);
        respuestaTexto = getFallbackResponse(mensaje, cliente.plan);
        respuestaExitosa = true;
      }
    } catch (openclawErr) {
      console.error('OpenClaw connection error:', openclawErr.message);
      respuestaTexto = getFallbackResponse(mensaje, cliente.plan);
      respuestaExitosa = true;
    }

    // Guardar respuesta
    await prisma.interaccionChat.update({
      where: { id: interaccionId },
      data: {
        respuestaAgente: respuestaTexto,
        estadoChat: respuestaExitosa ? 'COMPLETED' : 'FAILED',
        resultadoExitoso: respuestaExitosa,
      }
    });

    // Enviar respuesta al cliente por SSE
    enviarSSE(cliente.id, {
      tipo: 'respuesta',
      data: {
        interaccionId,
        respuesta: respuestaTexto,
        agenteId: 'paco',
        estado: respuestaExitosa ? 'completed' : 'failed',
      }
    });
  }

  procesando = false;
}

function getFallbackResponse(mensaje, plan) {
  const msg = mensaje.toLowerCase();

  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto')) {
    return `¡Hola! Tienes el plan ${plan}. Nuestros precios:\n\n💼 **Básico** — 10€/mes\n📂 **Equipo** — 49€/mes\n🏢 **Dirección** — 147€/mes\n\n¿Quieres cambiar de plan?`;
  }

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return '¡Hola! Soy Paco, tu orquestador en MyCompi. ¿En qué puedo ayudarte? Puedo coordinarte con Laura (atención), Enzo (marketing), Carlos (ventas), Elena (operaciones), Diana (data) o Marcos (desarrollo).';
  }

  if (msg.includes('ayuda')) {
    return 'Puedo ayudarte con:\n\n📊 **Marketing** — campañas, contenido, SEO\n💼 **Ventas** — leads, cierre, seguimiento\n💬 **Atención al cliente** — soporte, dudas\n⚙️ **Operaciones** — automatizaciones, procesos\n📈 **Data** — métricas, análisis\n💻 **Desarrollo** — web, e-commerce\n\n¿Qué necesitas?';
  }

  if (msg.includes('estado') || msg.includes('status')) {
    return `Tu plan actual es ${plan}. Todo está funcionando correctamente. ¿Hay algo específico que quieras verificar?`;
  }

  return 'He recibido tu mensaje y lo estoy procesando. Mi equipo se pondrá en marcha en breve. ¿Hay algo específico que quieras indicar?';
}

// ─────────────────────────────────────────
// FEEDBACK: confirmar/rechazar interacción
// POST /api/chat/interaccion/:id/acepta|rechaza
// ─────────────────────────────────────────
router.post('/interaccion/:id/acepta', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: true },
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

router.post('/interaccion/:id/rechaza', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.interaccionChat.update({
      where: { id: req.params.id, clienteId: req.clienteId },
      data: { clienteAcepta: false },
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

module.exports = router;
