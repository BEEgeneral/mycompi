/**
 * Send daily briefing email to Alberto
 * Called by paco-morning-briefing cron job
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBriefing() {
  const ahora = new Date();
  const dia = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  // Get yesterday's notifications from DB
  let notificaciones = [];
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    ayer.setHours(0, 0, 0, 0);
    const manana = new Date(ahora);
    manana.setHours(0, 0, 0, 0);
    
    notificaciones = await prisma.notificacion.findMany({
      where: { createdAt: { gte: ayer, lt: manana } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    await prisma.$disconnect();
  } catch (e) {
    console.error('[BRIEFING] Error DB:', e.message);
  }

  const stats = notificaciones.length > 0
    ? notificaciones.map(n => `• ${n.agenteId}: ${n.titulo}`).join('\n')
    : '• Sin actividad registrada';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2D3261;">☀️ Good morning, Alberto</h2>
      <p style="color: #555;">${dia}</p>
      <hr style="border: 1px solid #D1E0F3; margin: 20px 0;">
      <h3 style="color: #2D3261;">📊 Actividad de tus Compis ayer</h3>
      <div style="background: #FCF9F1; padding: 15px; border-radius: 10px;">
        <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${stats}</pre>
      </div>
      <hr style="border: 1px solid #D1E0F3; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">
        MyCompi — Tu equipo de Compis agénticos trabajando 24/7<br>
        <a href="https://mycompi.onrender.com">Acceder al dashboard</a>
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'paco@mycompi.com',
      to: 'beenocode@gmail.com',
      subject: `📋 Resumen diario MyCompi — ${dia}`,
      html,
    });
    console.log('[BRIEFING] Email sent:', result.data?.id);
  } catch (e) {
    console.error('[BRIEFING] Error sending:', e.message);
  }
}

sendBriefing();
