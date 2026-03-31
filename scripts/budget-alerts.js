/**
 * Budget Alerts Cron — se ejecuta cada hora
 *
 * Para cada agente activo, verifica si tokensUsadosMes >= budgetTokensMes * (alertaPorcentaje/100)
 * Si cumple y no se notificó hoy, crea Notificacion + AuditLog
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 15000,
});

const AGENT_API_KEY = process.env.AGENT_API_KEY || '';

async function main() {
  const ahora = new Date().toISOString();
  console.log(`[${ahora}] Budget alerts check starting...`);

  // Obtener todos los agentes con budget configurado
  const agentes = await pool.query(`
    SELECT id, "clienteId", nombre, "budgetTokensMes", "alertaPorcentaje",
           "tokensUsadosMes", "ultimoResetTokens"
    FROM "Agente"
    WHERE estado = 'ACTIVO'
      AND "budgetTokensMes" IS NOT NULL
      AND "budgetTokensMes" > 0
  `);

  let notificados = 0;
  for (const ag of agentes.rows) {
    const budget = parseInt(ag.budgetTokensMes) || 0;
    const usado = parseInt(ag.tokensUsadosMes) || 0;
    const umbral = Math.round(budget * ((ag.alertaPorcentaje || 80) / 100));

    if (usado < umbral) continue;

    // ¿Ya se notificó hoy?
    const ya = await pool.query(`
      SELECT id FROM "Notificacion"
      WHERE "agenteId" = $1
        AND tipo = 'WARNING'
        AND "createdAt" > NOW() - INTERVAL '24 hours'
        AND contenido LIKE '%presupuesto%'
    `, [ag.id]);

    if (ya.rows.length > 0) {
      console.log(`  ${ag.nombre}: ya alertado hace <24h, skip`);
      continue;
    }

    // Calcular coste estimado (aprox 0.01€ por 100k tokens)
    const costeEstimado = (usado / 100000 * 0.01).toFixed(4);
    const pct = budget > 0 ? Math.round(usado / budget * 100) : 0;
    const mensaje = `⚠️ ${ag.nombre} ha usado ${pct}% del presupuesto mensual (${(usado/1000).toFixed(0)}k/${(budget/1000).toFixed(0)}k tokens). Est. ~€${costeEstimado}`;

    // Crear notificación
    await pool.query(`
      INSERT INTO "Notificacion" (id, "clienteId", "agenteId", tipo, titulo, contenido, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, 'WARNING', $3, $4, NOW())
    `, [ag.clienteId, ag.id, `⚠️ Alerta presupuesto: ${ag.nombre}`, mensaje]);

    // Audit log
    await pool.query(`
      INSERT INTO "AuditLog" (id, "clienteId", "agenteId", accion, "recursoTipo", "recursoId", detalle, "createdAt")
      VALUES (gen_random_uuid(), $1, $2, $3, 'Agente', $4, $5, NOW())
    `, [ag.clienteId, ag.id, 'TOKEN_ALERTA_80', ag.id, JSON.stringify({
      agente: ag.nombre,
      tokensUsados: usado,
      budgetTokens: budget,
      porcentaje: pct,
      umbralPorcentaje: ag.alertaPorcentaje || 80,
    })]);

    console.log(`  ✅ Alertado: ${ag.nombre} (${pct}% usado)`);
    notificados++;
  }

  console.log(`Listo. ${notificados} alertas enviadas.`);
  await pool.end();
  process.exit(0);
}

main().catch(async (e) => {
  console.error('Error budget alerts:', e.message);
  await pool.end();
  process.exit(1);
});
