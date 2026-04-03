require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/models/db');

async function main() {
  const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log(JSON.stringify(tables.rows, null, 2));
  
  const jobs = await pool.query(`
    SELECT id, titulo, descripcion, prioridad, estado, tags, "createdAt"
    FROM "Trabajo" 
    WHERE "agenteId" = 'cmnct819t000br9tk1t1nm1f1' 
      AND estado = 'TODO'
    ORDER BY 
      CASE prioridad WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,
      "createdAt" ASC
    LIMIT 5
  `);
  console.log('JOBS:', JSON.stringify(jobs.rows, null, 2));
  
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
