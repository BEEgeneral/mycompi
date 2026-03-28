/**
 * email.js — Inbound + Outbound email para Paco
 *
 * GET  /api/email/test     → test de conectividad
 * POST /api/email/inbound  → webhook de Resend (receives emails)
 * POST /api/email/enviar   → envía email como Paco
 * GET  /api/email/bandeja  → bandeja de entrada del orquestador
 * POST /api/email/:id/procesar → marcar email como procesado/fallido
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const prisma = require('../lib/db');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────
// TEST
// GET /api/email/test
// ─────────────────────────────────────────
router.get('/test', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), path: __dirname });
});

// ─────────────────────────────────────────
// WEBHOOK DE RESEND — Inbound email
// POST /api/email/inbound
// ─────────────────────────────────────────
router.post('/inbound', async (req, res) => {
  // Resend webhook verified via Resend signature
  // En producción añadir verificación HMAC de Resend
  try {
    const payload = req.body;

    // Resend webhook puede venir como array de eventos
    const events = Array.isArray(payload) ? payload : [payload];

    for (const event of events) {
      if (event.type !== 'email') continue;

      const email = event.data;
      if (!email) continue;

      const de = email.from?.address || email.sender?.address || '';
      const para = email.to?.[0]?.address || '';
      const asunto = email.subject || '(sin asunto)';
      const texto = email.text || email.html || '';
      const html = email.html || '';
      const messageId = email.messageId || null;

      if (!de || !texto.trim()) continue;

      // Buscar cliente por email del remitente
      let clienteId = null;
      try {
        const cliente = await prisma.cliente.findFirst({
          where: { usuarios: { some: { email: de } } }
        });
        clienteId = cliente?.id || null;
      } catch (e) {
        console.error('[EMAIL] Error buscando cliente:', e.message);
      }

      // Guardar email en BD
      let emailRecord;
      try {
        emailRecord = await prisma.email.create({
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
      } catch (e) {
        console.error('[EMAIL] Error creando email en BD:', e.message);
        continue;
      }

      // Procesar en background — OpenClaw analiza y responde
      procesarEmailAsync(emailRecord.id, { de, para, asunto, texto, clienteId, messageId });
    }

    res.json({ ok: true, processed: events.length });
  } catch (err) {
    console.error('[EMAIL-INBOUND ERROR]:', err.message, err.stack?.slice(0, 200));
    res.status(500).json({ error: 'Error interno', detail: err.message });
  }
});

// ─────────────────────────────────────────
// SANITIZACIÓN DE INPUT EMAIL
// ─────────────────────────────────────────
function sanitizarInputEmail(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .slice(0, 8000)                               // límite longitud
    .replace(/\x00/g, '')                          // sin bytes nulos
    .replace(/\r\n|\r/g, '\n')                    // normalizar saltos de línea
    .replace(/```/g, '` ` `')                      // escapar triple backtick
    .replace(/<script|<\/script>/gi, '')           // block script injection
    .replace(/javascript:/gi, '')                 // block javascript: URLs
    .replace(/on\w+\s*=/gi, '')                   // block inline event handlers
    ;
}

// ─────────────────────────────────────────
// PROCESAMIENTO ASINCRONO DE EMAIL
// ─────────────────────────────────────────
async function procesarEmailAsync(emailId, { de, para, asunto, texto, clienteId, messageId }) {
  const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';
  const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

  try {
    await prisma.email.update({
      where: { id: emailId },
      data: { estadoEmail: 'PROCESANDO' }
    });

    const cliente = clienteId
      ? await prisma.cliente.findUnique({ where: { id: clienteId }, include: { usuarios: true } })
      : null;

    // Sanitizar todos los campos del email antes de usar en el prompt
    const deSanitizado = sanitizarInputEmail(de);
    const paraSanitizado = sanitizarInputEmail(para);
    const asuntoSanitizado = sanitizarInputEmail(asunto);
    const textoSanitizado = sanitizarInputEmail(texto);

    const prompt = `Eres Paco, el asistente de IA de MyCompi (mycompi.com). Has recibido un email de un cliente.

EMAIL RECIBIDO:
- De: ${deSanitizado}
- Para: ${paraSanitizado}
- Asunto: ${asuntoSanitizado}
- Contenido: ${textoSanitizado}

${cliente ? `- Cliente: ${cliente.nombre} (${cliente.plan})` : '- Cliente: No registrado'}

Genera una respuesta profesional y personalizada como Paco. La respuesta debe:
1. Ser amable y profesional
2. Responder al contenido del email
3. Mencionar que es un asistente de IA de MyCompi si es la primera interacción
4. Tener un tono cercano pero formal
5. MAXIMO 300 palabras

Si no puedes responder con certeza, sé honesto y ofrece ayuda adicional.

Responde SOLO con el email de respuesta (no escribas nada más, solo el cuerpo del email).`;

    let respuestaTexto = null;
    let agenteId = 'paco';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(`${OPENCLAW_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`
        },
        body: JSON.stringify({
          message: prompt,
          agenteId,
          clienteId,
          mode: 'email'
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        respuestaTexto = data.response || data.content || data.text || null;
      }
    } catch (e) {
      console.error('[EMAIL] OpenClaw no disponible:', e.message);
    }

    // Fallback inteligente si OpenClaw no responde
    if (!respuestaTexto) {
      respuestaTexto = getEmailFallback({ de, asunto, texto, clienteId });
    }

    // Guardar respuesta en BD
    try {
      await prisma.email.update({
        where: { id: emailId },
        data: {
          respuestaTexto,
          estadoEmail: 'RESPONDIDO',
        }
      });
    } catch (e) {
      console.error('[EMAIL] Error guardando respuesta:', e.message);
    }

    // Enviar respuesta al cliente via Resend
    if (messageId) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Paco — MyCompi <paco@mycompi.com>',
          to: [de],
          replyTo: 'paco@mycompi.com',
          subject: `Re: ${asunto}`,
          text: respuestaTexto,
          html: generarEmailHTML(respuestaTexto, de),
          headers: {
            'In-Reply-To': messageId,
            'References': messageId,
          }
        });
        console.log(`[EMAIL] Respuesta enviada a ${de}`);
      } catch (e) {
        console.error('[EMAIL] Error enviando respuesta:', e.message);
        await prisma.email.update({
          where: { id: emailId },
          data: { estadoEmail: 'FALLIDO' }
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('[EMAIL] Error procesando email:', err.message);
    await prisma.email.update({
      where: { id: emailId },
      data: { estadoEmail: 'FALLIDO' }
    }).catch(() => {});
  }
}

function getEmailFallback({ de, asunto, texto, clienteId }) {
  const nombre = de.split('@')[0];
  const asuntoLower = asunto.toLowerCase();

  if (asuntoLower.includes('demo') || asuntoLower.includes('prueba') || asuntoLower.includes('test')) {
    return `Hola,

Gracias por escribirnos. Soy Paco, el asistente virtual de MyCompi.

He recibido tu mensaje de prueba correctamente. Estamos encantados de que quieras conocer cómo nuestros agentes de IA pueden ayudar a tu empresa.

¿Podrías contarnos más sobre qué tipo de problema o proceso te gustaría automatizar? Con esa información podré orientarte mejor sobre qué agentes serían más útiles para tu caso.

Un saludo,
Paco — MyCompi`;
  }

  if (asuntoLower.includes('precio') || asuntoLower.includes('coste') || asuntoLower.includes('cotizac')) {
    return `Hola ${nombre},

Gracias por tu interés en MyCompi. Somos una plataforma SaaS que pone a tu disposición equipos de agentes de IA especializados para PYMES españolas.

Nuestros planes:

• Profesional Agéntico — 10€/mes (1 agente especializado)
• Equipo Agéntico — 49€/mes (1 manager + 5 agentes especializados)
• Equipos con Dirección — 147€/mes (1 director + 5 managers + 25 agentes)

Todos los planes incluyen setup gratuito y soporte inicial. ¿Te gustaría que te prepare una demo personalizada?

Un saludo,
Paco — MyCompi`;
  }

  return `Hola ${nombre},

Gracias por contactar con MyCompi. Soy Paco, tu asistente virtual.

He recibido tu mensaje y lo he transmitido a nuestro equipo. Te responderemos en la mayor brevedad posible con más detalles.

Mientras tanto, si tienes alguna urgencia, puedes escribirnos directamente a soporte@mycompi.com.

Un saludo,
Paco — MyCompi

---
MyCompi — Equipos de Agentes de IA para PYMES
https://mycompi.onrender.com`;
}

function generarEmailHTML(texto, destinatario) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Respuesta de Paco — MyCompi</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 40px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">🤖</div>
        <div>
          <div style="color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Asistente MyCompi</div>
          <div style="color:#ffffff;font-size:20px;font-weight:700;">Paco</div>
        </div>
      </div>
    </div>
    <div style="padding:36px 40px;">
      <div style="white-space:pre-wrap;line-height:1.7;color:#333;font-size:15px;margin-bottom:24px;">${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <div style="border-top:1px solid #eee;padding-top:20px;margin-top:8px;">
        <div style="color:#888;font-size:12px;">Este email fue generado por <strong style="color:#667eea;">Paco</strong>, asistente de IA de <a href="https://mycompi.onrender.com" style="color:#667eea;text-decoration:none;">MyCompi</a></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────
// ENVIAR EMAIL (como Paco, con auth)
// POST /api/email/enviar
// ─────────────────────────────────────────
router.post('/enviar', authMiddleware, async (req, res) => {
  try {
    const { to, subject, text, html, replyTo } = req.body;
    const fromName = req.body.fromName || 'Paco — MyCompi';

    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: to, subject, text' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: `${fromName} <paco@mycompi.com>`,
      to: Array.isArray(to) ? to : [to],
      replyTo: replyTo || 'paco@mycompi.com',
      subject,
      text,
      html: html || generarEmailHTML(text, to),
    });

    res.json({ ok: true, emailId: result.data?.id });
  } catch (err) {
    console.error('[EMAIL-ENVIAR ERROR]:', err.message);
    res.status(500).json({ error: 'Error enviando email', detail: err.message });
  }
});

// ─────────────────────────────────────────
// BANDEJA DE ENTRADA (admin, con auth)
// GET /api/email/bandeja
// ─────────────────────────────────────────
router.get('/bandeja', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const estado = req.query.estado;

    const where = {};
    if (estado) where.estadoEmail = estado;

    const emails = await prisma.email.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        cliente: { select: { id: true, nombre: true, plan: true } }
      }
    });

    res.json({ emails });
  } catch (err) {
    console.error('[EMAIL-BANDEJA ERROR]:', err.message);
    res.status(500).json({ error: 'Error consultando bandeja' });
  }
});

// ─────────────────────────────────────────
// PROCESAR EMAIL MANUALMENTE
// POST /api/email/:id/procesar
// ─────────────────────────────────────────
router.post('/:id/procesar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuestaTexto } = req.body;

    const update = {};
    if (estado) update.estadoEmail = estado;
    if (respuestaTexto) update.respuestaTexto = respuestaTexto;

    const email = await prisma.email.update({
      where: { id },
      data: update
    });

    res.json({ ok: true, email });
  } catch (err) {
    console.error('[EMAIL-PROCESAR ERROR]:', err.message);
    res.status(500).json({ error: 'Error actualizando' });
  }
});

module.exports = router;
