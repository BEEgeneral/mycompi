require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const agenteId = 'cmnct80ih0005r9tkdmktoi7i';

async function main() {
  const res = await pool.query(
    'SELECT id, titulo, estado, prioridad, "agenteId", "createdAt" FROM "Trabajo" WHERE "agenteId" = $1 ORDER BY "createdAt" DESC LIMIT 15',
    [agenteId]
  );
  console.log('Trabajos de Carlos:', JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
