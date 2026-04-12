const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const jobId = '08e215da-2e6b-4090-a1fd-916e7be10055';

pool.query('UPDATE "Trabajo" SET estado = $1, completedAt = NOW() WHERE id = $2 RETURNING id, estado', ['COMPLETED', jobId])
  .then(r => { console.log(JSON.stringify(r.rows)); pool.end(); })
  .catch(e => { console.error('Error:', e.message); pool.end(); });
