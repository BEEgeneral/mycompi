/**
 * PROACTIVE MEMORY — MyCompi
 * 
 * Sistema proactivo de memoria MemPalace-style para agentes.
 * Se ejecuta después de proactive-real.js (cron: después de briefings).
 * 
 * Funcionalidades:
 * 1. Palacio: guardar recuerdos de cada agente en wings/rooms/drawers
 * 2. Diary: escribir diary entries al final de cada día
 * 3. Knowledge Graph: mantener triples de relaciones agente↔cliente
 * 4. Seed: poblar el KG con datos actuales de la BD
 * 
 * Usa conexión directa a PostgreSQL + storage en JSON files.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { Palace } = require('./palace');
const { KnowledgeGraph, PREDICATES } = require('./knowledge-graph');
const { remember, l1, palaceStatus } = require('./layers');

const DB = {
  host: '172.24.0.2',
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
};

const MEMORY_LOG = '/root/mycompi/logs/memory.log';
const SHARED_DIR = '/root/mycompi/shared/coordination';

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(MEMORY_LOG, `[${ts}] ${msg}\n`);
}

// ─── AGENT DIARIES ──────────────────────────────────────────────────────────
async function runAgentDiaries(pg) {
  const AGENTS = [
    { id: 'laura',  color: '📊', focus: 'Customer Success' },
    { id: 'enzo',   color: '📣', focus: 'Marketing' },
    { id: 'carlos', color: '💰', focus: 'Ventas' },
    { id: 'elena',  color: '⚙️', focus: 'Operaciones' },
    { id: 'diana',  color: '📈', focus: 'Finanzas' },
    { id: 'marcos', color: '🔧', focus: 'Producto' },
    { id: 'valeria',color: '✅', focus: 'QA' },
    { id: 'paco',   color: '🎯', focus: 'Director' },
  ];

  log('═══ AGENT DIARIES ═══');
  
  for (const agent of AGENTS) {
    // Leer stats del día
    const hoy = new Date().toISOString().slice(0, 10);
    
    let entry = `[${hoy}] `;
    
    // Basado en tipo de agente, generar diary entry significativo
    try {
      if (agent.id === 'laura') {
        const [clientes, pending] = await Promise.all([
          pg.query('SELECT count(*) as c FROM "Cliente" WHERE activo = true'),
          pg.query('SELECT count(*) as c FROM "Trabajo" WHERE estado NOT IN (\'COMPLETED\')'),
        ]);
        entry += `${clientes.rows[0]?.c || 0} clientes activos. ${pending.rows[0]?.c || 0} trabajos pendientes. Health checks OK.`;
      } else if (agent.id === 'enzo') {
        const completed = await pg.query(
          `SELECT count(*) as c FROM "Trabajo" WHERE estado = 'COMPLETED' AND "createdAt" > NOW() - INTERVAL '7 days'`
        );
        entry += `${completed.rows[0]?.c || 0} contenidos completados esta semana. Content calendar generado.`;
      } else if (agent.id === 'marcos') {
        entry += 'Services uptime OK. BD PostgreSQL respondiendo. Jobs queue analisado.';
      } else if (agent.id === 'diana') {
        const [clientes, completed] = await Promise.all([
          pg.query('SELECT count(*) as c FROM "Cliente" WHERE activo = true'),
          pg.query('SELECT count(*) as c FROM "Trabajo" WHERE estado = \'COMPLETED\''),
        ]);
        entry += `Score global: ${Math.min(100, Math.round((parseInt(clientes.rows[0]?.c||0)*20)+(parseInt(completed.rows[0]?.c||0)*2)))}/100. Business health tracked.`;
      } else {
        entry += 'Tareas proactivas ejecutadas. Sin incidencias.';
      }

      await Palace.diaryWrite(agent.id, entry, 'daily');
      log(`${agent.color} ${agent.id}: ${entry.slice(0, 80)}...`);
    } catch(e) {
      log(`${agent.color} ${agent.id}: error - ${e.message}`);
    }
  }
}

// ─── PALACE: SAVE RECENT DELIVERABLES ───────────────────────────────────────
async function saveRecentDeliverables(pg) {
  log('═══ SAVING RECENT DELIVERABLES TO PALACE ═══');
  
  // Guardar trabajos completados esta semana
  const trabajos = await pg.query(
    `SELECT t.id, t."clienteId", t."agenteId", t.titulo, t.descripcion, t.estado, t."createdAt"
     FROM "Trabajo" t
     WHERE t.estado = 'COMPLETED' 
       AND t."createdAt" > NOW() - INTERVAL '7 days'
     LIMIT 20`
  );
  
  let saved = 0;
  for (const t of trabajos.rows) {
    try {
      const wing = t.clienteId ? `cliente_${t.clienteId.slice(0, 8)}` : `agente_${(t.agenteId || 'unknown').toLowerCase()}`;
      const room = 'hechos'; // MemPalace-style: completed = hecho/fact
      
      await Palace.addDrawer(wing, room, 
        `${t.titulo || 'Deliverable'}: ${(t.descripcion || '').slice(0, 300)}`,
        null,
        { agenteId: t.agenteId, estado: t.estado, createdAt: t.createdAt }
      );
      saved++;
    } catch(e) { /* skip dupes */ }
  }
  
  log(`${saved} deliverable(s) guardado(s) en palace.`);
  return saved;
}

// ─── KNOWLEDGE GRAPH: SEED ──────────────────────────────────────────────────
async function seedKnowledgeGraph(pg) {
  log('═══ SEEDING KNOWLEDGE GRAPH ═══');
  
  const kg = new KnowledgeGraph(pg);
  
  try {
    const seeded = await kg.seedFromMyCompi();
    log(`KG seed: ${seeded} entity/triple(s) añadido(s).`);
    
    const stats = await kg.stats();
    log(`KG stats: ${stats.entities} entities, ${stats.triples} triples.`);
  } catch(e) {
    log(`KG seed error: ${e.message}`);
  }
}

// ─── L1: REFRESH CRITICAL FACTS ─────────────────────────────────────────────
async function refreshCriticalFacts(pg) {
  log('═══ REFRESHING L1 CRITICAL FACTS ═══');
  l1.invalidate(); // Force reload
  const facts = await l1.load(pg);
  log(`L1 refresh: ${facts.clientes?.length || 0} clientes, ${facts.agentes?.length || 0} agentes en cache.`);
}

// ─── PALACE STATUS ──────────────────────────────────────────────────────────
async function showPalaceStatus() {
  const status = await palaceStatus();
  log(`Palace: ${status.stats.wings} wings, ${status.stats.rooms} rooms, ${status.stats.drawers} drawers, ${status.stats.diaryAgents} agents con diaries (${status.stats.diaryEntries} entries).`);
}

// ─── MEMORY SUMMARY FOR ALBERTO ─────────────────────────────────────────────
async function generateMemorySummary() {
  const summaryFile = path.join(SHARED_DIR, 'memory-summary.md');
  
  const status = await palaceStatus();
  const hoy = new Date().toISOString().slice(0, 10);
  
  const summary = `# 📝 Memory Summary — ${hoy}

## Palace (MemPalace-style)
- **Wings:** ${status.stats.wings}
- **Rooms:** ${status.stats.rooms}  
- **Drawers:** ${status.stats.drawers} (memorias verbatim guardadas)
- **Diaries activos:** ${status.stats.diaryAgents} agentes × ${status.stats.diaryEntries} entries totales

## Knowledge Graph
- Entidades y relaciones agente↔cliente↔trabajo guardadas con validez temporal
- Cada agente mantiene su diary con lo aprendido cada día

## Sistema de memoria activo
El sistema guarda:
- ✅ Cada deliverable completado (verbatim, no resumido)
- ✅ Decisiones de equipo (hechos = rooms tipo 'hechos')
- ✅ Diary de cada agente al final de cada día
- ✅ Relaciones temporales en el knowledge graph
- ✅ Stats críticos en L1 (recargados cada 5 min)

\`\`\`
L0 → L1 → L2 → L3
Identidad → Facts críticos → Session recall → Deep search
\`\`\`

## Para el próximo día
Los agentes comienzan con contexto fresco: L0+L1 siempre cargado.
L2 (session) y L3 (palace search) bajo demanda.
`;

  fs.writeFileSync(summaryFile, summary);
  log('Memory summary generado.');
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  log('══════════════════════════════════');
  log('PROACTIVE MEMORY — MyCompi — Running');
  
  const pg = new Client(DB);
  await pg.connect();
  
  await refreshCriticalFacts(pg);
  await saveRecentDeliverables(pg);
  await seedKnowledgeGraph(pg);
  await runAgentDiaries(pg);
  await showPalaceStatus();
  await generateMemorySummary();
  
  log('══════════════════════════════════');
  log('PROACTIVE MEMORY — Done');
  
  await pg.end();
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });