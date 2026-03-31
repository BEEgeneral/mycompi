/**
 * Budget Alert Cron
 * Se ejecuta cada hora: comprueba si algún agente ha superado
 * el umbral de alerta (alertaPorcentaje) de su budgetTokensMes.
 *
 * Solo alerta una vez por período de billing (hasta el siguiente reset).
 * Usa la tabla AuditLog para evitar duplicados: si ya existe un
 * TOKEN_ALERTA_80 para ese agente en este billing period, no re-alerta.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/models/db');

const BILLING_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // mes natural

async function main() {
  // Agentes activos con budget configurado
  const agentes = await pool.query(`
    SELECT id, "clienteId", nombre, "budgetTokensMes",
           "tokensUsadosMes", "alertaPorcentaje", "ultimoResetTokens"
    FROM "Agente"
    WHERE activo = true
      AND "budgetTokensMes" IS NOT NULL
      AND "budgetTokensMes" > 0
  `);

  let alertsSent = 0;

  for (const ag of agentes.rows) {
    const budget = parseInt(ag.budgetTokensMes) || 1_000_000;
    const used = parseInt(ag.tokensUsadosMes) || 0;
    const alertPct = parseInt(ag.alertaPorcentaje) || 80;
    const threshold = Math.round(budget * alertPct / 100);

    if (used < threshold) continue; // dentro del umbral

    // ¿Ya alertamos en este billing period?
    const lastAlert = await pool.query(`
      SELECT id FROM "AuditLog"
      WHERE "agenteId" = $1
        AND accion = $2
        AND "createdAt" > NOW() - INTERVAL '30 days'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `, [ag.id, 'TOKEN_ALERTA_80']);

    if (lastAlert.rows.length > 0) {
      console.log(`SKIP ${ag.nombre}: ya alertado este período`);
      continue;
    }

    const pct = Math.round(used / budget * 100);
    const detalle = {
      agente: ag.nombre,
      usado: used,
      budget,
      umbral: alertPct,
      porcentaje: pct,
    };

    // Log en AuditLog
    await pool.query(`
      INSERT INTO "AuditLog" (id, "clienteId", "agenteId", accion, "recursoTipo", detalle, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
    `, [ag.clienteId, ag.id, 'TOKEN_ALERTA_80', 'Agente', JSON.stringify(detalle)]);

    // Notificación al cliente
    const titulo = pct >= 100
      ? `🚨 ${ag.nombre}: Presupuesto agotado`
      : `⚠️ ${ag.nombre}: ${pct}% del budget consumido`;

    const contenido = pct >= 100
      ? `${ag.nombre} ha alcanzado el 100% de su presupuesto mensual (${(used/1000).toFixed(0)}k / ${(budget/1000).toFixed(0)}k tokens). Contacta con soporte para ampliarlo.`
      : `${ag.nombre} ha superado el umbral del ${alertPct}% de su budget (${pct}% usado, ${(used/1000).toFixed(0)}k / ${(budget/1000).toFixed(0)}k tokens).`;

    await pool.query(`
      INSERT INTO "Notificacion" (id, "clienteId", "agenteId", tipo, titulo, contenido, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
    `, [ag.clienteId, ag.id, 'WARNING', titulo, contenido]);

    console.log(`ALERT: ${ag.nombre} - ${pct}% usado (umbral ${alertPct}%)`);
    alertsSent++;
  }

  console.log(`Budget alerts: ${alertsSent} notificaciones enviadas`);
  await pool.end();
}

main().catch(err => {
  console.error('Error budget-alerts:', err);
  process.exit(1);
});
