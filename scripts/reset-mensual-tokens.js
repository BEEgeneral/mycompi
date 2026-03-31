/**
 * Reset Mensual de Tokens — se ejecuta el día 1 de cada mes a las 00:05
 *
 * Resetea tokensUsadosMes a 0 para todos los agentes activos
 * y actualiza ultimoResetTokens. También hace rollback de
 * trabajos IN_PROGRESS que lleve >7 días sin actualización.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 15000,
});

async function main() {
  const ahora = new Date().toISOString();
  console.log(`[${ahora}] Reset mensual de tokens starting...`);

  // Reseteer todos los agentes activos
  const result = await pool.query(`
    UPDATE "Agente"
    SET "tokensUsadosMes" = 0,
        "ultimoResetTokens" = NOW()
    WHERE estado = 'ACTIVO'
      AND "tokensUsadosMes" IS NOT NULL
      AND "tokensUsadosMes" > 0
    RETURNING id, nombre, "tokensUsadosMes"
  `);

  console.log(`  Reset applied to ${result.rowCount} agents:`);
  for (const ag of result.rows) {
    console.log(`    - ${ag.nombre}: ${ag.tokensUsadosMes} → 0`);
  }

  // Bloquear trabajos IN_PROGRESS huérfanos (>7 días sin update)
  const orphan = await pool.query(`
    UPDATE "Trabajo"
    SET estado = 'BLOCKED',
        "errorMsg" = 'Bloqueado por inactividad: sin actualización en +7 días. Revisar manualmente.',
        "updatedAt" = NOW()
    WHERE estado = 'IN_PROGRESS'
      AND "updatedAt" < NOW() - INTERVAL '7 days'
    RETURNING id, titulo
  `);

  if (orphan.rowCount > 0) {
    console.log(`  Bloqueados ${orphan.rowCount} trabajos huérfanos:`);
    for (const t of orphan.rows) {
      console.log(`    - ${t.titulo} (${t.id})`);
    }
  }

  console.log('Reset mensual completado.');
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error('Error reset tokens:', e.message);
  await pool.end();
  process.exit(1);
});
