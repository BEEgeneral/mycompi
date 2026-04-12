/**
 * onboarding-sequence.js — Email onboarding sequence para nuevos clientes
 *
 * Sistema de emails automáticos tras activación de cuenta:
 * - Día 0 (activación): Bienvenida + quick wins (ya existe como email bienvenida)
 * - Día 1: Email "Tu primer día con MyCompi" — quick wins, chat con Paco
 * - Día 3: Email "¿Cómo vas?" — tips, caso de éxito, introduce a los agentes
 * - Día 7: Email "7 días" — resumen actividad, próximo paso claro
 *
 * La secuencia se lanza cuando el cliente activa su cuenta (POST /api/auth/activar).
 */
const express = require('express');
const router = express.Router();
const prisma = require('../lib/db');

// Inline auth middleware para evitar dependencia circular
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.usuarioId;
    req.clienteId = decoded.clienteId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
const { Resend } = require('resend');

// ─────────────────────────────────────────
// TABLA: Secuencia de onboarding por email
// ─────────────────────────────────────────
/**
 * Se añade a schema.prisma:
 *
 * model OnboardingSequence {
 *   id            String   @id @default(cuid())
 *   clienteId     String   @unique
 *   dia0Sent      Boolean  @default(false)  // email bienvenida
 *   dia1Sent      Boolean  @default(false)
 *   dia3Sent      Boolean  @default(false)
 *   dia7Sent      Boolean  @default(false)
 *   startedAt     DateTime @default(now())
 *   lastEmailAt   DateTime?
 * }
 */

// ─────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────
const TEMPLATES = {
  dia1: {
    subject: 'Tu primer día con MyCompi — 3 cosas que puedes hacer hoy 🎯',
    getHtml: (nombre) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu primer día con MyCompi</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Poppins',Segoe UI,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:#2D3261;padding:32px 40px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;background:#FFD154;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">🚀</div>
            <div>
              <div style="color:#FFD154;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Día 1</div>
              <div style="color:#ffffff;font-size:22px;font-weight:700;">Tu primer día con MyCompi</div>
            </div>
          </div>
        </div>
        <div style="padding:36px 40px;">
          <p style="font-size:17px;color:#333;margin-top:0;">Hola ${nombre},</p>
          <p style="font-size:16px;color:#444;line-height:1.7;">Ya tienes tu equipo de 7 Compis agénticos listos para trabajar 24/7. Aquí van <strong>3 cosas que puedes hacer hoy</strong> para empezar a sacarles partido:</p>

          <div style="margin:24px 0;">
            <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
              <div style="width:36px;height:36px;background:#FFD154;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">💬</div>
              <div>
                <strong style="color:#2D3261;font-size:15px;">1. Escríbele a Paco</strong>
                <p style="margin:4px 0 0 0;color:#555;font-size:14px;line-height:1.6;">Abre el chat y cuéntale qué necesitas. Paco coordina todo el equipo y traduce tus peticiones en acciones concretas.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
              <div style="width:36px;height:36px;background:#FFD154;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📋</div>
              <div>
                <strong style="color:#2D3261;font-size:15px;">2. Revisa tus primeras tareas</strong>
                <p style="margin:4px 0 0 0;color:#555;font-size:14px;line-height:1.6;">Hemos preparado 5 tareas de onboarding para tu equipo. Las encontrarás en tu dashboard. Puedes aceptarlas, modificarlas o ignorarlas.</p>
              </div>
            </div>
            <div style="display:flex;gap:16px;align-items:flex-start;">
              <div style="width:36px;height:36px;background:#FFD154;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🤖</div>
              <div>
                <strong style="color:#2D3261;font-size:15px;">3. Preséntate al equipo</strong>
                <p style="margin:4px 0 0 0;color:#555;font-size:14px;line-height:1.6;">Escríbele a Laura, Enzo o Carlos directamente si quieres probar algo específico. Están disponibles 24/7.</p>
              </div>
            </div>
          </div>

          <p style="font-size:14px;color:#666;line-height:1.6;">¿Dudas? Responde a este email y te contestamos rápido. También puedes hablar con Paco directamente desde el chat. 👇</p>

          <div style="text-align:center;margin:32px 0 0 0;">
            <a href="https://mycompi.onrender.com/#/chat" style="display:inline-block;background:#FFD154;color:#2D3261;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;font-size:15px;">Ir al chat →</a>
          </div>
        </div>
        <div style="background:#f8f8f8;padding:20px 40px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">MyCompi — Tu equipo de Compis profesionales · <a href="https://mycompi.onrender.com" style="color:#667eea;text-decoration:none;">mycompi.onrender.com</a></p>
        </div>
      </div>
    </body>
    </html>`,
  },

  dia3: {
    subject: '¿Cómo van los primeros días? Aquí van algunos tips 📊',
    getHtml: (nombre) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¿Cómo van los primeros días?</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Poppins',Segoe UI,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:#2D3261;padding:32px 40px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;background:#FFD154;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">📊</div>
            <div>
              <div style="color:#FFD154;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Día 3</div>
              <div style="color:#ffffff;font-size:22px;font-weight:700;">¿Cómo van los primeros días?</div>
            </div>
          </div>
        </div>
        <div style="padding:36px 40px;">
          <p style="font-size:17px;color:#333;margin-top:0;">Hola ${nombre},</p>
          <p style="font-size:16px;color:#444;line-height:1.7;">Llevas 3 días con tu equipo de Compis. Aquí van algunas cosas que puedes estar pasando por alto:</p>

          <div style="margin:24px 0;padding:20px;background:#FCF9F1;border-radius:12px;border:1px solid #D1E0F3;">
            <p style="font-size:14px;font-weight:700;color:#2D3261;margin:0 0 12px 0;">💡 Cosas que quizás no sabías:</p>
            <ul style="margin:0;padding-left:20px;color:#444;font-size:14px;line-height:1.8;">
              <li><strong>Laura</strong> puede redactar respuestas para tus clientes, emails de soporte, y FAQ.</li>
              <li><strong>Enzo</strong> puede hacer un análisis de tu competencia y propuesta de contenido para redes.</li>
              <li><strong>Carlos</strong> puede qualificar leads que tengas en un spreadsheet.</li>
              <li><strong>Diana</strong> puede analizar datos que le envíes y devolvértelos en un informe.</li>
              <li><strong>Marcos</strong> puede actualizar tu web o landing page.</li>
            </ul>
          </div>

          <div style="margin:24px 0;padding:20px;background:#fff;border-radius:12px;border:2px solid #FFD154;">
            <p style="font-size:14px;font-weight:700;color:#2D3261;margin:0 0 8px 0;">📖 Caso real: Agencias de viajes</p>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">Una agencia de 5 personas automatizó el 80% de sus respuestas a preguntas frecuentes con Laura. Tardaron 2 días en configurarlo y ahora responden 3x más rápido.</p>
          </div>

          <p style="font-size:14px;color:#666;line-height:1.6;">¿Quieres probar algo específico? Escríbele a Paco o directamente a cualquiera de los Compis. 👇</p>

          <div style="text-align:center;margin:32px 0 0 0;">
            <a href="https://mycompi.onrender.com/#/chat" style="display:inline-block;background:#FFD154;color:#2D3261;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;font-size:15px;">Hablar con el equipo →</a>
          </div>
        </div>
        <div style="background:#f8f8f8;padding:20px 40px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">MyCompi — Tu equipo de Compis profesionales · <a href="https://mycompi.onrender.com" style="color:#667eea;text-decoration:none;">mycompi.onrender.com</a></p>
        </div>
      </div>
    </body>
    </html>`,
  },

  dia7: {
    subject: '7 días con MyCompi — tu resumen semanal 📋',
    getHtml: (nombre, stats) => `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>7 días con MyCompi</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Poppins',Segoe UI,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <div style="background:#2D3261;padding:32px 40px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;background:#FFD154;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">📋</div>
            <div>
              <div style="color:#FFD154;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Día 7</div>
              <div style="color:#ffffff;font-size:22px;font-weight:700;">Tu primera semana con MyCompi</div>
            </div>
          </div>
        </div>
        <div style="padding:36px 40px;">
          <p style="font-size:17px;color:#333;margin-top:0;">Hola ${nombre},</p>
          <p style="font-size:16px;color:#444;line-height:1.7;">¡Ya llevas una semana! Aquí va un resumen de lo que ha pasado y un <strong>próximo paso concreto</strong> para la segunda semana:</p>

          <div style="margin:24px 0;padding:20px;background:#FCF9F1;border-radius:12px;border:1px solid #D1E0F3;">
            <p style="font-size:14px;font-weight:700;color:#2D3261;margin:0 0 12px 0;">🎯 Tu próximo paso recomendado:</p>
            <p style="margin:0;color:#444;font-size:14px;line-height:1.6;">Piensa en <strong>1 tarea repetitiva</strong> que haces cada semana y que podría automatizarse. Puede ser: responder emails, preparar informes, publicar en redes, o captar leads. Escríbenos y la abordamos esta semana.</p>
          </div>

          <div style="margin:24px 0;padding:20px;background:#fff;border-radius:12px;border:2px solid #FFD154;">
            <p style="font-size:14px;font-weight:700;color:#2D3261;margin:0 0 12px 0;">💬 ¿Necesitas algo?</p>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">Si no has hablado con Paco todavía, este es un buen momento. Cuéntale qué va bien, qué no, y qué te gustaría conseguir. El equipo se adapta a ti, no al revés.</p>
          </div>

          <p style="font-size:14px;color:#666;line-height:1.6;">¿Questions? Reply to this email or chat with us anytime. We're here to help. 🙂</p>

          <div style="text-align:center;margin:32px 0 0 0;">
            <a href="https://mycompi.onrender.com/#/chat" style="display:inline-block;background:#FFD154;color:#2D3261;font-weight:700;padding:14px 32px;border-radius:9999px;text-decoration:none;font-size:15px;">Ir al chat →</a>
          </div>
        </div>
        <div style="background:#f8f8f8;padding:20px 40px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">MyCompi — Tu equipo de Compis profesionales · <a href="https://mycompi.onrender.com" style="color:#667eea;text-decoration:none;">mycompi.onrender.com</a></p>
        </div>
      </div>
    </body>
    </html>`,
  },
};

// ─────────────────────────────────────────
// ENROLL: crear entrada de secuencia para cliente
// Se llama desde auth.js cuando se activa la cuenta
// ─────────────────────────────────────────
async function enrollClienteOnboarding(clienteId) {
  try {
    // Buscar si ya existe
    const existing = await prisma.onboardingSequence.findUnique({
      where: { clienteId }
    });
    if (existing) return existing;

    const seq = await prisma.onboardingSequence.create({
      data: { clienteId }
    });
    console.log(`[ONBOARDING SEQ] Cliente ${clienteId} inscrito en secuencia de onboarding`);
    return seq;
  } catch (err) {
    // Tabla puede no existir aún en prod si no se ha migrado
    console.log(`[ONBOARDING SEQ] Tabla no existe o error: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────
// PROCESAR SECUENCIA — cron cada hora
// ─────────────────────────────────────────
async function procesarSecuenciaOnboarding() {
  if (!process.env.RESEND_API_KEY) {
    console.log('[ONBOARDING SEQ] RESEND_API_KEY no configurado, saltando...');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = new Date();

  let secuencias;
  try {
    secuencias = await prisma.onboardingSequence.findMany({
      where: { activo: true },
      include: {
        cliente: {
          include: {
            usuarios: { where: { rol: 'OWNER' }, take: 1 }
          }
        }
      }
    });
  } catch (err) {
    console.log(`[ONBOARDING SEQ] Tabla no existe o error: ${err.message}`);
    return;
  }

  for (const seq of secuencias) {
    const email = seq.cliente?.usuarios[0]?.email;
    const nombre = seq.cliente?.nombre || email?.split('@')[0] || 'tu';
    if (!email) continue;

    const diasActivo = Math.floor((now - seq.startedAt) / (1000 * 60 * 60 * 24));

    try {
      // Día 1: email si dias >= 1 y no enviado
      if (diasActivo >= 1 && !seq.dia1Sent) {
        await resend.emails.send({
          from: 'MyCompi <noreply@mycompi.com>',
          to: email,
          subject: TEMPLATES.dia1.subject,
          html: TEMPLATES.dia1.getHtml(nombre),
        });
        await prisma.onboardingSequence.update({
          where: { id: seq.id },
          data: { dia1Sent: true, lastEmailAt: now }
        });
        console.log(`[ONBOARDING SEQ] Día 1 enviado a ${email}`);
      }

      // Día 3: email si dias >= 3 y no enviado
      if (diasActivo >= 3 && !seq.dia3Sent) {
        await resend.emails.send({
          from: 'MyCompi <noreply@mycompi.com>',
          to: email,
          subject: TEMPLATES.dia3.subject,
          html: TEMPLATES.dia3.getHtml(nombre),
        });
        await prisma.onboardingSequence.update({
          where: { id: seq.id },
          data: { dia3Sent: true, lastEmailAt: now }
        });
        console.log(`[ONBOARDING SEQ] Día 3 enviado a ${email}`);
      }

      // Día 7: email si dias >= 7 y no enviado
      if (diasActivo >= 7 && !seq.dia7Sent) {
        await resend.emails.send({
          from: 'MyCompi <noreply@mycompi.com>',
          to: email,
          subject: TEMPLATES.dia7.subject,
          html: TEMPLATES.dia7.getHtml(nombre, {}),
        });
        await prisma.onboardingSequence.update({
          where: { id: seq.id },
          data: { dia7Sent: true, lastEmailAt: now }
        });
        console.log(`[ONBOARDING SEQ] Día 7 enviado a ${email}`);
      }

      // Desactivar si secuencia completa
      if (seq.dia1Sent && seq.dia3Sent && seq.dia7Sent) {
        await prisma.onboardingSequence.update({
          where: { id: seq.id },
          data: { activo: false }
        });
        console.log(`[ONBOARDING SEQ] Secuencia completada para ${email}`);
      }
    } catch (err) {
      console.error(`[ONBOARDING SEQ] Error enviando email a ${email}:`, err.message);
    }
  }
}

// ─────────────────────────────────────────
// API: GET /api/onboarding-sequence/status
// ─────────────────────────────────────────
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const seq = await prisma.onboardingSequence.findUnique({
      where: { clienteId: req.clienteId }
    });
    if (!seq) return res.json({ enrolled: false });
    res.json({
      enrolled: true,
      startedAt: seq.startedAt,
      emails: {
        dia1: seq.dia1Sent,
        dia3: seq.dia3Sent,
        dia7: seq.dia7Sent,
      },
      activo: seq.activo,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// API: POST /api/onboarding-sequence/enroll (manual, admin)
// ─────────────────────────────────────────
router.post('/enroll', authMiddleware, async (req, res) => {
  try {
    const { clienteId } = req.body;
    const targetClientId = clienteId || req.clienteId;
    const seq = await enrollClienteOnboarding(targetClientId);
    res.json({ ok: true, seq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, enrollClienteOnboarding, procesarSecuenciaOnboarding };
