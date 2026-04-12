require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  // Clientes activos
  const clientes = await pool.query("SELECT id, nombre, email, plan, activo, \"createdAt\" FROM \"Cliente\" WHERE activo = true ORDER BY \"createdAt\" DESC LIMIT 20");
  console.log('=== CLIENTES ACTIVOS ===');
  console.log(JSON.stringify(clientes.rows, null, 2));

  // Verificar tabla Email para outreach
  const emailCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Email'");
  console.log('\n=== COLUMNAS EMAIL ===');
  console.log(JSON.stringify(emailCols.rows, null, 2));

  // Verificar InteraccionChat
  const intCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'InteraccionChat'");
  console.log('\n=== COLUMNAS InteraccionChat ===');
  console.log(JSON.stringify(intCols.rows, null, 2));

  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
