const {Client} = require('pg');

const DB = {
  host: '172.24.0.2',
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  connectionTimeoutMillis: 8000,
  statement_timeout: 8000,
};

const QA_CHECKS = {
  email: [
    { id: 'titulo', name: 'Titulo no vacio y < 60 chars', fn: t => t.titulo && t.titulo.length < 60 },
    { id: 'descripcion', name: 'Descripcion > 50 chars', fn: t => t.descripcion && t.descripcion.length > 50 },
    { id: 'tono', name: 'Sin errores visibles', fn: t => !t.descripcion?.match(/ERRO|ERROR|FATAL/i) },
  ],
  contenido: [
    { id: 'titulo', name: 'Titulo > 3 chars', fn: t => t.titulo && t.titulo.length > 3 },
    { id: 'descripcion', name: 'Contenido > 100 chars', fn: t => t.descripcion && t.descripcion.length > 100 },
    { id: 'calidad', name: 'No es placeholder', fn: t => !t.descripcion?.match(/Lorem ipsum|TODO|TBD|xxx/i) },
  ],
  default: [
    { id: 'titulo', name: 'Titulo > 3 chars', fn: t => t.titulo && t.titulo.length > 3 },
    { id: 'descripcion', name: 'Descripcion > 20 chars', fn: t => t.descripcion && t.descripcion.length > 20 },
    { id: 'completo', name: 'No es WIP', fn: t => !t.descripcion?.match(/wip|trabajando|pendiente|in progress/i) },
  ],
};

function getChecks(Titulo, Descripcion) {
  const text = ((Titulo || '') + ' ' + (Descripcion || '')).toLowerCase();
  if (text.match(/email|newsletter|correo/i)) return QA_CHECKS.email;
  if (text.match(/contenido|post|blog|redes|social/i)) return QA_CHECKS.contenido;
  return QA_CHECKS.default;
}

async function main() {
  console.log('VALERIA QA GATE');
  const pg = new Client(DB);
  await pg.connect();
  
  const res = await pg.query(`
    SELECT * FROM "Trabajo" 
    WHERE "requiereAprobacion" = true 
      AND "estado" = 'COMPLETED' 
    ORDER BY "updatedAt" DESC
    LIMIT 20
  `);
  
  if (res.rows.length === 0) {
    console.log('Sin deliverables pendientes de QA');
    await pg.end();
    return;
  }
  
  // Filter those without QA approval
  const pending = res.rows.filter(t => !t.metadata || !t.metadata.qa_aprobado);
  if (pending.length === 0) {
    console.log('Todos los deliverables ya tienen QA');
    await pg.end();
    return;
  }
  
  console.log(pending.length + ' deliverable(s) para revisar');
  
  let approved = 0, rejected = 0;
  
  for (const t of pending) {
    const checks = getChecks(t.titulo, t.descripcion);
    const results = checks.map(c => ({ ...c, passed: c.fn(t) }));
    const passed = results.filter(c => c.passed).length;
    const score = Math.round((passed / results.length) * 100);
    
    const status = score >= 60 ? 'APPROVED' : 'REJECTED';
    const passEmoji = score >= 60 ? '✅' : '❌';
    
    console.log(passEmoji + ' [' + (t.titulo || 'sin titulo').slice(0, 40) + '] ' + passed + '/' + results.length + ' checks — ' + score + '/100');
    
    await pg.query('UPDATE "Trabajo" SET "metadata" = jsonb_set(COALESCE("metadata", \'{}\'), \'{qa_aprobado}\', $1) WHERE id = $2', [
      JSON.stringify({ score, status, revisor: 'Valeria', timestamp: new Date().toISOString(), checks: results.map(c => ({ id: c.id, passed: c.passed })) }),
      t.id
    ]);
    
    const veredicto = score >= 60
      ? 'QA PASS — Score ' + score + '/100. "' + (t.titulo || 'trabajo').slice(0, 50) + '" listo para entrega.'
      : 'QA FAIL — Score ' + score + '/100. "' + (t.titulo || 'trabajo').slice(0, 50) + '" necesita revision.';
    
    await pg.query(`
      INSERT INTO "Notificacion" ("id","clienteId","agenteId","tipo","titulo","contenido","leida","createdAt","updatedAt")
      VALUES (gen_random_uuid(), $1, 'Valeria', $2, $3, $4, false, NOW(), NOW())
    `, [
      t.clienteId,
      score >= 60 ? 'INFO' : 'WARNING',
      (score >= 60 ? '✅ QA Aprobado' : '❌ QA Rechazado') + ': ' + (t.titulo || 'trabajo').slice(0, 40),
      veredicto
    ]);
    
    if (score >= 60) approved++; else rejected++;
  }
  
  console.log('VALERIA QA: ' + approved + ' aprobados, ' + rejected + ' rechazados');
  await pg.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
