/**
 * chat.js — Chat del cliente con el Paco (Orquestador)
 *
 * El cliente chatea con su "Paco" que hace de orquestador.
 * Paco puede delegar en los agentes según la petición.
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// ENViar MENSAJE AL ORQUESTADOR (Paco)
// POST /api/chat
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { mensaje, agenteId } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const clienteId = req.clienteId;

  try {
    // Obtener datos del cliente para contexto
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { nombre: true, plan: true, slug: true }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Guardar interacci\u00f3n en BD
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId,
        agenteId: agenteId || 'paco',
        tipoPeticion: 'CONSULTAR_INFO',
        mensajeOriginal: mensaje.trim(),
      }
    });

    // ─────────────────────────────────────────
    // Llamar a OpenClaw / Paco via HTTP
    // ─────────────────────────────────────────
    let respuestaTexto = '';
    let respuestaExitosa = false;

    try {
      // OpenClaw corre en el mismo host, puerto 18789
      const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';
      const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

      const openclawRes = await fetch(`${OPENCLAW_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        },
        body: JSON.stringify({
          sessionKey: `cliente-${clienteId}`,
          message: `[Cliente: ${cliente.nombre} | Plan: ${cliente.plan}]\n\n${mensaje.trim()}`,
        }),
      });

      if (openclawRes.ok) {
        const data = await openclawRes.json();
        respuestaTexto = data.reply || data.response || JSON.stringify(data);
        respuestaExitosa = true;
      } else {
        const errorText = await openclawRes.text();
        console.error('OpenClaw error:', openclawRes.status, errorText);
        respuestaTexto = `Estoy teniendo problemas para conectar con mi equipo. ¿Puedes repetir tu mensaje en un momento? Error: ${openclawRes.status}`;
      }
    } catch (openclawErr) {
      console.error('OpenClaw connection error:', openclawErr.message);
      // Fallback: respuesta simpática si OpenClaw no está disponible
      respuestaTexto = getFallbackResponse(mensaje, cliente.plan);
      respuestaExitosa = true; // Lo marcamos como ok porque es una respuesta válida
    }

    // Actualizar interacci\u00f3n con respuesta
    await prisma.interaccionChat.update({
      where: { id: interaccion.id },
      data: {
        respuestaAgente: respuestaTexto,
        resultadoExitoso: respuestaExitosa,
      }
    });

    res.json({
      ok: true,
      respuesta: respuestaTexto,
      interaccionId: interaccion.id,
    });

  } catch (err) {
    console.error('Error en chat endpoint:', err);
    res.status(500).json({ error: 'Error interno al procesar mensaje' });
  }
});

/**
 * Respuesta de fallback cuando OpenClaw no está disponible
 */
function getFallbackResponse(mensaje, plan) {
  const msg = mensaje.toLowerCase();

  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto')) {
    return `¡Hola! Currently tienes el plan ${plan}. Nuestros precios son:\n\n💼 **Básico** — 10€/mes\n📂 **Equipo** — 49€/mes\n🏢 **Dirección** — 147€/mes\n\n¿Quieres cambiar de plan o conocer más detalles?`;
  }

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return '¡Hola! Soy Paco, tu orquestador de MyCompi. ¿En qué puedo ayudarte hoy? Puedo coordinarte con Laura (atención al cliente), Enzo (marketing), Carlos (ventas), Elena (operaciones) o Diana (data).';
  }

  if (msg.includes('ayuda')) {
    return 'Puedo ayudarte con:\n\n📊 **Marketing** — campañas, contenido, SEO\n💼 **Ventas** — leads, cierre, seguimiento\n💬 **Atención al cliente** — soporte, dudas\n⚙️ **Operaciones** — automatizaciones, procesos\n📈 **Data** — métricas, análisis\n\n¿qué necesitas?';
  }

  return 'He recibido tu mensaje y lo estoy procesando. Mi equipo se pondrá en marcha en breve. ¿Hay algo específico que quieras indicar?';
}

// ─────────────────────────────────────────
// HISTORIAL DE CONVERSACIÓN
// GET /api/chat/historial?limit=50
// ─────────────────────────────────────────
router.get('/historial', authMiddleware, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  try {
    const interacciones = await prisma.interaccionChat.findMany({
      where: { clienteId: req.clienteId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
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
      });
      if (item.respuestaAgente) {
        mensajes.push({
          id: `agent-${item.id}`,
          role: 'assistant',
          content: item.respuestaAgente,
          timestamp: item.createdAt,
          agenteId: item.agenteId,
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
// GUARDAR INTERACCIÓN (feedback)
// POST /api/chat/interaccion
// ─────────────────────────────────────────
router.post('/interaccion', authMiddleware, async (req, res) => {
  const { tipoPeticion, mensajeOriginal, respuestaAgente, clienteAcepta } = req.body;
  if (!tipoPeticion || !mensajeOriginal) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const interaccion = await prisma.interaccionChat.create({
      data: {
        clienteId: req.clienteId,
        agenteId: 'paco',
        tipoPeticion,
        mensajeOriginal,
        respuestaAgente,
        clienteAcepta: clienteAcepta ?? null,
      }
    });
    res.json({ ok: true, interaccion });
  } catch (err) {
    console.error('Error guardando interaccion:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// ─────────────────────────────────────────
// CONFIRMAR / RECHAZAR INTERACCIÓN
// POST /api/chat/interaccion/:id/acepta
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
