/**
 * Agent Queue Reader — lee trabajos pendientes de la cola Trabajo
 *
 * Uso:
 *   node agent-queue-reader.js <agenteId>
 *
 * Muestra los trabajos pendientes del agente ordenados por prioridad.
 * Los jobs CRITICA sin aprobar se muestran como "PENDIENTE APROBACIÓN".
 *
 * Este script lo llama el HEARTBEAT de cada agente en cada despertar.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/models/db');

const LIMIT = 10;

async function leerCola(agenteId) {
  // Jobs del agente ordenados por prioridad y fecha
  const jobs = await pool.query(`
    SELECT
      t.id,
      t.titulo,
      t.descripcion,
      t.prioridad,
      t.estado,
      t."requiereAprobacion",
      t."aprobadoAt",
      t."notaAprobacion",
      t.tags,
      t."createdAt",
      t."agenteId",
      a.nombre as agente_nombre,
      CASE t.prioridad
        WHEN 'CRITICA' THEN 1
        WHEN 'ALTA'     THEN 2
        WHEN 'MEDIA'    THEN 3
        WHEN 'BAJA'     THEN 4
        ELSE 5
      END as orden
    FROM "Trabajo" t
    LEFT JOIN "Agente" a ON t."agenteId" = a.id
    WHERE t."clienteId" = (
      SELECT "clienteId" FROM "Agente" WHERE id = $1 LIMIT 1
    )
      AND (
        t."agenteId" = $1                          -- jobs asignados a este agente
        OR (t."agenteId" IS NULL AND t.estado = 'TODO')  -- jobs sin agente (cola abierta)
      )
      AND t.estado NOT IN ('COMPLETED', 'FAILED', 'BLOCKED')
      AND (
        -- Sin approval requerida O ya aprobada
        t."requiereAprobacion" = false
        OR t."aprobadoAt" IS NOT NULL
      )
    ORDER BY orden ASC, t."createdAt" ASC
    LIMIT $2
  `, [agenteId, LIMIT]);

  // Jobs que SÍ requieren approval pero aún no están aprobados
  const pendientesAprobacion = await pool.query(`
    SELECT t.id, t.titulo, t.prioridad, t."createdAt"
    FROM "Trabajo" t
    WHERE t."clienteId" = (
      SELECT "clienteId" FROM "Agente" WHERE id = $1 LIMIT 1
    )
      AND t."agenteId" = $1
      AND t."requiereAprobacion" = true
      AND t."aprobadoAt" IS NULL
      AND t.estado NOT IN ('COMPLETED', 'FAILED', 'BLOCKED')
    ORDER BY t."createdAt" ASC
    LIMIT 5
  `, [agenteId]);

  return { jobs: jobs.rows, pendientesAprobacion: pendientesAprobacion.rows };
}

async function main() {
  const agenteId = process.argv[2];

  if (!agenteId) {
    console.error('Uso: node agent-queue-reader.js <agenteId>');
    process.exit(1);
  }

  try {
    // Obtener info del agente
    const agInfo = await pool.query(
      `SELECT nombre, tipo FROM "Agente" WHERE id = $1`,
      [agenteId]
    );

    if (agInfo.rows.length === 0) {
      console.error(`Agente no encontrado: ${agenteId}`);
      process.exit(1);
    }

    const { nombre, tipo } = agInfo.rows[0];
    const { jobs, pendientesAprobacion } = await leerCola(agenteId);

    // Output formateado para el agente
    console.log(`\n📋 COLA DE TRABAJO — ${nombre} (${tipo})`);
    console.log(`   ${new Date().toLocaleString('es-ES')}`);
    console.log('');

    if (pendientesAprobacion.length > 0) {
      console.log(`⏳ PENDIENTES DE APROBACIÓN (no ejecutar hasta que el cliente apruebe):`);
      for (const j of pendientesAprobacion) {
        console.log(`   🔒 [${j.prioridad}] ${j.titulo}`);
        console.log(`      ID: ${j.id} | Creado: ${new Date(j.createdAt).toLocaleDateString('es-ES')}`);
      }
      console.log('');
    }

    if (jobs.length === 0) {
      console.log('   ✅ Cola vacía — nada pendiente. ¡Buen trabajo!');
    } else {
      console.log(`📌 TRABAJOS DISPONIBLES (${jobs.length}/${LIMIT}):`);
      const PRIORIDAD_EMOJI = { CRITICA: '🔴', ALTA: '🟠', MEDIA: '🟡', BAJA: '🟢' };
      for (const j of jobs) {
        const emoji = PRIORIDAD_EMOJI[j.prioridad] || '⚪';
        const estado = j.estado === 'IN_PROGRESS' ? '🔄' : '📋';
        const tags = j.tags ? j.tags.map(t => `#${t}`).join(' ') : '';
        console.log(`   ${emoji}${estado} [${j.prioridad}] ${j.titulo}`);
        if (j.descripcion) {
          console.log(`      → ${j.descripcion.substring(0, 120)}${j.descripcion.length > 120 ? '...' : ''}`);
        }
        console.log(`      ID: ${j.id} | Tags: ${tags || 'ninguno'}`);
        console.log('');
      }
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error leyendo cola:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
