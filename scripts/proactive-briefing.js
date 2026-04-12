/**
 * PROACTIVE BRIEFING — Sistema de coordinación diaria
 * 
 * Ejecuta cada día laborable a las 7:30 UTC (8:30h España).
 * Lee datos reales de la BD para generar standups informados.
 * Escribe en /root/mycompi/shared/coordination/standups.md
 */

const { Client } = require('pg');
const fs = require('fs');

const DB = {
  host: '172.24.0.2',
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
};

const SHARED_DIR = '/root/mycompi/shared/coordination';
const STANDUP_FILE = SHARED_DIR + '/standups.md';
const LOG_FILE = '/root/mycompi/logs/briefing.log';

const hoy = new Date().toISOString().slice(0, 10);
const dayNum = new Date().getDay();
const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dayNum];

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

async function getRealStats(pg) {
  const stats = {
    clientes: 0,
    jobsPendientes: 0,
    jobsCompletados: 0,
    agentesActivos: 0,
    agentesTotal: 0,
    healthScore: 0,
    revenue: 0,
    qaPendientes: 0,
    alerts: [],
  };
  
  try {
    const [clientes, trabajos, agentes] = await Promise.all([
      pg.query('SELECT count(*) as c FROM "Cliente" WHERE activo = true'),
      pg.query('SELECT estado, count(*) as c FROM "Trabajo" group by estado'),
      pg.query('SELECT count(*) as c FROM "Agente"'),
    ]);
    
    stats.clientes = parseInt(clientes.rows[0]?.c || 0);
    stats.agentesTotal = parseInt(agentes.rows[0]?.c || 0);
    
    let total = 0, completed = 0;
    trabajos.rows.forEach(r => {
      total += parseInt(r.c);
      if (r.estado === 'COMPLETED') completed += parseInt(r.c);
      if (r.estado !== 'COMPLETED' && r.estado !== 'CANCELLED') stats.jobsPendientes += parseInt(r.c);
    });
    stats.jobsCompletados = completed;
    
    // Health score
    stats.healthScore = Math.min(100, Math.round((stats.clientes * 15) + (completed * 2) + (stats.agentesTotal * 3)));
    
    // Revenue estimado
    const planes = await pg.query('SELECT plan from "Cliente" WHERE activo = true');
    const precios = { BASICO: 49, ESTANDAR: 99, PREMIUM: 199, COMPLETO: 49 };
    stats.revenue = planes.rows.reduce((sum, c) => sum + (precios[c.plan] || 49), 0);
    
    // QA pendientes
    const qa = await pg.query('SELECT count(*) as c FROM "Trabajo" WHERE "requiereAprobacion" = true AND "metadata" is null');
    stats.qaPendientes = parseInt(qa.rows[0]?.c || 0);
    
  } catch(e) {
    log('Error leyendo stats: ' + e.message);
  }
  
  return stats;
}

async function main() {
  log('══════════════════════════════════');
  log(`BRIEFING — ${hoy} (${dayName})`);
  
  // Crear dir si no existe
  if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR, { recursive: true });
  }
  
  const pg = new Client(DB);
  await pg.connect();
  
  const stats = await getRealStats(pg);
  log(`Stats: ${stats.clientes} clientes, ${stats.jobsCompletados}/${stats.jobsPendientes + stats.jobsCompletados} jobs completados, ${stats.agentesTotal} agentes, Score ${stats.healthScore}/100`);
  
  // ¿Ya existe standup de hoy?
  let existing = '';
  if (fs.existsSync(STANDUP_FILE)) {
    existing = fs.readFileSync(STANDUP_FILE, 'utf8');
  }
  
  if (existing.includes(`## ${hoy}`)) {
    log('Standup de hoy ya existe — skipping');
    await pg.end();
    return;
  }
  
  // Generar standup por agente
  const AGENTS = [
    { id: 'paco',   nombre: 'Paco',    emoji: '🎯' },
    { id: 'laura',  nombre: 'Laura',   emoji: '📊' },
    { id: 'enzo',   nombre: 'Enzo',    emoji: '📣' },
    { id: 'carlos', nombre: 'Carlos',  emoji: '💰' },
    { id: 'elena',  nombre: 'Elena',   emoji: '⚙️' },
    { id: 'diana',  nombre: 'Diana',   emoji: '📈' },
    { id: 'marcos', nombre: 'Marcos',  emoji: '🔧' },
    { id: 'valeria',nombre: 'Valeria', emoji: '✅' },
  ];
  
  const STANDUPS = {
    paco: () => ({
      hoy: `Coordinar ${stats.agentesTotal} agente(s). Score salud: ${stats.healthScore}/100. Revenue: €${stats.revenue}/mes.`,
      bloqueado: stats.clientes === 0 ? 'Sin clientes — esperar onboarding primer cliente' : 'ninguno',
      siguiente: 'Supervisar pipeline, preparar briefing para Alberto.',
    }),
    laura: () => ({
      hoy: `Health check ${stats.clientes} cliente(s). ${stats.jobsPendientes} trabajos pendientes. ${stats.qaPendientes} approvals pendientes.`,
      bloqueado: 'ninguno',
      siguiente: 'Seguimiento a clientes fríos, outreach proactivo.',
    }),
    enzo: () => ({
      hoy: `Content calendar semanal. 3 ideas para LinkedIn/post/email. Competitive monitoring.`,
      bloqueado: stats.clientes === 0 ? 'Sin cliente para crear contenido' : 'ninguno',
      siguiente: 'Publicación scheduled, engagement analysis.',
    }),
    carlos: () => ({
      hoy: `Lead intelligence. Upsell candidates detection. Pricing review.`,
      bloqueado: 'ninguno',
      siguiente: 'Outreach a candidatos upsell, follow-up stalled.',
    }),
    elena: () => ({
      hoy: `Workflow efficiency audit. Heartbeat agents check. Token budget analysis.`,
      bloqueado: 'ninguno',
      siguiente: 'Automatizaciones rápidas, optimizar flujos lentos.',
    }),
    diana: () => ({
      hoy: `Business Health Score: ${stats.healthScore}/100. Revenue tracking: €${stats.revenue}/mes. Cost analysis.`,
      bloqueado: 'ninguno',
      siguiente: stats.clientes === 0 ? 'Esperando datos reales del primer cliente' : 'Forecast actualizado, alertas budget.',
    }),
    marcos: () => ({
      hoy: `Uptime check. Jobs queue: ${stats.jobsPendientes} pendientes. API errors check.`,
      bloqueado: 'ninguno',
      siguiente: 'Resolver cuellos de botella, tech debt si lo hay.',
    }),
    valeria: () => ({
      hoy: `QA Gate: ${stats.qaPendientes} deliverable(s) por revisar antes de entrega.`,
      bloqueado: stats.qaPendientes === 0 ? 'Sin deliverables pendientes de QA' : 'ninguno',
      siguiente: 'Auditar calidad output semanal, reportar a Paco.',
    }),
  };
  
  let section = `\n## ${hoy} | ${dayName.toUpperCase()}\n`;
  
  for (const agent of AGENTS) {
    const standup = STANDUPS[agent.id]();
    section += `\n### ${agent.emoji} ${agent.nombre}\n`;
    section += `- **HOY:** ${standup.hoy}\n`;
    section += `- **BLOQUEADO:** ${standup.bloqueado}\n`;
    section += `- **SIGUIENTE:** ${standup.siguiente}\n`;
  }
  
  section += '\n---\n';
  
  // Prepend al archivo, mantener solo últimos 30 días
  let newLog = section + existing;
  const lines = newLog.split('\n');
  const filtered = [];
  let skip = false;
  for (const line of lines) {
    const dateMatch = line.match(/^## (\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const diff = (new Date() - new Date(dateMatch[1])) / (1000 * 60 * 60 * 24);
      skip = diff > 30;
    }
    if (!skip) filtered.push(line);
  }
  
  fs.writeFileSync(STANDUP_FILE, filtered.join('\n'));
  log(`Standup ${hoy} generado para ${AGENTS.length} agentes. Score: ${stats.healthScore}/100`);
  await pg.end();
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });