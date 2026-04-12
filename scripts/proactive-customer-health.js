/**
 * PROACTIVE CUSTOMER HEALTH — MyCompi
 * 
 * Detecta clientes inactivos y les asigna nivel de riesgo:
 * FRIO (7+ días sin actividad) → outreach
 * RIESGO (14+ días) → email
 * CHURN (30+ días) → win-back
 * 
 * Usa conexión directa a PostgreSQL (no API HTTP).
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

const LOG_FILE = '/root/mycompi/logs/customer-health.log';
const UMBRALES = [
  { dias: 7,  nivel: 'FRIO',   color: '🟡', tipo: 'INFO',    action: 'outreach' },
  { dias: 14, nivel: 'RIESGO', color: '🟠', tipo: 'WARNING', action: 'email' },
  { dias: 30, nivel: 'CHURN',  color: '🔴', tipo: 'CRITICAL', action: 'win-back' },
];

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

async function main() {
  log('══════════════════════════════════');
  log('CUSTOMER HEALTH CHECK — Ejecutando');
  
  const pg = new Client(DB);
  await pg.connect();
  
  // Obtener clientes activos
  const clientesRes = await pg.query(
    'SELECT id, nombre, email, "createdAt" FROM "Cliente" WHERE activo = true LIMIT 50'
  );
  
  if (clientesRes.rows.length === 0) {
    log('0 clientes activos — nothing to check');
    await pg.end();
    return;
  }
  
  // Obtener última actividad por cliente
  const trabajosRes = await pg.query(
    'SELECT "clienteId", MAX("updatedAt") as last_job FROM "Trabajo" WHERE "clienteId" IS NOT NULL GROUP BY "clienteId"'
  );
  
  const lastActivity = {};
  trabajosRes.rows.forEach(r => { lastActivity[r.clienteId] = new Date(r.last_job).getTime(); });
  
  const ahora = Date.now();
  const alertas = [];
  
  for (const c of clientesRes.rows) {
    const lastDate = lastActivity[c.id];
    const dias = lastDate
      ? Math.floor((ahora - lastDate) / 86400000)
      : Math.floor((ahora - new Date(c.createdAt).getTime()) / 86400000);
    
    if (dias >= 7) {
      const umbral = UMBRALES.find(u => dias >= u.dias) || UMBRALES[0];
      alertas.push({ cliente: c, dias, umbral });
    }
  }
  
  log(`Clientes activos: ${clientesRes.rows.length} | Alertas: ${alertas.length}`);
  
  for (const item of alertas.sort((a, b) => b.umbral.dias - a.umbral.dias)) {
    const { cliente, dias, umbral } = item;
    const name = cliente.nombre || cliente.email || cliente.id.slice(0, 8);
    log(`${umbral.color} ${name}: ${dias} días sin actividad (${umbral.nivel})`);
    
    // Registrar en BD
    await pg.query(
      `INSERT INTO "Notificacion" 
       ("id","clienteId","agenteId","tipo","titulo","contenido","leida","createdAt","updatedAt") 
       VALUES (gen_random_uuid(), $1, 'Laura', $2, $3, $4, false, NOW(), NOW())`,
      [
        cliente.id,
        umbral.tipo,
        `Cliente ${umbral.nivel}: ${name}`,
        `${dias} días sin actividad. Último: ${lastActivity[cliente.id] ? new Date(lastActivity[cliente.id]).toLocaleDateString('es-ES') : 'nunca'}. Acción: ${umbral.action}`
      ]
    );
  }
  
  log(`Hecho. ${alertas.length} alerta(s) creada(s).`);
  await pg.end();
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });