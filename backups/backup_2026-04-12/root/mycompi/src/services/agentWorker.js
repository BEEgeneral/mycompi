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

  // Bloqueo para evitar ejecuciones concurrentes
  const workerId = `worker_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const lockTimeout = 5 * 60 * 1000; // 5 min

  const locked = await prisma.trabajo.updateMany({
    where: { id: taskId, ejecutor: null, estado: 'TODO' },
    data: { ejecutor: workerId }
  });

  if (locked.count === 0) {
    console.log(`[Worker] Tarea ${taskId} ya está siendo ejecutada por otro worker`);
    return { error: 'Tarea bloqueada por otro worker' };
  }

  // Si es tarea de research onboarding, delegar a la función especializada
  if (tarea.tags?.includes('research') && tarea.titulo.includes('Investigar')) {
    console.log(`[Worker] Tarea de research onboarding detectada — ejecutando runOnboardingResearch`);
    return await runOnboardingResearch(tarea.clienteId);
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
      ejecutor: null, // Liberar lock
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

// ─────────────────────────────────────────
// RESEARCH DE ONBOARDING
// Se ejecuta después del primer pago para investigar la empresa
// y generar documentos + tareas personalizadas
// ─────────────────────────────────────────
async function runOnboardingResearch(clienteId) {
  console.log(`[Research] Iniciando onboarding research para cliente ${clienteId}`);

  // 1. Cargar datos del cliente
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId }
  });

  if (!cliente) {
    console.error(`[Research] Cliente ${clienteId} no encontrado`);
    return { error: 'Cliente no encontrado' };
  }

  // Si no hay empresa, saltar research
  if (!cliente.empresa) {
    console.log(`[Research] Cliente sin empresa — saltando research`);
    return { skipped: true, reason: 'sin empresa' };
  }

  // 2. Buscar información de la empresa
  let businessInfo = null;
  try {
    businessInfo = await searchBusinessInfo(cliente.empresa, cliente.email);
  } catch (err) {
    console.error(`[Research] Error buscando info de ${cliente.empresa}:`, err.message);
  }

  // 3. Generar Mission + tareas específicas con OpenClaw
  let missionText = null;
  let tareas = null;

  try {
    const research = await generateMissionAndTasks(cliente, businessInfo);
    missionText = research.mission;
    tareas = research.tareas;
  } catch (err) {
    console.error(`[Research] Error generando mission/tareas:`, err.message);
  }

  // 4. Guardar Mission real
  if (missionText) {
    const existingMission = await prisma.documento.findFirst({
      where: { clienteId, tipo: 'MISION' }
    });

    if (existingMission) {
      await prisma.documento.update({
        where: { id: existingMission.id },
        data: { contenido: missionText }
      });
    } else {
      await prisma.documento.create({
        data: {
          clienteId,
          tipo: 'MISION',
          titulo: 'Mission',
          contenido: missionText,
        }
      });
    }
  }

  // 5. Guardar info de negocio si tenemos
  if (businessInfo) {
    await prisma.documento.upsert({
      where: { id: businessInfo.id || 'none' },
      create: {
        clienteId,
        tipo: 'PRODUCTO',
        titulo: 'Research de empresa',
        contenido: businessInfo.summary,
        metadata: {
          competitors: businessInfo.competitors,
          sector: businessInfo.sector,
          keywords: businessInfo.keywords,
        }
      },
      update: {
        contenido: businessInfo.summary,
        metadata: {
          competitors: businessInfo.competitors,
          sector: businessInfo.sector,
          keywords: businessInfo.keywords,
        }
      }
    });
  }

  // 6. Crear tareas específicas basadas en el research
  if (tareas && tareas.length > 0) {
    // Primero marcar las tareas genéricas de onboarding como "completadas" o eliminarlas
    await prisma.trabajo.updateMany({
      where: {
        clienteId,
        estado: 'TODO',
        tags: { has: 'onboarding' }
      },
      data: { estado: 'COMPLETED', completedAt: new Date() }
    });

    // Crear las tareas específicas del research
    for (const t of tareas) {
      await prisma.trabajo.create({
        data: {
          clienteId,
          agenteId: t.agenteId || 'paco',
          titulo: t.titulo,
          descripcion: t.descripcion,
          prioridad: t.prioridad || 'MEDIA',
          estado: 'TODO',
          tags: ['research', 'onboarding'],
        }
      });
    }
  }

  // 7. Notificar al cliente
  await prisma.notificacion.create({
    data: {
      clienteId,
      agenteId: 'paco',
      tipo: 'COMPLETADO',
      titulo: '🔍 Research completado — tu equipo está listo',
      contenido: 'Hemos investigado tu empresa y preparado tareas específicas para ti. Revisa tu dashboard.',
    }
  });

  // 8. Enviar email de "equipo listo"
  if (RESEND) {
    try {
      await RESEND.emails.send({
        from: 'MyCompi <noreply@mycompi.com>',
        to: cliente.email,
        subject: '🔍 Tu equipo está listo — hemos investigado tu empresa',
        html: `
          <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2D3261; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="color: #FFD154; margin: 0; font-size: 24px;">🔍 We did the homework</h1>
            </div>
            <div style="background: #FCF9F1; padding: 24px; border-radius: 0 0 16px 16px;">
              <p style="font-size: 16px; color: #333;">
                Hola <strong>${cliente.nombre}</strong>, hemos investigado <strong>${cliente.empresa}</strong> y preparado todo para que tu equipo IA empiece a trabajar.
              </p>
              <div style="background: white; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #555; margin: 0 0 8px 0;"><strong>📋 Lo que hemos hecho:</strong></p>
                <ul style="font-size: 14px; color: #666; margin: 0; padding-left: 20px;">
                  <li>Investigación de tu empresa y sector</li>
                  <li>Mission personalizada</li>
                  <li>Tareas específicas para tu negocio</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${FRONTEND_URL}/#/dashboard" style="display: inline-block; background: #FFD154; color: #2D3261; font-weight: bold; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-size: 15px;">Ver mi equipo →</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error(`[Research] Error enviando email:`, err.message);
    }
  }

  console.log(`[Research] Completado para ${cliente.empresa}`);
  return { ok: true, cliente: cliente.empresa };
}

// ─────────────────────────────────────────
// Buscar información de empresa con Brave Search
// ─────────────────────────────────────────
async function searchBusinessInfo(empresa, email) {
  // Intentar buscar en web
  const searchResults = await callOpenClaw(
    `Busca información sobre la empresa "${empresa}" en internet. Dame:1. Qué hacen2. En qué sector están3. Quiénes son sus competidores principales4. Qué keywords definen su negocioResponde en español.`,
    empresa,
    'BASICO'
  );

  if (!searchResults) {
    return {
      summary: `Empresa: ${empresa}. No se encontró información adicional en web.`,
      competitors: [],
      sector: 'No identificado',
      keywords: [],
    };
  }

  // Extraer keywords y competidores con otro prompt
  const analysis = await callOpenClaw(
    `Analiza esta información sobre ${empresa} y extrae:
1. Un resumen de 2-3 frases de qué hace la empresa
2. Lista de 3-5 competidores o alternativas en su sector
3. 5 keywords que definan su negocio
4. El sector principal

Información:
${searchResults}

Responde en JSON con este formato:
{
  "summary": "...",
  "competitors": ["comp1", "comp2", ...],
  "sector": "...",
  "keywords": ["kw1", "kw2", ...]
}`,
    empresa,
    'BASICO'
  );

  try {
    // Intentar extraer JSON
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ...JSON.parse(jsonMatch[0]), raw: searchResults };
    }
  } catch (e) {}

  return {
    summary: analysis.slice(0, 500),
    competitors: [],
    sector: 'Ver información',
    keywords: [],
    raw: searchResults,
  };
}

// ─────────────────────────────────────────
// Generar Mission + tareas específicas con IA
// ─────────────────────────────────────────
async function generateMissionAndTasks(cliente, businessInfo) {
  const info = businessInfo?.summary || `Empresa: ${cliente.empresa}`;

  const prompt = `Eres el director de MyCompi. Acabas de investigar a un nuevo cliente.

**Empresa:** ${cliente.empresa}
**Email:** ${cliente.email}
**Sector/Info:** ${info}

**Tu trabajo:**
1. Escribe una MISSION para esta empresa (2-4 frases). La misión debe reflejar qué problema resuelven, para quién, y cómo MyCompi les ayuda. Tono: inspirador pero concreto.

2. Crea 3 tareas INICIALES específicas para esta empresa (no genéricas). Cada tarea debe:
- Estar adaptada a su sector/negocio
- Ser accionable y clara
- Tener prioridad ALTA o MEDIA
- Mencionar al agente correcto (Laura=atención cliente, Enzo=marketing, Carlos=ventas, Elena=operaciones, Diana=data, Marcos=desarrollo)

Responde en JSON con este formato exacto:
{
  "mission": "tu misión aquí",
  "tareas": [
    {"titulo": "título tarea 1", "descripcion": "descripción", "prioridad": "ALTA", "agenteId": "agente"},
    {"titulo": "título tarea 2", "descripcion": "descripción", "prioridad": "MEDIA", "agenteId": "agente"},
    {"titulo": "título tarea 3", "descripcion": "descripción", "prioridad": "ALTA", "agenteId": "agente"}
  ]
}

Solo responde con el JSON. Sin explicaciones.`;

  const response = await callOpenClaw(prompt, cliente.empresa, cliente.plan);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('[Research] Error parsing JSON:', e.message);
  }

  // Fallback si no se puede parsear
  return {
    mission: `Hacer crecer ${cliente.empresa} usando un equipo de agentes IA especializados.`,
    tareas: [
      { titulo: '🚀 Configurar perfil de empresa', descripcion: 'Completa los datos de tu empresa', prioridad: 'ALTA', agenteId: 'paco' },
      { titulo: '💬 Preséntale tu negocio a Paco', descripcion: 'Cuéntale qué necesitas', prioridad: 'ALTA', agenteId: 'paco' },
      { titulo: '📋 Revisa las capacidades de tu equipo', descripcion: 'Conoce a Laura, Enzo, Carlos...', prioridad: 'MEDIA', agenteId: 'paco' },
    ]
  };
}

// ─────────────────────────────────────────
// CREAR TAREAS DIARIAS RECURRENTES
// Se ejecuta cada día para cada cliente activo
// ─────────────────────────────────────────
async function createDailyRecurrentTasks(clienteId) {
  const { TAREAS_POR_AGENTE, AGENTES_DIARIOS } = require('./tareas');

  const hoy = new Date();
  const fechaStr = hoy.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check si ya se crearon hoy
  const yaExiste = await prisma.trabajo.findFirst({
    where: {
      clienteId,
      tags: { has: 'recurrente_diaria' },
      createdAt: {
        gte: new Date(hoy.setHours(0, 0, 0, 0)),
        lt: new Date(hoy.setHours(23, 59, 59, 999)),
      }
    }
  });

  if (yaExiste) {
    console.log(`[Worker] Tareas diarias ya creadas hoy para cliente ${clienteId}`);
    return { skipped: true, reason: 'ya creadas hoy' };
  }

  let creadas = 0;
  for (const agenteId of AGENTES_DIARIOS) {
    const tareas = TAREAS_POR_AGENTE[agenteId] || [];
    for (const tarea of tareas) {
      await prisma.trabajo.create({
        data: {
          clienteId,
          agenteId,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          prioridad: tarea.prioridad,
          estado: 'TODO',
          tags: [...tarea.tags, 'recurrente_diaria'],
          inputData: { fecha: fechaStr },
        }
      });
      creadas++;
    }
  }

  console.log(`[Worker] Creadas ${creadas} tareas diarias recurrentes para cliente ${clienteId}`);
  return { ok: true, creadas };
}

// ─────────────────────────────────────────
// NIGHT SHIFT MEJORADO
// 1. Crear tareas recurrentes diarias si no existen
// 2. Procesar tareas de onboarding en orden
// 3. Procesar tareas recurrentes
// ─────────────────────────────────────────
async function runNightShiftV2() {
  console.log('[NightShift] Iniciando V2...');

  const clientes = await prisma.cliente.findMany({
    where: { activo: true },
    select: { id: true, email: true, nombre: true, plan: true }
  });

  console.log(`[NightShift] Revisando ${clientes.length} clientes`);

  for (const cliente of clientes) {
    // 1. Crear tareas diarias recurrentes si no existen
    await createDailyRecurrentTasks(cliente.id);

    // 2. Procesar tareas pendientes de onboarding en orden
    const onboardingPendientes = await prisma.trabajo.findMany({
      where: {
        clienteId: cliente.id,
        estado: 'TODO',
        tags: { has: 'onboarding' }
      },
      orderBy: [{ inputData: { orden: 'asc' } }, { createdAt: 'asc' }],
      take: 1 // Solo la siguiente en secuencia
    });

    if (onboardingPendientes.length > 0) {
      const tarea = onboardingPendientes[0];
      console.log(`[NightShift] Ejecutando onboarding: ${tarea.titulo}`);
      try {
        await executeTask(tarea.id);
      } catch (err) {
        console.error(`[NightShift] Error en onboarding ${tarea.id}:`, err.message);
      }
    }

    // 3. Procesar tareas recurrentes del día
    const recurrentes = await prisma.trabajo.findMany({
      where: {
        clienteId: cliente.id,
        estado: 'TODO',
        tags: { has: 'recurrente_diaria' }
      },
      orderBy: [
        { prioridad: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 5 // Máx 5 tareas recurrentes por ciclo
    });

    for (const tarea of recurrentes) {
      try {
        await executeTask(tarea.id);
        await new Promise(r => setTimeout(r, 1000)); // 1s entre tareas
      } catch (err) {
        console.error(`[NightShift] Error en tarea ${tarea.id}:`, err.message);
      }
    }
  }

  console.log('[NightShift] V2 completado');
}

// ─────────────────────────────────────────
// MICRO CICLO — Procesa tareas TODO cada 10 min
// Solo ejecuta: onboarding pendientes + tareas con más de 15min esperando
// No crea tareas nuevas (eso es job del night shift)
// ─────────────────────────────────────────
async function runMicroCycle() {
  const { prisma } = require('../lib/db');

  // Buscar clientes con tareas TODO que lleve > 15min sin ejecutarse
  const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 min

  const tareasPendientes = await prisma.trabajo.findMany({
    where: {
      estado: 'TODO',
      createdAt: { lte: cutoff }
    },
    orderBy: [
      { tags: 'onboarding' },  // priorizar onboarding
      { createdAt: 'asc' }
    ],
    take: 3, // Máx 3 por ciclo para no saturar
    include: { cliente: true }
  });

  if (tareasPendientes.length === 0) {
    return { ok: true, procesadas: 0 };
  }

  console.log(`[MicroCycle] Procesando ${tareasPendientes.length} tareas pendientes`);

  let procesadas = 0;
  for (const tarea of tareasPendientes) {
    // Skip si ya se está ejecutando (lock)
    if (tarea.ejecutor) continue;

    try {
      await executeTask(tarea.id);
      procesadas++;
      await new Promise(r => setTimeout(r, 2000)); // 2s entre tareas
    } catch (err) {
      console.error(`[MicroCycle] Error en tarea ${tarea.id}:`, err.message);
    }
  }

  console.log(`[MicroCycle] Completado: ${procesadas} tareas procesadas`);
  return { ok: true, procesadas };
}

module.exports = {
  executeTask,
  processPendingTasks,
  runNightShift,
  runNightShiftV2,
  runOnboardingResearch,
  createDailyRecurrentTasks,
  runMicroCycle,
  buildTaskPrompt
};
