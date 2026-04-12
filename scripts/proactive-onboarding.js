/**
 * AUTO-ONBOARDING — MyCompi
 * 
 * Detecta nuevos clientes activos sin trabajos creados y ejecuta onboarding:
 * 1. Envía email de bienvenida via Resend API
 * 2. Crea tareas iniciales en la BD
 * 3. Notifica a Laura para seguimiento
 * 
 * Usa conexión directa a PostgreSQL para leer clientes/trabajos.
 */

const { Client } = require('pg');
const https = require('https');
const fs = require('fs');

const DB = {
  host: '172.24.0.2',
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
};

const LOG_FILE = '/root/mycompi/logs/onboarding.log';
const RESEND_KEY = process.env.RESEND_API_KEY || 're_TRtcXVky_54TGjwu7juDeY9cbQFCW2Ahj';

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  fs.appendFileSync(LOG_FILE, `[${ts}] ${msg}\n`);
}

function resendEmail(to, subject, html) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ from: 'MyCompi <onboarding@mycompi.com>', to: [to], subject, html });
    const opts = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  log('══════════════════════════════════');
  log('AUTO-ONBOARDING CHECK — Ejecutando');
  
  const pg = new Client(DB);
  await pg.connect();
  
  // Clientes activos
  const clientesRes = await pg.query(
    'SELECT id, nombre, email FROM "Cliente" WHERE activo = true LIMIT 50'
  );
  
  if (clientesRes.rows.length === 0) {
    log('0 clientes activos');
    await pg.end();
    return;
  }
  
  // Clientes con trabajos ya creados
  const trabajosRes = await pg.query(
    'SELECT DISTINCT "clienteId" FROM "Trabajo" WHERE "clienteId" IS NOT NULL LIMIT 200'
  );
  const clientesConTrabajos = new Set(trabajosRes.rows.map(r => r.clienteId));
  
  // Clientes sin trabajos = pendientes de onboarding
  const sinOnboarding = clientesRes.rows.filter(c => !clientesConTrabajos.has(c.id));
  
  if (sinOnboarding.length === 0) {
    log('Sin clientes pendientes de onboarding');
    await pg.end();
    return;
  }
  
  log(`${sinOnboarding.length} cliente(s) sin onboarding`);
  
  const AGENTES_INFO = [
    { nombre: 'Paco', especialidad: 'Director de equipo — coordina todo' },
    { nombre: 'Laura', especialidad: 'Customer Success — tu punto de contacto' },
    { nombre: 'Enzo', especialidad: 'Marketing — contenido y redes sociales' },
    { nombre: 'Carlos', especialidad: 'Ventas — leads y crecimiento' },
    { nombre: 'Elena', especialidad: 'Operaciones — automatizaciones' },
    { nombre: 'Diana', especialidad: 'Finanzas — métricas y estrategia' },
    { nombre: 'Marcos', especialidad: 'Producto — desarrollo técnico' },
    { nombre: 'Valeria', especialidad: 'Calidad — revisa todo antes de entrega' },
  ];
  
  for (const cliente of sinOnboarding) {
    const nombre = cliente.nombre || cliente.email.split('@')[0];
    
    // 1. Enviar email bienvenida via Resend
    const html = `
      <div style="font-family: Arial; max-width: 600px; margin: auto;">
        <h2 style="color: #2D3261;">¡Bienvenido/a a MyCompi! 🎉</h2>
        <p>Hola ${nombre},</p>
        <p>Tu <strong>equipo de Compis agénticos</strong> ya está configurado y listo para trabajar para ti 24/7.</p>
        <hr style="border: 1px solid #eee;">
        <h3>Tu equipo:</h3>
        <ul>
          ${AGENTES_INFO.map(a => `<li><strong>${a.nombre}</strong> — ${a.especialidad}</li>`).join('')}
        </ul>
        <hr style="border: 1px solid #eee;">
        <h3>Primeros pasos:</h3>
        <ol>
          <li>👋 <strong>Preséntanos tu negocio</strong></li>
          <li>📋 <strong>Pide tu primera tarea</strong></li>
          <li>📊 <strong>Explora tu dashboard</strong></li>
        </ol>
        <p>Accede a tu dashboard: <a href="https://mycompi.onrender.com/dashboard">mycompi.onrender.com/dashboard</a></p>
        <p style="color: #666; font-size: 12px;">¿Preguntas? Responde a este email o habla con tu director, Paco.</p>
      </div>
    `;
    
    const emailResult = await resendEmail(cliente.email, `👋 Bienvenido/a ${nombre}, tu equipo de Compis está listo`, html);
    if (emailResult.id || emailResult.error) {
      log(`  Email → ${emailResult.id ? '✓ enviado' : '✗ error: ' + emailResult.error}`);
    }
    
    // 2. Crear trabajos iniciales de onboarding
    const onboardingJobs = [
      { titulo: `Bienvenida para ${nombre}`, prioridad: 'ALTA', descripcion: 'Presentar equipo, configurar workspace, llamada de introducción' },
      { titulo: `Configurar dashboard para ${nombre}`, prioridad: 'MEDIA', descripcion: 'Personalizar métricas y KPIs importantes' },
      { titulo: `Primer contenido para ${nombre}`, prioridad: 'MEDIA', descripcion: 'Crear primera pieza de contenido alineada con el sector' },
      { titulo: `Quality Gate setup inicial`, prioridad: 'ALTA', descripcion: 'Verificar que el setup inicial cumple quality standards' },
    ];
    for (const job of onboardingJobs) {
      await pg.query(
        `INSERT INTO "Trabajo" 
         ("id","clienteId","agenteId","titulo","descripcion","estado","prioridad","createdAt","updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [cliente.id, 'Laura', job.titulo, job.descripcion, 'TODO', job.prioridad]
      );
    }
    log(`  ${onboardingJobs.length} trabajos de onboarding creados`);
    
    // 3. Notificar a Laura
    await pg.query(
      `INSERT INTO "Notificacion" 
       ("id","clienteId","agenteId","tipo","titulo","contenido","leida","createdAt","updatedAt") 
       VALUES (gen_random_uuid(), $1, 'Laura', 'INFO', $2, $3, false, NOW(), NOW())`,
      [cliente.id, `Nuevo cliente en onboarding: ${nombre}`, 'Cliente activo sin trabajos previos. Email enviado. Trabajos de onboarding creados.']
    );
    
    log(`  ✓ Onboarding completo para ${nombre}`);
  }
  
  log(`${sinOnboarding.length} onboarding(s) completado(s)`);
  await pg.end();
}

main().catch(e => { log('FATAL: ' + e.message); process.exit(1); });