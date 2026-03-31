/**
 * Reset Mensual de Tokens
 * Se ejecuta el día 1 de cada mes a las 00:05 España (16:05 UTC).
 * Resetea tokensUsadosMes a 0 y actualiza ultimoResetTokens.
 * Solo resetea si el último reset fue en un mes anterior.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/models/db');

async function main() {
  const result = await pool.query(`
    UPDATE "Agente"
    SET "tokensUsadosMes" = 0,
        "ultimoResetTokens" = NOW()
    WHERE activo = true
      AND ("ultimoResetTokens" IS NULL
           OR DATE_TRUNC('month', "ultimoResetTokens") < DATE_TRUNC('month', NOW()))
    RETURNING id, nombre, "tokensUsadosMes", "ultimoResetTokens"
  `);

  console.log(`Tokens reseteados: ${result.rowCount} agentes`);
  for (const ag of result.rows) {
    console.log(`  - ${ag.nombre} (reset: ${ag.ultimoResetTokens})`);
  }

  await pool.end();
}

main().catch(err => {
  console.error('Error reset-mensual:', err);
  process.exit(1);
});
