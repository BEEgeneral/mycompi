const { Pool } = require('pg');
require('dotenv').config({ path: '/data/.openclaw/workspace/mycompi/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const jobId = process.argv[2] || '08e215da-2e6b-4090-a1fd-916e7be10055';
pool.query('SELECT * FROM "Trabajo" WHERE id = $1', [jobId])
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
