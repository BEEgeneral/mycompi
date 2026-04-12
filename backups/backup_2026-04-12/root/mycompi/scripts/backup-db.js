#!/usr/bin/env node
/**
 * backup-db.js — MyCompi Database Backup
 * pg_dump Neon → backups/YYYY-MM-DD/ → git push
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cleanUrl(s) {
  return (s || '').replace(/^["']|["']$/g, '').trim().split('?')[0];
}

function parsePgUrl(url) {
  // postgresql://user:pass@host:port/db
  const atIdx = url.indexOf('@');
  if (atIdx < 0) return null;
  const creds = url.slice('postgresql://'.length, atIdx);
  const [user, password] = creds.split(':');
  const after = url.slice(atIdx + 1);
  const slashIdx = after.indexOf('/');
  const hostPort = after.slice(0, slashIdx);
  const dbname = after.slice(slashIdx + 1);
  const [host, port] = hostPort.includes(':')
    ? [hostPort.slice(0, hostPort.lastIndexOf(':')), hostPort.slice(hostPort.lastIndexOf(':') + 1)]
    : [hostPort, '5432'];
  return { user, password, host, port: port || '5432', dbname };
}

const raw = cleanUrl(process.env.DATABASE_URL);
const pg = parsePgUrl(raw);
if (!pg) { console.error('[BACKUP] No pude parsear DATABASE_URL'); process.exit(1); }

const today = new Date().toISOString().slice(0, 10);
const backupDir = path.join(__dirname, `../backups/backup_${today}`);
const dumpFile = path.join(backupDir, `mycompi_db_${today}.sql`);
const metaFile = path.join(backupDir, 'meta.json');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const pgBin = '/home/linuxbrew/.linuxbrew/opt/postgresql@17/bin/pg_dump';
console.log(`[BACKUP] Dumping ${pg.dbname}@${pg.host}:${pg.port}...`);
try {
  execSync(
    `${pgBin} -h "${pg.host}" -p "${pg.port}" -U "${pg.user}" -d "${pg.dbname}" -F p -f "${dumpFile}" --no-password`,
    { env: { ...process.env, PGPASSWORD: pg.password }, maxBuffer: 200 * 1024 * 1024 }
  );
} catch(e) { console.error('[BACKUP] pg_dump falló:', e.message); process.exit(1); }

const sizeMB = (fs.statSync(dumpFile).size / 1024 / 1024).toFixed(2);
console.log(`[BACKUP] ✅ Dump creado: ${sizeMB} MB`);

fs.writeFileSync(metaFile, JSON.stringify({ date: today, host: pg.host, dbname: pg.dbname, port: pg.port, sizeMB: +sizeMB, createdAt: new Date().toISOString() }, null, 2));

// Git
try {
  const repo = path.join(__dirname, '..');
  execSync(`git add backups/backup_${today}/`, { cwd: repo });
  const changed = execSync('git diff --cached --quiet', { cwd: repo, encoding: 'utf8', stdio: 'pipe' });
  if (changed) {
    execSync(`git commit -m "backup db: ${today} (${sizeMB} MB)"`, { cwd: repo });
    execSync('git push origin main', { cwd: repo });
    console.log('[BACKUP] ✅ Git push ok');
  } else { console.log('[BACKUP] Sin cambios nuevos'); }
} catch(e) { console.warn('[BACKUP] Git:', e.message); }

// Rotación > 7 días
try {
  const dir = path.join(__dirname, '../backups');
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const n of fs.readdirSync(dir).filter(n => n.startsWith('backup_'))) {
    const f = path.join(dir, n);
    const d = new Date(n.slice(7, 17));
    if (!isNaN(d.getTime()) && d < new Date(cutoff)) {
      fs.rmSync(f, { recursive: true });
      console.log(`[BACKUP] 🗑️ ${n}`);
    }
  }
} catch(e) { console.warn('[BACKUP] Rotación:', e.message); }

console.log(`[BACKUP] ✅ Listo — ${sizeMB} MB — ${today}`);
