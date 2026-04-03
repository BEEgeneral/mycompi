const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });

async function main() {
  await client.connect();
  
  // MRR from pagos (last 30 days)
  const mrr = await client.query("SELECT SUM(cantidad) as mrr FROM \"Pago\" WHERE estado = 'COMPLETED' AND tipo = 'SUSCRIPCION' AND \"createdAt\" > NOW() - INTERVAL '30 days'");
  console.log('MRR:', mrr.rows[0].mrr);
  
  // Users
  const users = await client.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE \"createdAt\" > NOW() - INTERVAL '30 days') as new30d, COUNT(*) FILTER (WHERE \"ultimoAcceso\" > NOW() - INTERVAL '7 days') as active7d FROM \"Usuario\"");
  console.log('Total users:', users.rows[0].total);
  console.log('New users (30d):', users.rows[0].new30d);
  console.log('Active users (7d):', users.rows[0].active7d);
  
  // Job estados enum
  const jobEnums = await client.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'EstadoTrabajo')");
  console.log('Job estados:', jobEnums.rows.map(r => r.enumlabel).join(', '));
  
  // Client count
  const clientes = await client.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE activo = true) as active FROM \"Cliente\"");
  console.log('Clientes total:', clientes.rows[0].total, '/ active:', clientes.rows[0].active);
  
  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
