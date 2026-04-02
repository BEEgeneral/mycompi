const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', ssl: { rejectUnauthorized: false } });
const jobId = process.argv[2];
const estado = process.argv[3] || 'en_proceso';
pool.query('UPDATE "Trabajo" SET estado = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, estado', [estado, jobId])
  .then(r => { console.log(JSON.stringify(r.rows)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
