const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const jobId = process.argv[2];
const newEstado = process.argv[3] || 'completado';

pool.query('SELECT estado FROM "Trabajo" WHERE id = $1', [jobId])
  .then(r => { 
    console.log('Current estado:', JSON.stringify(r.rows[0]?.estado));
    return pool.query('UPDATE "Trabajo" SET estado = $1, updatedAt = NOW(), completedAt = NOW() WHERE id = $2 RETURNING id, estado', [newEstado, jobId]);
  })
  .then(r => { 
    console.log('Updated:', JSON.stringify(r.rows)); 
    pool.end(); 
  })
  .catch(e => { console.error('Error:', e.message); pool.end(); });
