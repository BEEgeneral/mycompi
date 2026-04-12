/**
 * Ejecuta migración SQL FASE 1+2 paso a paso
 * Uso: node scripts/run-migration.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const SKIP_CODES = new Set(['42701', '42P07', '23505', '42P16', '42703']);

async function run(sql) {
  try {
    await pool.query(sql);
    return { ok: true };
  } catch (e) {
    if (SKIP_CODES.has(e.code)) {
      return { ok: true, skipped: true, reason: e.code };
    }
    return { ok: false, error: e.message };
  }
}

async function main() {
  const raw = fs.readFileSync(__dirname + '/../prisma/migrations/20260401_fase12_additions.sql', 'utf8');

  // Remove full-line comments only
  const lines = raw.split('\n').filter(l => !l.trim().startsWith('--'));
  const sql = lines.join('\n');

  // Split by semicolon
  const rawStmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith(')') && !s.endsWith('('));

  // Re-attach ) that was split off
  const stmts = [];
  for (let i = 0; i < rawStmts.length; i++) {
    let s = rawStmts[i];
    // If next starts with ')', append it
    if (i + 1 < rawStmts.length && rawStmts[i+1].trim() === ')') {
      s = s + ')';
      i++; // skip the )
    }
    if (s.trim()) stmts.push(s.trim());
  }

  console.log(`Ejecutando ${stmts.length} statements...`);
  let ok = 0, fail = 0;

  for (const stmt of stmts) {
    if (!stmt || !stmt.trim() || stmt.startsWith('ALTER TABLE') && stmt.includes('ADD COLUMN IF NOT EXISTS')) {
      // Individual ALTER TABLE ADD COLUMN - run separately
    }
    const result = await run(stmt);
    if (result.ok) {
      if (result.skipped) {
        console.log('  SKIP  ', result.reason, '|', stmt.substring(0, 70));
      } else {
        ok++;
        console.log('  OK    ', stmt.substring(0, 80));
      }
    } else {
      fail++;
      console.log('  FAIL  ', result.error.substring(0, 80));
      console.log('       ', stmt.substring(0, 80));
    }
  }

  console.log(`\nResultado: ${ok} OK, ${fail} FAIL`);
  await pool.end();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
