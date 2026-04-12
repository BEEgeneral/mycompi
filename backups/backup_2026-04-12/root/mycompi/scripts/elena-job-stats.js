const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});
const agenteId = 'cmnct80rm0007r9tkodlpaghf';
pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN estado = \'COMPLETED\' THEN 1 ELSE 0 END) as completed FROM "Trabajo" WHERE "agenteId" = $1', [agenteId])
  .then(r => { console.log('Stats:', JSON.stringify(r.rows[0])); return pool.query('SELECT id, titulo, estado, prioridad, "updatedAt" FROM "Trabajo" WHERE "agenteId" = $1 ORDER BY "updatedAt" DESC LIMIT 10', [agenteId]); })
  .then(r => { console.log('Recent jobs:', JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });