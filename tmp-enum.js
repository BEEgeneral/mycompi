const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT label, value FROM pg_enum WHERE enumtypid = 'estadotrabajo'::regtype ORDER BY val")
  .then(r => { console.log('pg_enum result:', JSON.stringify(r.rows)); pool.end(); })
  .catch(e => { 
    console.error('Error:', e.message);
    // Try alternative
    return pool.query("SELECT DISTINCT estado FROM \"Trabajo\"")
      .then(r => { console.log('Distinct estados:', JSON.stringify(r.rows)); pool.end(); })
      .catch(e2 => { console.error(e2.message); pool.end(); });
  });
