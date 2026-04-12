const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', ssl: { rejectUnauthorized: false } });
pool.query('SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = \'EstadoTrabajo\'')
  .then(r => { console.log(JSON.stringify(r.rows)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
