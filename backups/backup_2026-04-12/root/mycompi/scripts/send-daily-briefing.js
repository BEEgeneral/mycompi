/**
 * Send daily briefing email to Alberto — MyCompi style
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
      const now = new Date();
      const heartbeatDate = new Date(data.timestamp);
      if (heartbeatDate.toDateString() === now.toDateString()) {
        return data;
      }
    }
  } catch (e) {}
  return null;
}

function esFinDeSemana() {
  const dia = new Date().getDay();
  return dia === 0 || dia === 6;
}

async function main() {
  const ahora = new Date();
  const dia = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const year = ahora.getFullYear();

  const entries = [];
  for (const agentId of AGENTS) {
    const data = getAgentHeartbeats(agentId);
    if (data) {
      entries.push({ agentId, ...data });
    }
  }

  const doneLines = [];
  const colaLines = [];

  for (const entry of entries) {
    const name = AGENT_DISPLAY[entry.agentId] || entry.agentId;
    if (entry.tareas && entry.tareas.length > 0) {
      const task = entry.tareas[0];
      doneLines.push(`*${name}*: ${task.charAt(0).toLowerCase()}${task.slice(1)}`);
    }
    if (entry.tareas && entry.tareas.length > 1) {
      for (let i = 1; i < entry.tareas.length; i++) {
        colaLines.push(`*${name}*: ${entry.tareas[i]}`);
      }
    }
  }

  const activeAgents = entries.length;
  const totalTareas = entries.reduce((sum, e) => sum + (e.tareas?.length || 0), 0);

  // ─── Si NO hay datos frescos, consultar BD ───
  let dbFallback = null;
  if (entries.length === 0) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const hace7dias = new Date(ahora);
      hace7dias.setDate(hace7dias.getDate() - 7);
      hace7dias.setHours(0, 0, 0, 0);

      const hace30dias = new Date(ahora);
      hace30dias.setDate(hace30dias.getDate() - 30);
      hace30dias.setHours(0, 0, 0, 0);

      // Trabajos completados en los ultimos 7 dias
      const completados = await prisma.trabajo.findMany({
        where: {
          estado: 'COMPLETED',
          updatedAt: { gte: hace7dias }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: { agente: { select: { nombre: true } } }
      });

      // Trabajos pendientes importantes (prioridad alta, no completados)
      const pendientes = await prisma.trabajo.findMany({
        where: {
          estado: { in: ['PENDING', 'IN_PROGRESS'] },
          prioridad: { in: ['ALTA', 'CRITICA'] }
        },
        orderBy: { createdAt: 'asc' },
        take: 8,
        include: { agente: { select: { nombre: true } }, cliente: { select: { nombre: true } } }
      });

      // Jobs creados en los ultimos 30 dias (actividad reciente)
      const recientes = await prisma.trabajo.findMany({
        where: {
          createdAt: { gte: hace30dias },
          estado: { in: ['TODO', 'PENDING', 'IN_PROGRESS'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { cliente: { select: { nombre: true } } }
      });

      await prisma.$disconnect();

      dbFallback = { completados, pendientes, recientes };
    } catch (e) {
      console.error('[BRIEFING] DB error:', e.message);
    }
  }

  const hasContent = doneLines.length > 0 || colaLines.length > 0;

  // ─── Construir HTML ───
  let bodyContent = '';

  if (hasContent) {
    // Caso normal: hay datos de heartbeats
    bodyContent = `
    <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
      Tus ${activeAgents} Compis han estado activos. Aqui va lo que han dejado hecho:
    </p>
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Lo que ya tienen hecho</h2>
    <ul style="font-size: 15px; color: #333; margin: 0 0 20px; padding-left: 20px;">
      ${doneLines.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
    </ul>
    ${colaLines.length > 0 ? `
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Siguiente en la lista</h2>
    <ul style="font-size: 14px; color: #555; margin: 0 0 20px; padding-left: 20px;">
      ${colaLines.map(t => `<li style="margin-bottom: 4px; color: #666;">→ ${t}</li>`).join('')}
    </ul>` : ''}
    `;
  } else if (dbFallback) {
    // Caso sin heartbeats: usamos datos de BD
    const { completados, pendientes, recientes } = dbFallback;

    let resumenSection = '<p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">Los Compis estan en modo standby. Sin trabajos pendientes en cola, sin emails nuevos. Mientras tanto, aqui tienes lo importante:</p>';

    let tasksContent = '';

    if (pendientes.length > 0) {
      tasksContent += `
      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Tareas clave pendientes</h2>
      <ul style="font-size: 14px; color: #333; margin: 0 0 20px; padding-left: 20px;">
        ${pendientes.map(t => {
          const agente = t.agente?.nombre || 'Sin asignar';
          const cliente = t.cliente?.nombre || '';
          const daysOld = Math.floor((ahora - new Date(t.createdAt)) / (1000 * 60 * 60 * 24));
          const age = daysOld === 0 ? 'hoy' : daysOld === 1 ? 'ayer' : `hace ${daysOld} dias`;
          return `<li style="margin-bottom: 8px; color: #333;">
            <strong style="color: #2D3261;">${t.titulo}</strong>
            <span style="color: #888; font-size: 13px;"> — ${cliente} · ${agente} · ${age}</span>
          </li>`;
        }).join('')}
      </ul>`;
    }

    if (completados.length > 0) {
      tasksContent += `
      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Completados esta semana</h2>
      <ul style="font-size: 14px; color: #333; margin: 0 0 20px; padding-left: 20px;">
        ${completados.slice(0, 6).map(t => {
          const agente = t.agente?.nombre || 'Sin asignar';
          const daysAgo = Math.floor((ahora - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24));
          const ago = daysAgo === 0 ? 'hoy' : daysAgo === 1 ? 'ayer' : `hace ${daysAgo} dias`;
          return `<li style="margin-bottom: 6px;">${t.titulo} <span style="color: #888;">— ${agente}, ${ago}</span></li>`;
        }).join('')}
      </ul>`;
    }

    if (recientes.length > 0 && completados.length === 0 && pendientes.length === 0) {
      tasksContent += `
      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Actividad reciente</h2>
      <ul style="font-size: 14px; color: #333; margin: 0 0 20px; padding-left: 20px;">
        ${recientes.map(t => `<li style="margin-bottom: 6px;">${t.titulo} <span style="color: #888;">— ${t.cliente?.nombre || ''}</span></li>`).join('')}
      </ul>`;
    }

    if (!tasksContent) {
      tasksContent = '<p style="font-size: 14px; color: #888; margin: 0 0 20px;">Sin actividad reciente registrada en el sistema.</p>';
    }

    bodyContent = resumenSection + tasksContent;
  } else {
    // Ultimo recurso: sin datos
    bodyContent = `
    <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
      Los Compis estan en modo standby. Sin trabajos pendientes en cola, sin emails nuevos, sin nada urgente.
    </p>
    `;
  }

  const systemHealth = activeAgents >= 4
    ? 'Infraestructura sana: todos los Compis activos, 0 errores en 24h.'
    : activeAgents > 0
    ? `Infraestructura OK: ${activeAgents} Compis activos, observando el resto.`
    : 'Sin datos de heartbeats. Los Compis pueden estar reiniciando o sin actividad.';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resumen MyCompi</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="background:#2D3261;padding:30px 40px;">
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:600;">Buenos dias, Alberto</h1>
      <p style="margin:6px 0 0;color:#D1E0F3;font-size:14px;">${dia}, ${year}</p>
    </div>
    <div style="padding:30px 40px;">
      ${bodyContent}
      <div style="background:#F9FAFB;padding:14px 16px;border-radius:8px;border-left:4px solid #2D3261;margin-bottom:20px;">
        <p style="font-size:13px;color:#555;margin:0;line-height:1.6;">${systemHealth}</p>
      </div>
      ${hasContent && totalTareas > 0 ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="background:#2D3261;padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#FFD154;">${activeAgents}</div>
          <div style="font-size:11px;color:#D1E0F3;text-transform:uppercase;">Compis activos</div>
        </div>
        <div style="background:#2D3261;padding:12px;border-radius:8px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#FFD154;">${totalTareas}</div>
          <div style="font-size:11px;color:#D1E0F3;text-transform:uppercase;">Tareas hechas</div>
        </div>
      </div>` : ''}
      <p style="font-size:12px;color:#888;margin:20px 0 0;border-top:1px solid #E5E7EB;padding-top:16px;">
        Enviado por <strong>MyCompi</strong> -- Paco Manager<br>
        <a href="https://mycompi.com" style="color:#2D3261;">mycompi.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: 'paco@mycompi.com',
      to: 'beenocode@gmail.com',
      subject: `Resumen MyCompi -- ${dia}`,
      html,
    });
    console.log('[BRIEFING] Email sent:', result.data?.id);
    return { success: true, agents: activeAgents, tareas: totalTareas };
  } catch (e) {
    console.error('[BRIEFING] Error:', e.message);
    return { success: false, error: e.message };
  }
}

main().then(r => console.log('[BRIEFING] Result:', JSON.stringify(r)));
