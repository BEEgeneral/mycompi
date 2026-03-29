/**
 * agentWorker.js — Ejecuta tareas de la cola con IA
 *
 * Cada tarea se ejecuta usando OpenClaw como brain.
 * El worker:
 * 1. Coge una tarea TODO de la cola
 * 2. Construye un prompt con el contexto del cliente + tarea
 * 3. Llama a OpenClaw para que ejecute
 * 4. Guarda el resultado en outputData
 * 5. Crea una notificación para el cliente
 */
const { prisma } = require('../lib/db');
const fetch = require('node-fetch');
const { Resend } = require('resend');

const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || process.env.OPENCLAW_GATEWAY_TOKEN || '';
const RESEND = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mycompi.onrender.com';

// ─────────────────────────────────────────
// Prompt builder por tipo de tarea
// ─────────────────────────────────────────
function buildTaskPrompt(tarea, cliente, documentos) {
  const docsText = documentos.length > 0
    ? `\n\nDOCUMENTOS DEL CLIENTE:\n${documentos.map(d => `[${d.tipo}] ${d.titulo}\n${d.contenido}`).join('\n\n')}`
    : '\n\n(no hay documentos aún)';

  const basePrompt = `Eres un agente de MyCompi trabajando para el cliente "${cliente.nombre}" (${cliente.empresa || 'sin empresa'}).`;

  // Tareas de onboarding
  if (tarea.titulo.includes('Configura tu perfil')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

Esta es una tarea de onboarding. El cliente acaba de unirse a MyCompi y necesita configurar su perfil.

${docsText}

INSTRUCCIONES:
1. Genera un mensaje de presentación amigable para el cliente
2. Explícale qué datos necesita completar (nombre empresa, sector, web, descripción)
3. Menciona los beneficios de hacerlo pronto para que los agentes trabajen mejor
4. Usa tono informal, directo, en español de España
5. La respuesta debe ser directamente lo que enviarías al cliente — un mensaje corto y útil

Responde SOLO con el mensaje a enviar al cliente.`;
  }

  if (tarea.titulo.includes('Preséntale tu negocio a Paco')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

El cliente aún no ha hablado con Paco. Anímale a hacerlo.

${docsText}

INSTRUCCIONES:
1. Genera un mensaje corto que explique qué puede pedirle a Paco
2. Da 3 ejemplos concretos de cosas que Paco puede hacer (ej: crear una campaña de email, analizar la competencia, redactar textos)
3. Usa tono informal, cercano, en español de España
4. Incluye un botón hacia el chat con Paco si es posible

Responde SOLO con el mensaje a enviar al cliente.`;
  }

  if (tarea.titulo.includes('Revisa las capacidades')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

Presenta al equipo de agentes al cliente.

${docsText}

INSTRUCCIONES:
1. Presenta a cada agente con su nombre, emoji y specialty
2. Explica brevemente qué hace cada uno
3. Usa un tono cercano y entusiasta
4. Menciona que todos trabajan juntos coordinados por Paco
5. Español de España

Equipo:
- 💬 Laura Montes — Atención al Cliente (soporte 24/7)
- 📊 Enzo Herrera — Marketing (campañas, contenido, SEO)
- 💼 Carlos Mendoza — Ventas (leads, cierre, seguimiento)
- ⚙️ Elena Ortega — Operaciones (automatizaciones)
- 📈 Diana Palau — Data (métricas y análisis)
- 💻 Marcos Fernández — Desarrollo Web (web y e-commerce)
- 🤖 Pelayo — Asistente personal

Responde SOLO con el mensaje a enviar al cliente.`;
  }

  if (tarea.titulo.includes('competidores') || tarea.titulo.includes('análisis') || tarea.titulo.includes('research')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

${tarea.descripcion || 'Investiga y analiza.'}

${docsText}

INSTRUCCIONES:
1. Investiga los principales competidores en el sector del cliente
2. Usa Brave Search para buscar información real
3. Presenta un resumen de 3-5 competidores con: nombre, fortalezas, debilidades, precio
4. Incluye recomendaciones para el cliente
5. Formato: secciones claras con headers

IMPORTANTE: Usa la herramienta brave_web_search para buscar información real.
Si no tienes acceso a Brave Search, proporciona un análisis basado en conocimiento general.

Responde con el análisis completo.`;
  }

  if (tarea.titulo.includes('email') || tarea.titulo.includes(' outreach') || tarea.titulo.includes('leads')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

${tarea.descripcion || 'Genera una estrategia de captación de leads.'}

${docsText}

INSTRUCCIONES:
1. Genera una lista de 5 empresas o perfiles ideales como leads para el cliente
2. Explica por qué encajan con su producto/servicio
3. Sugiere un approach inicial para contactarlos
4. Incluye un ejemplo de email frío personalizado (breve, menos de 100 palabras)

Tono: profesional pero cercano, en español de España.

Responde SOLO con la estrategia y el ejemplo de email.`;
  }

  if (tarea.titulo.includes('contenido') || tarea.titulo.includes('blog') || tarea.titulo.includes('tweet')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

${tarea.descripcion || 'Crea contenido para el cliente.'}

${docsText}

INSTRUCCIONES:
1. Crea 3 ideas de contenido (post de blog, tweet, o email)
2. Para cada idea: título, outline breve, y primer párrafo
3. El contenido debe ser relevante para el sector del cliente
4. Tono: informal, directo, interesante

Responde con las 3 ideas de contenido.`;
  }

  if (tarea.titulo.includes('análisis') || tarea.titulo.includes('métricas') || tarea.titulo.includes('data')) {
    return `${basePrompt}

 TAREA: "${tarea.titulo}"

${tarea.descripcion || 'Genera un análisis de datos.'}

${docsText}

INSTRUCCIONES:
1. Revisa qué datos tiene el cliente actualmente
2. Genera un mini-reporte con:
   - KPIs principales建议
   - 3 insights accionables
   - 1 próxima acción recomendada
3. Usa un formato claro con secciones

Responde SOLO con el reporte.`;
  }

  // Fallback: tarea genérica
  return `${basePrompt}

 TAREA: "${tarea.titulo}"

${tarea.descripcion || 'Ejecuta esta tarea.'}

${docsText}

INSTRUCCIONES:
1. Analiza la tarea y haz lo que se pide
2. Si necesitas más info, genera un resumen de lo que harías
3. Sé específico y accionable
4. Español de España

Responde con el resultado de la tarea.`;
}

// ─────────────────────────────────────────
// Ejecutar UNA tarea con OpenClaw
// ─────────────────────────────────────────
async function executeTask(taskId) {
  console.log(`[Worker] Ejecutando tarea ${taskId}`);

  // 1. Cargar tarea con cliente y agentes
  const tarea = await prisma.trabajo.findUnique({
    where: { id: taskId },
    include: {
      cliente: true,
      agente: { select: { id: true, nombre: true, tipo: true } }
    }
  });

  if (!tarea) {
    console.error(`[Worker] Tarea ${taskId} no encontrada`);
    return { error: 'Tarea no encontrada' };
  }

  if (tarea.estado !== 'TODO') {
    console.log(`[Worker] Tarea ${taskId} ya no está en TODO (estado: ${tarea.estado})`);
    return { error: 'Tarea no está en estado TODO' };
  }

  // 2. Cargar documentos del cliente
  const documentos = await prisma.documento.findMany({
    where: { clienteId: tarea.clienteId },
    orderBy: { updatedAt: 'desc' }
  });

  // 3. Marcar como en progreso
  await prisma.trabajo.update({
    where: { id: taskId },
    data: { estado: 'IN_PROGRESS' }
  });

  // 4. Construir prompt y ejecutar
  const prompt = buildTaskPrompt(tarea, tarea.cliente, documentos);

  let resultado = null;
  let errorMsg = null;

  try {
    // Llamar a OpenClaw
    resultado = await callOpenClaw(prompt, tarea.cliente.nombre, tarea.cliente.plan);
  } catch (err) {
    errorMsg = err.message;
    console.error(`[Worker] Error ejecutando tarea ${taskId}:`, err.message);
  }

  // 5. Guardar resultado
  const finalEstado = errorMsg ? 'FAILED' : 'COMPLETED';

  await prisma.trabajo.update({
    where: { id: taskId },
    data: {
      estado: finalEstado,
      completedAt: errorMsg ? null : new Date(),
      outputData: resultado ? { respuesta: resultado } : null,
      errorMsg: errorMsg || null,
    }
  });

  // 6. Crear notificación para el cliente
  const agenteNombre = tarea.agente?.nombre || 'Tu equipo';
  const emoji = finalEstado === 'COMPLETED' ? '✅' : '❌';
  const titulo = `${emoji} Tarea ${finalEstado === 'COMPLETED' ? 'completada' : 'fallida'}: ${tarea.titulo}`;

  await prisma.notificacion.create({
    data: {
      clienteId: tarea.clienteId,
      agenteId: tarea.agenteId || 'paco',
      tipo: finalEstado === 'COMPLETED' ? 'COMPLETADO' : 'ALERTA',
      titulo,
      contenido: finalEstado === 'COMPLETED'
        ? `${agenteNombre} ha completado la tarea. ${resultado ? resultado.slice(0, 200) + '...' : ''}`
        : `No se pudo completar: ${errorMsg}`,
    }
  });

  // 7. Notificar por email si tenemos API key
  if (RESEND && finalEstado === 'COMPLETED') {
    try {
      await RESEND.emails.send({
        from: 'MyCompi <noreply@mycompi.com>',
        to: tarea.cliente.email,
        subject: `${emoji} ${tarea.titulo}`,
        html: `
          <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2D3261; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #FFD154; margin: 0; font-size: 24px;">${agenteNombre} ha trabajado para ti</h1>
            </div>
            <div style="background: #FCF9F1; padding: 24px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 16px; color: #333;"><strong>${tarea.titulo}</strong></p>
              <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 14px; color: #555;">
                ${(resultado || '').slice(0, 500)}${(resultado || '').length > 500 ? '...' : ''}
              </div>
              <div style="text-align: center;">
                <a href="${FRONTEND_URL}/#/dashboard" style="display: inline-block; background: #FFD154; color: #2D3261; font-weight: bold; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px;">Ver dashboard →</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error(`[Worker] Error enviando email:`, emailErr.message);
    }
  }

  console.log(`[Worker] Tarea ${taskId} -> ${finalEstado}`);
  return { ok: true, estado: finalEstado, resultado };
}

// ─────────────────────────────────────────
// Llamar a OpenClaw
// ─────────────────────────────────────────
async function callOpenClaw(prompt, clienteNombre, plan) {
  if (!OPENCLAW_TOKEN) {
    console.warn('[Worker] OPENCLAW_TOKEN no configurado, usando fallback');
    return generateFallbackResponse(prompt);
  }

  const messages = [
    { role: 'system', content: 'Eres un agente de MyCompi. Responde en español de España de forma útil y directa.' },
    { role: 'user', content: prompt }
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout para worker

    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
        'x-openclaw-agent-id': 'main'
      },
      body: JSON.stringify({
        model: 'minimax/MiniMax-M2.7',
        messages,
        max_tokens: 1500,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenClaw error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respuesta vacía de OpenClaw');
    return content;

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Timeout (2 min) llamando a OpenClaw');
    }
    throw err;
  }
}

// ─────────────────────────────────────────
// Fallback si no hay OpenClaw
// ─────────────────────────────────────────
function generateFallbackResponse(prompt) {
  if (prompt.includes('competidores') || prompt.includes('research')) {
    return `📊 Análisis de competencia (simulado):

**Competidor 1: VendorA**
- 💰 Precio: ~€99/mes
- ✅ Fuerte en integraciones
- ❌ No tiene español
- Recomendación: Posicionar MyCompi como alternativa más ágil y con soporte en español

**Competidor 2: ToolX**
- 💰 Precio: €49/mes
- ✅ Buena UX
- ❌ Solo inglés
- Recomendación: Diferenciarse por atención al cliente en español

Este es un análisis de ejemplo. Para datos reales, conecta OpenClaw correctamente.`;
  }

  if (prompt.includes('email') || prompt.includes('leads')) {
    return `📧 Estrategia de leads (simulada):

**3 leads ideales:**
1. Empresa de software SaaS B2B en Madrid — busca automatizar atención al cliente
2. Agencia de marketing en Barcelona — quiere escalar con IA
3. E-commerce en Valencia — necesita soporte 24/7

**Email frío ejemplo:**
> Hola [Nombre],
>
> He visto que [Empresa] está creciendo rápido. ¿Y si pudieras atender a tus clientes 24/7 sin desgastarte?
>
> MyCompi tiene un equipo de agentes IA en español que trabajan solos.
>
> ¿Te apuntas a una demo de 15 min?
>
> Un saludo,
> El equipo MyCompi

Este es un ejemplo. Los agentes reales generarán contenido personalizado.`;
  }

  return `✅ He analizado tu tarea y preparado una respuesta.

Lo siento, el sistema de ejecución con IA no está configurado todavía. Los agentes reales de MyCompi generarán contenido completo cuando estén activos.

 mientras tanto, puedes chatear con Paco directamente en el dashboard para recibir ayuda personalizada.`;
}

// ─────────────────────────────────────────
// Ejecutar tareas pendientes de un cliente
// ─────────────────────────────────────────
async function processPendingTasks(clienteId) {
  const tareas = await prisma.trabajo.findMany({
    where: { clienteId, estado: 'TODO' },
    orderBy: [
      { prioridad: 'desc' },
      { createdAt: 'asc' }
    ],
    take: 3, // Máx 3 tareas por ciclo para no saturar
    include: {
      agente: { select: { id: true, nombre: true } }
    }
  });

  const resultados = [];
  for (const tarea of tareas) {
    try {
      const resultado = await executeTask(tarea.id);
      resultados.push({ tareaId: tarea.id, ...resultado });
    } catch (err) {
      resultados.push({ tareaId: tarea.id, error: err.message });
    }
    // Delay entre tareas para no saturar
    await new Promise(r => setTimeout(r, 2000));
  }

  return resultados;
}

// ─────────────────────────────────────────
// Night shift: revisar todos los clientes
// ─────────────────────────────────────────
async function runNightShift() {
  console.log('[NightShift] Iniciando...');

  // Solo clientes activos
  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, email: true, nombre: true, plan: true }
  });

  console.log(`[NightShift] Revisando ${clientes.length} clientes`);

  for (const cliente of clientes) {
    // Revisar tareas pendientes
    const pendingCount = await prisma.trabajo.count({
      where: { clienteId: cliente.id, estado: { in: ['TODO', 'IN_PROGRESS'] } }
    });

    if (pendingCount > 0) {
      console.log(`[NightShift] Cliente ${cliente.nombre}: ${pendingCount} tareas pendientes — procesando...`);
      await processPendingTasks(cliente.id);
    }
  }

  console.log('[NightShift] Completado');
}

module.exports = {
  executeTask,
  processPendingTasks,
  runNightShift,
  buildTaskPrompt
};
