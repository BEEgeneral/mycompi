/**
 * DAILY COORDINATION — MyCompi
 * 
 * Lee standups del día y genera resumen de coordinación.
 * También escribe en daily-coord.md para referencia rápida.
 * Usa conexión directa a PostgreSQL.
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
const COORD_FILE  = SHARED_DIR + '/daily-coord.md';
const LOG_FILE    = '/root/mycompi/logs/coordination.log';

const hoy = new Date().toISOString().slice(0, 10);
const dayName = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date().getDay()];

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

async function main() {
  log(`COORDINATION DAILY — ${hoy}`);
  
  if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR, { recursive: true });
  }
  
  const pg = new Client(DB);
  await pg.connect();
  
  // Obtener stats del día desde BD
  const [[clientesResult], [completedResult], [pendingResult]] = await Promise.all([
    pg.query('SELECT count(*) as c FROM "Cliente" WHERE activo = true'),
    pg.query('SELECT count(*) as c FROM "Trabajo" WHERE estado = \'COMPLETED\''),
    pg.query('SELECT count(*) as c FROM "Trabajo" WHERE estado NOT IN (\'COMPLETED\')'),
  ]);
  
  const stats = {
    clientes: parseInt(clientesResult?.c || 0),
    completados: parseInt(completedResult?.c || 0),
    pendientes: parseInt(pendingResult?.c || 0),
  };
  
  // Leer standups existentes
  let standupContent = fs.existsSync(STANDUP_FILE) ? fs.readFileSync(STANDUP_FILE, 'utf8') : '';
  
  // Si hoy no existe, crear standup básico
  if (!standupContent.includes(`## ${hoy}`)) {
    let section = `\n## ${hoy} | ${dayName.toUpperCase()}\n\n`;
    const AGENTS = ['paco','laura','enzo','carlos','elena','diana','marcos','valeria'];
    for (const a of AGENTS) {
      section += `\n### ${a.charAt(0).toUpperCase() + a.slice(1)}\n`;
      section += `- **HOY:** Disponible — awaiting briefing data.\n`;
      section += `- **BLOQUEADO:** ninguno\n`;
      section += `- **SIGUIENTE:** Coordinando con equipo.\n`;
    }
    section += '\n---\n';
    standupContent = section + standupContent;
  }
  
  // Mantener solo 30 días
  const lines = standupContent.split('\n');
  const filtered = [];
  let skip = false;
  for (const line of lines) {
    const m = line.match(/^## (\d{4}-\d{2}-\d{2})/);
    if (m) { const diff = (new Date() - new Date(m[1])) / 86400000; skip = diff > 30; }
    if (!skip) filtered.push(line);
  }
  
  fs.writeFileSync(STANDUP_FILE, filtered.join('\n'));
  fs.writeFileSync(COORD_FILE, filtered.slice(0, 200).join('\n'));
  
  log(`Coordination: ${stats.clientes} clientes, ${stats.completados} completados, ${stats.pendientes} pendientes. ${filtered.length} líneas en standups.`);
  await pg.end();
}

main().catch(e => log('FATAL: ' + e.message));