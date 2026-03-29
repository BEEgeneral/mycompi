/**
 * tareas.js — Plantillas de tareas de onboarding y recurrentes diarias
 *
 * 5 tareas de onboarding (secuenciales)
 * 3 tareas diarias por cada uno de los 6 agentes
 */

// ─────────────────────────────────────────
// 5 TAREAS DE ONBOARDING (secuenciales)
// Se ejecutan en orden, una después de la anterior
// ─────────────────────────────────────────
const TAREA_ONBOARDING = [
  {
    titulo: '🎯 Configura tu perfil de empresa',
    descripcion: 'Completa los datos de tu empresa: nombre, sector, web, descripción de tu negocio. Esto permite a todos los agentes trabajar de forma más efectiva.',
    prioridad: 'ALTA',
    tags: ['onboarding'],
    orden: 1,
    inputData: { orden: 1 },
  },
  {
    titulo: '🔍 Investigamos tu empresa y sector',
    descripcion: 'Estamos investigando automáticamente tu empresa, competencia y mercado para preparar las mejores tareas para ti.',
    prioridad: 'ALTA',
    tags: ['onboarding', 'research'],
    orden: 2,
    inputData: { orden: 2 },
  },
  {
    titulo: '📝 Primeros contenidos para tu negocio',
    descripcion: 'Enzo crea los primeros contenidos: propuesta de valor, textos para web, o una primera campaña de email marketing.',
    prioridad: 'MEDIA',
    tags: ['onboarding', 'marketing'],
    orden: 3,
    inputData: { orden: 3 },
  },
  {
    titulo: '📋 Primera estrategia de captación',
    descripcion: 'Carlos prepara un plan de captación de leads: a quién abordar, cómo, y un primer outreach.',
    prioridad: 'MEDIA',
    tags: ['onboarding', 'ventas'],
    orden: 4,
    inputData: { orden: 4 },
  },
  {
    titulo: '📊 Briefing completo y plan de acción',
    descripcion: 'Paco resume todo lo hecho, presenta el equipo y propone el primer plan de acción conjunto.',
    prioridad: 'ALTA',
    tags: ['onboarding', 'resumen'],
    orden: 5,
    inputData: { orden: 5 },
  },
];

// ─────────────────────────────────────────
// 3 TAREAS DIARIAS POR AGENTE
// Cada día se crean estas tareas para cada cliente activo
// ─────────────────────────────────────────
const TAREAS_POR_AGENTE = {
  laura: [
    {
      titulo: '💬 Revisar bandeja de entrada de atención al cliente',
      descripcion: 'Revisa los emails y mensajes de soporte recibidos. Clasifica por urgencia y responde lo que puedas automáticamente.',
      prioridad: 'ALTA',
      tags: ['recurrente_diaria', 'atencion_cliente'],
    },
    {
      titulo: '📋 Actualizar FAQs con preguntas frecuentes',
      descripcion: 'Revisa las últimas interacciones. Si hay preguntas nuevas frecuentes, añade respuestas a la base de conocimiento.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'atencion_cliente'],
    },
    {
      titulo: '🤖 Identificar oportunidades de automatización en soporte',
      descripcion: 'Analiza qué preguntas de soporte se repiten. Propón a Paco qué podría automatizarse con un chatbot o respuesta predefinida.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'atencion_cliente'],
    },
  ],

  enzo: [
    {
      titulo: '📰 Crear contenido del día para redes sociales',
      descripcion: 'Genera un post para LinkedIn o Twitter sobre un tema relevante del sector del cliente. Incluye hashtag si aplica.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'marketing'],
    },
    {
      titulo: '📧 Revisar y optimizar campañas de email activas',
      descripcion: 'Revisa métricas de emails enviados: tasas de apertura, click, respuesta. Ajusta asunto, horarios o contenido si hay datos.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'marketing'],
    },
    {
      titulo: '🔍 Analizar qué está haciendo la competencia',
      descripcion: 'Busca 1-2 acciones de competidores (nuevo contenido, kampanya, kampanya). Resume en 3 bullets para el cliente.',
      prioridad: 'BAJA',
      tags: ['recurrente_diaria', 'marketing'],
    },
  ],

  carlos: [
    {
      titulo: '📬 Revisar y responder leads en pipeline',
      descripcion: 'Revisa los leads nuevos de la semana. Clasifica por interés y probabilidad. Responde a los que necesiten follow-up.',
      prioridad: 'ALTA',
      tags: ['recurrente_diaria', 'ventas'],
    },
    {
      titulo: '🔎 Buscar 3 nuevos leads potenciales',
      descripcion: 'Identifica 3 empresas o perfiles que encajen como clientes ideales. Investiga brevemente (sector, tamaño, web).',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'ventas'],
    },
    {
      titulo: '📊 Actualizar pipeline y forecast de ventas',
      descripcion: 'Revisa el estado del pipeline. Actualiza probabilidades de cierre. Si hay deals stalled, propone action.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'ventas'],
    },
  ],

  elena: [
    {
      titulo: '⚙️ Revisar automatizaciones activas',
      descripcion: 'Verifica que los workflows automáticos están funcionando correctamente. Detecta cuellos de botella o errores.',
      prioridad: 'ALTA',
      tags: ['recurrente_diaria', 'operaciones'],
    },
    {
      titulo: '🔗 Revisar integraciones y flujos de datos',
      descripcion: 'Comprueba que la información fluye correctamente entre sistemas: CRM, email, analytics, etc.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'operaciones'],
    },
    {
      titulo: '📝 Proponer 1 nueva automatización',
      descripcion: 'Identifica una tarea repetitiva que el cliente hace manualmente. Describe cómo automatizarla y cuánto tiempo ahorraría.',
      prioridad: 'BAJA',
      tags: ['recurrente_diaria', 'operaciones'],
    },
  ],

  diana: [
    {
      titulo: '📈 Revisar métricas de negocio del día',
      descripcion: 'Extrae las métricas principales: tráfico, leads, ventas, conversiones. Compara con días anteriores.',
      prioridad: 'ALTA',
      tags: ['recurrente_diaria', 'data'],
    },
    {
      titulo: '📊 Generar mini-reporte diario',
      descripcion: 'Crea un reporte de 5 bullets con los datos más importantes del día: qué fue bien, qué no, qué hacer mañana.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'data'],
    },
    {
      titulo: '🔍 Detectar anomalías o trends值得关注',
      descripcion: 'Compara métricas con la semana anterior. Si hay cambios significativos (buenos o malos), alerta a Paco.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'data'],
    },
  ],

  marcos: [
    {
      titulo: '🐛 Revisar errores y incidencias técnicas',
      descripcion: 'Checkea logs de errores, tiempos de carga, broken links. Arregla o reporta lo que encuentres.',
      prioridad: 'ALTA',
      tags: ['recurrente_diaria', 'desarrollo'],
    },
    {
      titulo: '⚡ Proponer 1 mejora técnica',
      descripcion: 'Identifica algo que podría mejorarse técnicamente: velocidad, UX, SEO, seguridad. Describe la mejora y su impacto.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'desarrollo'],
    },
    {
      titulo: '🔒 Revisar estado de seguridad y backups',
      descripcion: 'Verifica que los backups se están haciendo, que no hay alertas de seguridad, que el SSL está vigente.',
      prioridad: 'MEDIA',
      tags: ['recurrente_diaria', 'desarrollo'],
    },
  ],
};

// Agentes en orden para crear tareas
const AGENTES_DIARIOS = ['laura', 'enzo', 'carlos', 'elena', 'diana', 'marcos'];

module.exports = {
  TAREA_ONBOARDING,
  TAREAS_POR_AGENTE,
  AGENTES_DIARIOS,
};
