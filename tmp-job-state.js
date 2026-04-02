const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

// Check enum values
pool.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'estadotrabajo')")
  .then(r => { console.log('Estado enum values:', JSON.stringify(r.rows)); })
  .then(() => pool.query('SELECT id, estado, titulo, "agenteId" FROM "Trabajo" WHERE id = $1', ['08e215da-2e6b-4090-a1fd-916e7be10055']))
  .then(r => { console.log('Job:', JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
