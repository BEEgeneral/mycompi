/**
 * email.js — Inbound + Outbound email para Paco
 *
 * POST /api/email/inbound  → webhook de Resend (receives emails)
 * POST /api/email/enviar  → envía email como Paco
 * GET  /api/email/bandeja → bandeja de entrada del orquestador
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');

// ─────────────────────────────────────────
// TEST — confirmar que el route existe
// GET /api/email/test
// ─────────────────────────────────────────
router.get('/test', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ─────────────────────────────────────────
// WEBHOOK DE RESEND —Inbound email
// POST /api/email/inbound
// ─────────────────────────────────────────
router.post('/inbound', async (req, res) => {
  res.json({ ok: true, received: true });
});
  // Resend webhook verified via Resend signature — por ahora lo aceptamos directo
  // En producción añadir verificación HMAC de Resend
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Resend webhook puede venir como array de eventos
    const events = Array.isArray(payload) ? payload : [payload];

    for (const event of events) {
      // Solo procesamos emails recibidos (no bounces, delivered, etc.)
      if (event.type !== 'email') continue;

      const { email } = event.data;
      if (!email) continue;

      const de = email.from?.address || email.sender?.address || '';
      const para = email.to?.[0]?.address || '';
      const asunto = email.subject || '(sin asunto)';
      const texto = email.text || email.html || '';
      const html = email.html || '';
      const messageId = email.messageId || null;

      // Ignorar emails sin remitente o vacíos
      if (!de || !texto.trim()) continue;

      // Buscar cliente por email del remitente
      let clienteId = null;
      try {
        const cliente = await prisma.cliente.findFirst({
          where: { usuarios: { some: { email: de } }
        });
        clienteId = cliente?.id || null;
      } catch {}

      // Guardar email en BD
      const emailRecord = await prisma.email.create({
        data: {
          messageId,
          de,
          para,
          asunto,
          texto,
          html,
          raw: JSON.stringify(email),
          clienteId,
          estadoEmail: 'RECIBIDO',
        }
      });

      // Procesar en background — OpenClaw analiza y responde
      procesarEmailAsync(emailRecord.id, { de, para, asunto, texto, clienteId, messageId });
    }

    res.json({ ok: true, received: events.length });
  } catch (err) {
    console.error('Error procesando inbound email:', err);
    res.status(500).json({ error: 'Error procesando email' });
  }
});

// ─────────────────────────────────────────
// PROCESAMIENTO ASYNC de email recibido
// Llama a OpenClaw y envía respuesta
// ─────────────────────────────────────────
async function procesarEmailAsync(emailId, { de, para, asunto, texto, clienteId }) {
  try {
    await prisma.email.update({
      where: { id: emailId },
      data: { estadoEmail: 'PROCESANDO' }
    });

    // Obtener contexto del cliente si existe
    let contextoCliente = '';
    if (clienteId) {
      try {
        const cliente = await prisma.cliente.findUnique({
          where: { id: clienteId },
          select: { nombre: true, plan: true, email: true }
        });
        contextoCliente = `[Cliente: ${cliente?.nombre || de} | Plan: ${cliente?.plan || 'desconocido'}]\n`;
      } catch {}
    }

    // Llamar a OpenClaw / Paco
    let respuestaTexto = '';
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
          sessionKey: `email-${de}`,
          message: `${contextoCliente}[Email recibido]\nDe: ${de}\nAsunto: ${asunto}\n\n${texto}`,
        }),
      });

      if (openclawRes.ok) {
        const data = await openclawRes.json();
        respuestaTexto = data.reply || data.response || JSON.stringify(data);
      } else {
        respuestaTexto = getEmailFallback(de, asunto, texto);
      }
    } catch (openclawErr) {
      console.error('OpenClaw error en email:', openclawErr.message);
      respuestaTexto = getEmailFallback(de, asunto, texto);
    }

    // Enviar respuesta al cliente
    await enviarEmail({
      para: de,
      asunto: `Re: ${asunto}`,
      html: generarEmailHTML(respuestaTexto, de),
      inReplyTo: messageId,
    });

    // Actualizar estado en BD
    await prisma.email.update({
      where: { id: emailId },
      data: { estadoEmail: 'RESPONDIDO' }
    });

    // También guardar como interaccionChat si hay cliente
    if (clienteId) {
      await prisma.interaccionChat.create({
        data: {
          clienteId,
          agenteId: 'paco',
          tipoPeticion: 'CONSULTAR_INFO',
          mensajeOriginal: texto.slice(0, 500),
          respuestaAgente: respuestaTexto.slice(0, 500),
          resultadoExitoso: true,
          estadoChat: 'COMPLETED',
        }
      });
    }

  } catch (err) {
    console.error('Error en procesarEmailAsync:', err);
    await prisma.email.update({
      where: { id: emailId },
      data: { estadoEmail: 'FALLIDO' }
    }).catch(() => {});
  }
}

function getEmailFallback(de, asunto, texto) {
  const msg = texto.toLowerCase();
  if (msg.includes('precio') || msg.includes('plan') || msg.includes('cuánto')) {
    return `¡Hola!\n\nGracias por escribirme. Tienes el plan adecuado para lo que necesitas.\n\nNuestros precios:\n\n💼 Básico — 10€/mes\n📂 Equipo — 49€/mes\n🏢 Dirección — 147€/mes\n\n¿Quieres que profundicemos en alguno?`;
  }
  if (msg.includes('hola') || msg.includes('gracias')) {
    return `¡Hola!\n\nGracias por contactarla. Soy Paco, el orquestador de MyCompi.\n\n¿En qué puedo ayudarte? Puedo coordinarte con Laura (atención al cliente), Enzo (marketing), Carlos (ventas), Elena (operaciones) o Diana (data).\n\n¡Cuéntame!`;
  }
  return `¡Hola!\n\nGracias por tu mensaje. Lo he recibido y estoy procesándolo.\n\nTe respondo con lo que necesitas. ¿Hay algo específico sobre lo que quieras que profundice?\n\nUn saludo,\nPaco\nMyCompi — Tu equipo de agentes IA`;
}

function generarEmailHTML(texto, nombre) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 24px 28px; display: flex; align-items: center; gap: 12px; }
    .header-emoji { font-size: 28px; }
    .header-title { color: white; font-size: 18px; font-weight: 700; }
    .header-sub { color: rgba(255,255,255,0.75); font-size: 13px; }
    .body { padding: 28px; }
    .body p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px; white-space: pre-wrap; }
    .footer { padding: 20px 28px; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-emoji">🎯</span>
      <div>
        <div class="header-title">Paco — MyCompi</div>
        <div class="header-sub">Tu orquestador de agentes IA</div>
      </div>
    </div>
    <div class="body">
      ${texto.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
    </div>
    <div class="footer">
      <p>Enviado desde MyCompi · ¿Necesitas algo más? Responde a este email y Paco te responde al momento.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────
// ENVIAR EMAIL (como Paco)
// POST /api/email/enviar
// ─────────────────────────────────────────
router.post('/enviar', authMiddleware, async (req, res) => {
  const { para, asunto, html, inReplyTo } = req.body;

  if (!para || !asunto || !html) {
    return res.status(400).json({ error: 'para, asunto y html son requeridos' });
  }

  try {
    const result = await enviarEmail({ para, asunto, html, inReplyTo });
    res.json({ ok: true, messageId: result?.id });
  } catch (err) {
    console.error('Error enviando email:', err);
    res.status(500).json({ error: 'Error enviando email' });
  }
});

async function enviarEmail({ para, asunto, html, inReplyTo }) {
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const payload = {
    from: 'Paco — MyCompi <paco@mycompi.com>',
    to: para,
    subject: asunto,
    html,
    ...(inReplyTo ? { headers: { 'In-Reply-To': inReplyTo } } : {}),
  };

  return await resend.emails.send(payload);
}

// ─────────────────────────────────────────
// BANDEJA DE ENTRADA (para el admin)
// GET /api/email/bandeja
// ─────────────────────────────────────────
router.get('/bandeja', authMiddleware, async (req, res) => {
  try {
    const emails = await prisma.email.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        de: true,
        para: true,
        asunto: true,
        texto: true,
        estadoEmail: true,
        createdAt: true,
        clienteId: true,
      }
    });
    res.json({ emails });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo bandeja' });
  }
});

// ─────────────────────────────────────────
// MARCAR COMO PROCESADO / FALLIDO
// POST /api/email/:id/procesar
// ─────────────────────────────────────────
router.post('/:id/procesar', authMiddleware, async (req, res) => {
  try {
    const updated = await prisma.email.update({
      where: { id: req.params.id },
      data: { estadoEmail: req.body.estado || 'PROCESANDO' }
    });
    res.json({ ok: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando' });
  }
});

module.exports = router;
Thu Mar 26 15:14:01 +08 2026
# force timestamp
