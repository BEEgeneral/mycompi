/**
 * sync-heartbeats.js — MyCompi
 * 
 * Lee los archivos last-heartbeat.json de cada agente y actualiza
 * el campo ultimoHeartbeat en la tabla Agente de la BD.
 * 
 * También limpia notificaciones spam de QA (>100) manteniendo solo las últimas 50.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB = {
  host: '172.24.0.2',
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
};

const AGENTS_DIR = '/data/.openclaw/workspace/mycompi/agents';
const LOG_FILE = '/root/mycompi/logs/sync-heartbeats.log';

const AGENTS = ['laura', 'enzo', 'carlos', 'elena', 'diana', 'marcos', 'calidad'];

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

async function main() {
  log('SYNC HEARTBEATS — starting');
  const pg = new Client(DB);
  await pg.connect();

  let updated = 0;
  let errors = 0;

  for (const agentDir of AGENTS) {
    const hbFile = path.join(AGENTS_DIR, agentDir, 'last-heartbeat.json');
    try {
      if (!fs.existsSync(hbFile)) {
        continue;
      }
      const hb = JSON.parse(fs.readFileSync(hbFile, 'utf8'));
      if (!hb.timestamp) {
        continue;
      }

      // Map agent dir name to DB nombre
      const nombreMap = {
        laura: 'Laura Montes',
        enzo: 'Enzo Costa',
        carlos: 'Carlos Ruiz',
        elena: 'Elena Ortega',
        diana: 'Diana Fabián',
        marcos: 'Marcos Torralba',
        calidad: 'Valeria Sanz',
      };

      const nombre = nombreMap[agentDir] || agentDir;
      const ts = new Date(hb.timestamp);

      await pg.query(
        'UPDATE "Agente" SET "ultimoHeartbeat" = $1 WHERE nombre = $2',
        [ts, nombre]
      );

      log(`Updated ${nombre}: ${hb.timestamp}`);
      updated++;

      // Delete the file after syncing
      fs.unlinkSync(hbFile);
    } catch(e) {
      log(`Error ${agentDir}: ${e.message}`);
      errors++;
    }
  }

  // Limpiar spam de notificaciones QA (>100 → mantener últimas 50)
  try {
    const notifCount = await pg.query('SELECT count(*) as c FROM "Notificacion" WHERE "agenteId" = \'Valeria\'');
    if (parseInt(notifCount.rows[0].c) > 80) {
      await pg.query(`
        DELETE FROM "Notificacion" 
        WHERE id IN (
          SELECT id FROM "Notificacion" 
          WHERE "agenteId" = 'Valeria' 
          ORDER BY "createdAt" ASC 
          LIMIT (SELECT count(*) - 50 FROM "Notificacion" WHERE "agenteId" = 'Valeria')
        )
      `);
      log('Cleaned QA spam notifications');
    }
  } catch(e) {
    log('Notif cleanup error: ' + e.message);
  }

  log(`Done. Updated: ${updated}, Errors: ${errors}`);
  await pg.end();
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });