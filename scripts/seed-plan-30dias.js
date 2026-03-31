/**
 * seed-plan-30dias.js
 * Crea las tareas del plan 30 días en la BD para un cliente nuevo.
 * Se ejecuta automáticamente al terminar el onboarding de Paco.
 *
 * Uso: node scripts/seed-plan-30dias.js <clienteId>
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../src/models/db');

const SEMANA_COLORS = {
  1: '#FFD154', // amarillo — Fundamentos
  2: '#4A90D9', // azul — Primeros Agentes
  3: '#52D9A4', // verde — Equipo Completo
  4: '#E0529C', // rosa — Growth
};

// ──────────────────────────────────────────
// PLAN 30 DÍAS — Tareas por semana/agente
// ──────────────────────────────────────────
const PLAN_30_DIAS = [
  // ═══════════════════════════════════════
  // SEMANA 1 — FUNDAMENTOS
  // ═══════════════════════════════════════
  {
    semana: 1, dia: 1, prioridad: 'CRITICA',
    agente: 'diana', tipo: 'DATA',
    titulo: '🔍 Investigar empresa, sector y competencia',
    descripcion: `Investigar la empresa del cliente: sector, modelo de negocio, competencia directa e indirecta.
Investigar tendencias del sector y mejores prácticas.
Crear documento de Misión del cliente (tipo: MISION).
Crear documento de Investigación de competencia (tipo: USER_RESEARCH).
 OUTPUT: 2 documentos guardados en BD.`,
    tags: ['semana-1', 'dia-1', 'onboarding', 'investigacion'],
  },
  {
    semana: 1, dia: 1, prioridad: 'ALTA',
    agente: 'paco', tipo: 'CEO',
    titulo: '📋 Revisar docs de onboarding y validar plan con cliente',
    descripcion: `Revisar los documentos creados por Diana (Misión, Research).
Confirmar con el cliente que la información es correcta.
Ajustar si hay errores o missing info.
Preparar el briefing para el resto del equipo.`,
    tags: ['semana-1', 'dia-1', 'onboarding', 'briefing'],
  },
  {
    semana: 1, dia: 2, prioridad: 'ALTA',
    agente: 'marcos', tipo: 'ENGINEERING',
    titulo: '🛠️ Construir MVP del proyecto según briefing',
    descripcion: `Usando el briefing validado por Paco, Marcos construye el MVP.
Puede incluir: web básica, landing, prototipo, estructura técnica inicial.
Marcos coordina con Enzo (marketing) y Diana (data) para que todo sea consistente.
Mantener al cliente informado del progreso.`,
    tags: ['semana-1', 'dia-2', 'mvp', 'desarrollo'],
  },
  {
    semana: 1, dia: 2, prioridad: 'MEDIA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '📝 Definir Brand Voice inicial del cliente',
    descripcion: `Crear documento Brand Voice con: tono, vocabulario, público objetivo, mensajes clave.
Coordinar con Marcos para que la web/brand sea consistente visualmente.
Entregar a Paco para revisión.`,
    tags: ['semana-1', 'dia-2', 'branding', 'marketing'],
  },
  {
    semana: 1, dia: 3, prioridad: 'ALTA',
    agente: 'marcos', tipo: 'ENGINEERING',
    titulo: '🚀 Integrar MVP con panel del cliente',
    descripcion: `Integrar el MVP construido en el dashboard del cliente.
Asegurar que el cliente puede ver el avance desde su panel.
Marcos notifica a Laura cuando esté listo para revisión de calidad.`,
    tags: ['semana-1', 'dia-3', 'mvp', 'integracion'],
  },
  {
    semana: 1, dia: 3, prioridad: 'MEDIA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '📣 Definir estrategia de contenidos inicial',
    descripcion: `Crear calendario de contenidos para las primeras 4 semanas.
Identificar canales principales (LinkedIn, web, email, RRSS).
Presentar al cliente para aprobación antes de ejecutar.`,
    tags: ['semana-1', 'dia-3', 'marketing', 'contenido'],
  },
  {
    semana: 1, dia: 4, prioridad: 'CRITICA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '📧 Preparar emailing de bienvenida para el cliente',
    descripcion: `Crear email de bienvenida formal para el cliente: resumen del onboarding,
equipo asignado, próximos pasos, datos de contacto.
Coordinar con Laura para que se envíe desde la plataforma.`,
    tags: ['semana-1', 'dia-4', 'email', 'bienvenida'],
  },
  {
    semana: 1, dia: 4, prioridad: 'ALTA',
    agente: 'diana', tipo: 'DATA',
    titulo: '📊 Configurar dashboard de métricas del cliente',
    descripcion: `Configurar tracking en el dashboard del cliente.
Métricas: conversaciones, usuarios activos, drop-off, leads generados.
El cliente debe poder ver su actividad en tiempo real.`,
    tags: ['semana-1', 'dia-4', 'metrics', 'dashboard'],
  },
  {
    semana: 1, dia: 5, prioridad: 'MEDIA',
    agente: 'elena', tipo: 'RESEARCH',
    titulo: '🔎 Investigar proveedores y herramientas recomendadas',
    descripcion: `Investigación de herramientas para el sector del cliente.
Proveedores de servicios, SaaS, herramientas de automatización.
Presentar opciones con pros/contras para decisión del cliente.`,
    tags: ['semana-1', 'dia-5', 'investigacion', 'herramientas'],
  },
  {
    semana: 1, dia: 5, prioridad: 'ALTA',
    agente: 'valeria', tipo: 'SUPPORT',
    titulo: '✅ Revisión QA del MVP — gates: funcionalidad + UX',
    descripcion: `Valeria revisa el MVP completado por Marcos:
- ¿Funcionalidad correcta?
- ¿UX intuitiva?
- ¿Errores o bugs visibles?
- ¿Contenido coherente con el brand voice?
Reportar bugs a Marcos para fix inmediato.`,
    tags: ['semana-1', 'dia-5', 'qa', 'mvp'],
  },
  {
    semana: 1, dia: 6, prioridad: 'MEDIA',
    agente: 'laura', tipo: 'SUPPORT',
    titulo: '📬 Revisar emails de bienvenida y soporte inicial',
    descripcion: `Laura revisa que los emails de bienvenida están correctamente configurados.
Probar flujo completo: email → click → dashboard.
Verificar que no hay emails bounce o errores de envío.`,
    tags: ['semana-1', 'dia-6', 'email', 'soporte'],
  },
  {
    semana: 1, dia: 7, prioridad: 'ALTA',
    agente: 'paco', tipo: 'CEO',
    titulo: '📅 Resumen semana 1 + plan semana 2',
    descripcion: `Paco envía al cliente un resumen de la semana 1:
- Qué se ha hecho
- Qué funciona
- Qué necesita decisión del cliente
Presentar plan de la semana 2 y pedir validación.`,
    tags: ['semana-1', 'dia-7', 'resumen', 'cliente'],
  },

  // ═══════════════════════════════════════
  // SEMANA 2 — PRIMEROS AGENTES ACTIVOS
  // ═══════════════════════════════════════
  {
    semana: 2, dia: 1, prioridad: 'CRITICA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '🎯 Outreach: identificar 10 leads en sector del cliente',
    descripcion: `Carlos investiga y identifica 10 early adopters potenciales en el sector del cliente.
Criterios: empresas del tamaño correcto, necesidad clara, capacidad de pago.
Guardar en documento compartido: nombre, empresa, email, razón interés potencial.`,
    tags: ['semana-2', 'dia-1', 'outreach', 'leads'],
  },
  {
    semana: 2, dia: 2, prioridad: 'ALTA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '📧 Enviar primer email frío personalizado a cada lead',
    descripcion: `Carlos envía email frío personalizado a cada uno de los 10 leads.
No usar plantillas genéricas — cada email adaptado al contexto del lead.
Hacer follow-up a los que no respondan en 48h.`,
    tags: ['semana-2', 'dia-2', 'outreach', 'email-frio'],
  },
  {
    semana: 2, dia: 2, prioridad: 'ALTA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '✍️ Crear primer contenido: blog post o artículo sectorial',
    descripcion: `Enzo crea un blog post o artículo optimizado para SEO.
Tema: relevancia para el sector del cliente, palabras clave en español.
Incluir: meta title, meta description, headings, CTAs.
Coordinar con Marcos para publicar en la web del cliente.`,
    tags: ['semana-2', 'dia-2', 'contenido', 'seo'],
  },
  {
    semana: 2, dia: 3, prioridad: 'ALTA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '🔍 SEO básico: meta tags, keywords, estructura web',
    descripcion: `Enzo revisa/configura SEO técnico de la web del cliente.
- Meta tags (title, description, OG tags)
- Keywords en español para el sector
- Estructura de URLs amigable
- Sitemap básico
Coordinar con Marcos para implementar cambios técnicos.`,
    tags: ['semana-2', 'dia-3', 'seo', 'web'],
  },
  {
    semana: 2, dia: 3, prioridad: 'MEDIA',
    agente: 'laura', tipo: 'SUPPORT',
    titulo: '📬 Configurar inbox de soporte y respuestas automáticas',
    descripcion: `Laura configura la bandeja de entrada de soporte del cliente.
Respuestas automáticas para: consulta recibida, fuera de horario, vacaciones.
Plantillas de respuesta para las 5 dudas más frecuentes del sector.`,
    tags: ['semana-2', 'dia-3', 'soporte', 'automatizacion'],
  },
  {
    semana: 2, dia: 4, prioridad: 'CRITICA',
    agente: 'diana', tipo: 'DATA',
    titulo: '📊 Análisis competitivo: 3-5 competidores directos',
    descripcion: `Diana hace un análisis profundo de 3-5 competidores del cliente.
Para cada uno: propuesta de valor, precio, canales, puntos fuertes/débiles.
Generar reporte con fortalezas y debilidades.
Presentar a Paco para ajustar estrategia.`,
    tags: ['semana-2', 'dia-4', 'competencia', 'research'],
  },
  {
    semana: 2, dia: 5, prioridad: 'MEDIA',
    agente: 'elena', tipo: 'RESEARCH',
    titulo: '⚙️ Mapear procesos del cliente para automatización',
    descripcion: `Elena identifica 3-5 procesos del cliente que se pueden automatizar.
Ejemplos: respuesta a consultas frecuentes, alta de leads, seguimientos.
Presentar opciones priorizadas por impacto/facilidad.`,
    tags: ['semana-2', 'dia-5', 'automatizacion', 'procesos'],
  },
  {
    semana: 2, dia: 6, prioridad: 'ALTA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '📊 Seguimiento de outreach: responder a los leads activos',
    descripcion: `Carlos hace seguimiento de los leads contactados.
Responder a las respuestas recibidas con información adicional.
Registrar estado de cada lead en el sistema.`,
    tags: ['semana-2', 'dia-6', 'outreach', 'seguimiento'],
  },
  {
    semana: 2, dia: 7, prioridad: 'ALTA',
    agente: 'paco', tipo: 'CEO',
    titulo: '📅 Resumen semana 2 + informe de leads',
    descripcion: `Paco envía resumen de la semana 2:
- Leads contactados y estados
- Contenido publicado
- Análisis competitivo
- Próximos pasos para semana 3`,
    tags: ['semana-2', 'dia-7', 'resumen', 'cliente'],
  },

  // ═══════════════════════════════════════
  // SEMANA 3 — EQUIPO COMPLETO ACTIVO
  // ═══════════════════════════════════════
  {
    semana: 3, dia: 1, prioridad: 'CRITICA',
    agente: 'elena', tipo: 'RESEARCH',
    titulo: '🤖 Implementar primera automatización de proceso',
    descripcion: `Elena implementa la automatización de mayor impacto identificada.
Ejemplo: email automático de bienvenida a nuevos leads, recordatorios, follow-ups.
Coordinar con Carlos para integrarlo en su flujo de ventas.`,
    tags: ['semana-3', 'dia-1', 'automatizacion', 'proceso'],
  },
  {
    semana: 3, dia: 2, prioridad: 'ALTA',
    agente: 'marcos', tipo: 'ENGINEERING',
    titulo: '🚀 Implementar features solicitadas por early adopters',
    descripcion: `Marcos implementa las 2-3 features prioritarias identificadas en feedback.
Si no hay feedback aún: mejorar rendimiento, UX del MVP existente.
Notificar a Valeria para QA antes de delivery.`,
    tags: ['semana-3', 'dia-2', 'desarrollo', 'features'],
  },
  {
    semana: 3, dia: 2, prioridad: 'ALTA',
    agente: 'laura', tipo: 'SUPPORT',
    titulo: '📋 Recopilar y clasificar feedback de primeras semanas',
    descripcion: `Laura revisa todos los feedbacks recibidos de clientes/usuarios.
Clasificar por: bug, feature request, mejora UX, contenido.
Presentar a Paco con priorización clara.`,
    tags: ['semana-3', 'dia-2', 'feedback', 'soporte'],
  },
  {
    semana: 3, dia: 3, prioridad: 'CRITICA',
    agente: 'diana', tipo: 'DATA',
    titulo: '📈 Primer reporte de métricas: retención y uso',
    descripcion: `Diana genera el primer reporte de métricas real del cliente:
- Tasa de retención
- Conversaciones por usuario
- Drop-off points
- Leads generados por canal
Presentar a Paco para ajustar estrategia de la semana 4.`,
    tags: ['semana-3', 'dia-3', 'metrics', 'reporte'],
  },
  {
    semana: 3, dia: 4, prioridad: 'MEDIA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '📧 Outreach de segunda ronda: 10 leads adicionales',
    descripcion: `Carlos identifica y contacta 10 leads nuevos si los primeros no responden.
Priorizar leads con mayor probabilidad de conversión.
Escalar outreach si hay respuesta positiva de los primeros.`,
    tags: ['semana-3', 'dia-4', 'outreach', 'leads'],
  },
  {
    semana: 3, dia: 5, prioridad: 'ALTA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '📱 Primera acción en redes sociales del cliente',
    descripcion: `Enzo publica primer contenido en RRSS del cliente (LinkedIn, Instagram, etc.).
Coordinar timing con Carlos para máximo alcance.
Medir engagement inicial y ajustar estrategia.`,
    tags: ['semana-3', 'dia-5', 'social-media', 'contenido'],
  },
  {
    semana: 3, dia: 6, prioridad: 'MEDIA',
    agente: 'valeria', tipo: 'SUPPORT',
    titulo: '✅ QA de todas las automatizaciones implementadas',
    descripcion: `Valeria revisa que todas las automatizaciones funcionan correctamente.
- Emails se envían correctamente
- No hay bucles infinitos
- Los triggers son los correctos
Reportar errores a Elena o Carlos según corresponda.`,
    tags: ['semana-3', 'dia-6', 'qa', 'automatizacion'],
  },
  {
    semana: 3, dia: 7, prioridad: 'ALTA',
    agente: 'paco', tipo: 'CEO',
    titulo: '📅 Resumen semana 3 + informe de métricas',
    descripcion: `Paco envía resumen de la semana 3:
- Métricas de uso y retención
- Feedback clasificado
- Features implementadas
- Propuesta de plan para semana 4`,
    tags: ['semana-3', 'dia-7', 'resumen', 'cliente'],
  },

  // ═══════════════════════════════════════
  // SEMANA 4 — GROWTH + OPTIMIZACIÓN
  // ═══════════════════════════════════════
  {
    semana: 4, dia: 1, prioridad: 'CRITICA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '📢 Testear canal de adquisición: LinkedIn o email',
    descripcion: `Enzo testa 1-2 canales de adquisición para el cliente.
Opción A: LinkedIn — contenido orgánico + networking.
Opción B: Email marketing — newsletter o secuencias.
Medir resultados y presentar a Paco qué canal funciona mejor.`,
    tags: ['semana-4', 'dia-1', 'growth', 'adquisicion'],
  },
  {
    semana: 4, dia: 2, prioridad: 'CRITICA',
    agente: 'carlos', tipo: 'SALES',
    titulo: '🎯 Escalar outreach si hay respuesta positiva',
    descripcion: `Si los emails fríos tienen respuesta >5%:
- Carlos escala outreach a 20-30 leads adicionales.
- Personalizar secuencias de follow-up.
Si no hay respuesta: pivota a otro canal (recomendar por Enzo).`,
    tags: ['semana-4', 'dia-2', 'outreach', 'leads'],
  },
  {
    semana: 4, dia: 3, prioridad: 'ALTA',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '📧 Primera campaign de email o contenido',
    descripcion: `Enzo lanza primera campaign de contenido:
- Email newsletter a lista de leads, o
- Artículo viral en blog/RRSS.
Medir CTR, conversiones, engagement.`,
    tags: ['semana-4', 'dia-3', 'marketing', 'campaign'],
  },
  {
    semana: 4, dia: 3, prioridad: 'ALTA',
    agente: 'marcos', tipo: 'ENGINEERING',
    titulo: '🔧 Implementar top 2 features del feedback',
    descripcion: `Marcos implementa las 2 features con mayor demanda del feedback.
Priorizar las que tienen mayor impacto en conversión/retención.
 QA con Valeria antes de delivery al cliente.`,
    tags: ['semana-4', 'dia-3', 'desarrollo', 'features'],
  },
  {
    semana: 4, dia: 4, prioridad: 'MEDIA',
    agente: 'diana', tipo: 'DATA',
    titulo: '📊 Análisis de canal de adquisición con mejores resultados',
    descripcion: `Diana analiza qué canal de adquisición funciona mejor para el cliente.
Presentar: coste por lead, conversión por canal, ROI estimado.
Decisión: ¿en qué canal invertir más?`,
    tags: ['semana-4', 'dia-4', 'metrics', 'adquisicion'],
  },
  {
    semana: 4, dia: 5, prioridad: 'MEDIA',
    agente: 'elena', tipo: 'RESEARCH',
    titulo: '💰 Evaluar si procede campaign de Meta Ads o LinkedIn Ads',
    descripcion: `Elena evalúa si una campaign de pago tiene sentido para el cliente.
Criterios: presupuesto disponible, target en RRSS, capacidad de conversión.
Si procede: propuesta de campaign pequeño (€10-20/día) para test.`,
    tags: ['semana-4', 'dia-5', 'ads', 'evaluacion'],
  },
  {
    semana: 4, dia: 6, prioridad: 'MEDIA',
    agente: 'laura', tipo: 'SUPPORT',
    titulo: '📬 Revisión de satisfacción del cliente mes 1',
    descripcion: `Laura envía survey de satisfacción al cliente.
Preguntar: qué ha funcionado, qué no, qué quiere para el mes 2.
Presentar resultados a Paco para planificar siguiente mes.`,
    tags: ['semana-4', 'dia-6', 'soporte', 'feedback'],
  },
  {
    semana: 4, dia: 7, prioridad: 'CRITICA',
    agente: 'paco', tipo: 'CEO',
    titulo: '🎉 Resumen mes 1 + plan mes 2',
    descripcion: `Paco envía al cliente el resumen completo del primer mes:
- Qué se ha logrado
- Métricas finales
- Lecciones aprendidas
- Plan para el mes 2 con nuevas prioridades
Preguntar si quiere escalar, ajustar o mantener.`,
    tags: ['semana-4', 'dia-7', 'resumen', 'cliente', 'mes-completo'],
  },

  // ═══════════════════════════════════════
  // RECURRENTES — POST MES 1 (se mantienen siempre)
  // ═══════════════════════════════════════
  {
    semana: 0, dia: 0, prioridad: 'ALTA', recurrente: 'diario',
    agente: 'laura', tipo: 'SUPPORT',
    titulo: '📬 Atender emails de soporte entrantes',
    descripcion: `Laura revisa y responde emails de soporte del cliente.
Clasificar por urgencia: urgente (responder hoy), normal (24h), info (48h).
Escalar a Carlos o Elena si es comercial o operacional.`,
    tags: ['recurrente', 'diario', 'soporte'],
  },
  {
    semana: 0, dia: 0, prioridad: 'ALTA', recurrente: 'diario',
    agente: 'carlos', tipo: 'SALES',
    titulo: '🎯 Outreach: buscar 1 lead nuevo de calidad',
    descripcion: `Carlos identifica y contacta al menos 1 lead nuevo cada día.
Investigar empresa, personalizar mensaje, registrar en sistema.
Seguimiento de los leads de días anteriores.`,
    tags: ['recurrente', 'diario', 'ventas', 'leads'],
  },
  {
    semana: 0, dia: 0, prioridad: 'MEDIA', recurrente: '3x-semana',
    agente: 'enzo', tipo: 'MARKETING',
    titulo: '✍️ Crear y publicar contenido (RRSS o blog)',
    descripcion: `Enzo crea y publica contenido 3 veces por semana.
Pueden ser: posts de LinkedIn, tweets, artículos de blog, newsletters.
Medir engagement y ajustar tipo de contenido según resultados.`,
    tags: ['recurrente', '3x-semana', 'contenido', 'marketing'],
  },
  {
    semana: 0, dia: 0, prioridad: 'MEDIA', recurrente: 'semanal',
    agente: 'diana', tipo: 'DATA',
    titulo: '📊 Generar reporte semanal de métricas',
    descripcion: `Diana genera reporte semanal con:
- Actividad de la semana (contenido, outreach, soporte)
- Métricas de uso y engagement
- Tendencias vs semana anterior
- Recomendaciones para la siguiente semana`,
    tags: ['recurrente', 'semanal', 'metrics', 'reporte'],
  },
  {
    semana: 0, dia: 0, prioridad: 'MEDIA', recurrente: 'semanal',
    agente: 'elena', tipo: 'RESEARCH',
    titulo: '⚙️ Revisar y optimizar automatizaciones',
    descripcion: `Elena revisa las automatizaciones activas:
- ¿Siguen funcionando correctamente?
- ¿Algún leads que se ha caído del funnel?
- ¿Nueva automatización que se puede añadir?
Presentar mejoras a Paco para aprobación.`,
    tags: ['recurrente', 'semanal', 'automatizacion', 'optimizacion'],
  },
  {
    semana: 0, dia: 0, prioridad: 'MEDIA', recurrente: 'semanal',
    agente: 'valeria', tipo: 'SUPPORT',
    titulo: '🔍 Auditoría de calidad: revisar outputs de agentes',
    descripcion: `Valeria hace auditoría semanal de outputs:
- ¿Los emails de Carlos son profesionales?
- ¿El contenido de Enzo está alineado con el brand voice?
- ¿Las respuestas de Laura son correctas?
Reportar a cada agente con feedback de mejora.`,
    tags: ['recurrente', 'semanal', 'qa', 'auditoria'],
  },
  {
    semana: 0, dia: 0, prioridad: 'BAJA', recurrente: 'semanal',
    agente: 'paco', tipo: 'CEO',
    titulo: '📅 Briefing diario: resumir el día al cliente',
    descripcion: `Paco envía al cliente un resumen cada mañana:
- Qué se ha hecho el día anterior
- Qué se va a hacer hoy
- Si necesita alguna decisión o input del cliente
Mantener al cliente informado sin saturar.`,
    tags: ['recurrente', 'diario', 'briefing', 'cliente'],
  },
];

// ──────────────────────────────────────────
// MAPA de agentes — nombre → DB id del agente
// ──────────────────────────────────────────
async function getAgenteId(pool, clienteId, nombre) {
  const res = await pool.query(
    `SELECT id FROM "Agente" WHERE "clienteId" = $1 AND LOWER("nombre") = LOWER($2) LIMIT 1`,
    [clienteId, nombre]
  );
  if (res.rows.length === 0) {
    // fallback: buscar por nombre parcial
    const res2 = await pool.query(
      `SELECT id FROM "Agente" WHERE "clienteId" = $1 AND LOWER("nombre") LIKE LOWER($2) LIMIT 1`,
      [clienteId, `%${nombre}%`]
    );
    if (res2.rows.length === 0) return null;
    return res2.rows[0].id;
  }
  return res.rows[0].id;
}

async function seed(clienteId) {
  console.log(`🌱 Seed plan 30 días para cliente: ${clienteId}`);

  for (const item of PLAN_30_DIAS) {
    const agenteId = await getAgenteId(pool, clienteId, item.agente);
    if (!agenteId) {
      console.log(`  ⚠️ Agente "${item.agente}" no encontrado para cliente, saltando tarea: "${item.titulo}"`);
      continue;
    }

    const esRecurrente = item.recurrente || false;

    const now = new Date().toISOString();
    await pool.query(
      `INSERT INTO "Trabajo"
        (id, "clienteId", "agenteId", titulo, descripcion, estado, prioridad, tags, "inputData", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'TODO', $5, $6, $7, $8, $8)
       ON CONFLICT DO NOTHING`,
      [
        clienteId,
        agenteId,
        item.titulo,
        item.descripcion,
        item.prioridad,
        item.tags,
        { semana: item.semana, dia: item.dia, recurrente: esRecurrente },
        now,
      ]
    );
    console.log(`  ✅ ${item.semana > 0 ? `S${item.semana}D${item.dia}` : 'REC'} | ${item.agente}: ${item.titulo.substring(0, 60)}`);
  }

  console.log('\n✅ Seed completo!');
}

// ──────────────────────────────────────────
// CLI
// ──────────────────────────────────────────
if (require.main === module) {
  const clienteId = process.argv[2];
  if (!clienteId) {
    console.error('Uso: node scripts/seed-plan-30dias.js <clienteId>');
    process.exit(1);
  }
  seed(clienteId)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
