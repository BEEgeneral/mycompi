/**
 * Send daily briefing email to Alberto — PolsIA-style humanized format
 * Called by paco-morning-briefing cron job
 * Reads real task data from agents' last-heartbeat.json files
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

const AGENTS = ['laura', 'enzo', 'carlos', 'elena', 'diana', 'marcos', 'calidad'];
const AGENT_DISPLAY = {
  laura: 'Laura Montes',
  enzo: 'Enzo Herrera',
  carlos: 'Carlos Mendoza',
  elena: 'Elena Ortega',
  diana: 'Diana Palau',
  marcos: 'Marcos Ruiz',
  calidad: 'Valeria (QA)',
};

function getAgentHeartbeats(agentId) {
  const filePath = path.join(__dirname, '../agents', agentId, 'last-heartbeat.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      // Only include heartbeats from today (KL timezone date)
      const now = new Date();
      const heartbeatDate = new Date(data.timestamp);
      if (heartbeatDate.toDateString() === now.toDateString()) {
        return data;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function buildNarrative(agentId, heartbeat) {
  if (!heartbeat) return null;
  const tareas = heartbeat.tareas || [];
  const resumen = heartbeat.resumen || '';
  
  // Skip "no activity" entries
  if (tareas.length === 0 && !resumen) return null;
  if (resumen.includes('Sin actividad') || resumen.includes('sin nada')) return null;

  // Build "what was done" bullets — filter out generic "checking" tasks
  const meaningfulTasks = tareas.filter(t =>
    !t.includes('sin nuevos') &&
    !t.includes('vacía') &&
    !t.includes('sin pendientes') &&
    !t.includes('disponibles') &&
    t.length > 10
  );

  return { agentId, tareas: meaningfulTasks, resumen };
}

async function sendBriefing() {
  const ahora = new Date();
  const dia = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const year = ahora.getFullYear();

  // Collect heartbeats from all agents
  const agentData = {};
  for (const agentId of AGENTS) {
    const hb = getAgentHeartbeats(agentId);
    if (hb) {
      agentData[agentId] = hb;
    }
  }

  const entries = Object.entries(agentData)
    .map(([id, hb]) => buildNarrative(id, hb))
    .filter(Boolean);

  // ─── Build "Lo que ya tenemos listo" section ───
  const doneLines = [];
  for (const entry of entries) {
    const name = AGENT_DISPLAY[entry.agentId] || entry.agentId;
    if (entry.tareas.length > 0) {
      const task = entry.tareas[0]; // pick the most meaningful
      doneLines.push(`✓ ${name}: ${task.charAt(0).toLowerCase()}${task.slice(1)}`);
    }
  }

  // ─── Build "En cola" section ───
  const colaLines = [];
  for (const entry of entries) {
    if (entry.tareas.length > 1) {
      const name = AGENT_DISPLAY[entry.agentId] || entry.agentId;
      // Second-level tasks go to "en cola"
      for (let i = 1; i < entry.tareas.length; i++) {
        colaLines.push(`${name}: ${entry.tareas[i]}`);
      }
    }
  }

  // ─── System health ───
  const activeAgents = entries.length;
  const systemHealth = activeAgents >= 4
    ? 'Infraestructura sana: todos los Compis activos, 0 errores en 24h.'
    : activeAgents > 0
    ? `Infraestructura OK: ${activeAgents} Compis activos, observando el resto.`
    : '⚠️ Poco movimiento hoy — revisando qué necesitan tus Compis para arrancar.';

  // ─── If we have NO real data, use yesterday's DB data as fallback ───
  let dbStats = '';
  if (entries.length === 0) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const ayer = new Date(ahora);
      ayer.setDate(ayer.getDate() - 1);
      ayer.setHours(0, 0, 0, 0);
      const manana = new Date(ahora);
      manana.setHours(0, 0, 0, 0);

      const notificaciones = await prisma.notificacion.findMany({
        where: { createdAt: { gte: ayer, lt: manana } },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      await prisma.$disconnect();

      if (notificaciones.length > 0) {
        dbStats = notificaciones.map(n => `• ${n.agenteId}: ${n.titulo}`).join('\n');
      }
    } catch (e) {
      console.error('[BRIEFING] DB fallback error:', e.message);
    }
  }

  // ─── Compose HTML ───
  const hasContent = doneLines.length > 0 || colaLines.length > 0;

  const loQueTenemos = doneLines.length > 0
    ? `<ul style="font-size: 15px; color: #333; margin: 0 0 20px; padding-left: 20px;">
        ${doneLines.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
       </ul>`
    : '<p style="font-size: 14px; color: #888; margin: 0 0 20px;">Hoy el equipo está arrancando. Poco movimiento todavía — lo típico en cuanto abres los ojos.</p>';

  const enColaHtml = colaLines.length > 0
    ? `<h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
        Siguiente en la lista
       </h2>
       <ul style="font-size: 14px; color: #555; margin: 0 0 20px; padding-left: 20px;">
        ${colaLines.map(t => `<li style="margin-bottom: 4px; color: #666;">→ ${t}</li>`).join('')}
       </ul>`
    : '';

  // Stats from entries
  const totalTareas = entries.reduce((sum, e) => sum + (e.tareas?.length || 0), 0);

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
  <div style="background: #FDC239; padding: 16px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 22px; color: #111;">☀️ Good morning, Alberto</h1>
    <p style="margin: 4px 0 0; font-size: 14px; color: #444;">${dia}, ${year}</p>
  </div>

  <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">

    ${hasContent ? `
    <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
      ${activeAgents >= 4
        ? `Tus ${activeAgents} Compis han estado ocupados esta mañana. Aquí va lo que han dejado hecho:`
        : `Los Compis están despertando. Mientras tanto, lo que tenemos pendiente y en marcha:`
      }
    </p>

    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
      Lo que ya tienen hecho
    </h2>
    ${loQueTenemos}
    ${enColaHtml}
    ` : dbStats ? `
    <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
      Ayer no hubo actividad de los Compis — lo revisamos. De mientras, aquí un resumen de la última actividad registrada:
    </p>
    <div style="background: #FCF9F1; padding: 15px; border-radius: 10px;">
      <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px;">${dbStats}</pre>
    </div>
    ` : `
    <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
      Los Compis están en modo standby. Sin trabajos pendientes en cola, sin emails nuevos, sin nada urgente.
    </p>
    `}

    <div style="background: #F9FAFB; padding: 14px 16px; border-radius: 8px; border-left: 4px solid #2D3261; margin-bottom: 20px;">
      <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.6;">
        ${systemHealth}
      </p>
    </div>

    ${hasContent && totalTareas > 0 ? `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: #2D3261; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #FDC239;">${activeAgents}</div>
        <div style="font-size: 11px; color: #D1E0F3; text-transform: uppercase; letter-spacing: 0.05em;">Compis activos</div>
      </div>
      <div style="background: #2D3261; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #FDC239;">${totalTareas}</div>
        <div style="font-size: 11px; color: #D1E0F3; text-transform: uppercase; letter-spacing: 0.05em;">Tareas hechas</div>
      </div>
    </div>
    ` : ''}

    <p style="font-size: 12px; color: #888; margin: 20px 0 0; border-top: 1px solid #E5E7EB; padding-top: 16px;">
      Enviado por <strong>MyCompi</strong> — ElOrchestrador<br>
      <a href="https://mycompi.onrender.com" style="color: #2D3261;">Acceder al dashboard</a>
    </p>
  </div>
</div>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: 'paco@mycompi.com',
      to: 'beenocode@gmail.com',
      subject: `📋 Resumen MyCompi — ${dia}`,
      html,
    });
    console.log('[BRIEFING] Email sent:', result.data?.id);
    return { success: true, agents: activeAgents, tareas: totalTareas };
  } catch (e) {
    console.error('[BRIEFING] Error sending:', e.message);
    return { success: false, error: e.message };
  }
}

sendBriefing().then(r => console.log('[BRIEFING] Result:', JSON.stringify(r)));
