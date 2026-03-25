/**
 * agentLoader.js - Gestor centralizado de agentes
 *
 * Carga, valida y proporciona acceso a todos los agentes del sistema.
 * También gestiona la memoria distribuida (aprendizajes por agente).
 */

const fs = require('fs');
const path = require('path');

// Rutas
const AGENTS_PATH = path.join(__dirname, '../../agents');
const MYCOMPI_PATH = path.join(__dirname, '../../..');

// Agentes disponibles (directorios)
const AGENTS = {
  // Agentes operativos (con overlay por cliente)
  luna: { path: 'atencion-cliente', nombre: 'Laura Montes', inicial: 'L', color: 'from-pink-500 to-rose-600', tipo: 'operativo' },
  enzo: { path: 'marketing', nombre: 'Enzo Herrera', inicial: 'E', color: 'from-blue-500 to-indigo-600', tipo: 'operativo' },
  carlos: { path: 'ventas', nombre: 'Carlos Mendoza', inicial: 'C', color: 'from-green-500 to-emerald-600', tipo: 'operativo' },
  elena: { path: 'operaciones', nombre: 'Elena Ortega', inicial: 'E', color: 'from-orange-500 to-amber-600', tipo: 'operativo' },
  diana: { path: 'data', nombre: 'Diana Palau', inicial: 'D', color: 'from-purple-500 to-violet-600', tipo: 'operativo' },
  // Agentes internos (sin overlay - uso interno MyCompi)
  marcos: { path: 'marcos-desarrollo', nombre: 'Marcos Fernández', inicial: 'M', color: 'from-cyan-500 to-teal-600', tipo: 'operativo' },
  policia: { path: 'policia-tokens', nombre: 'Policia de Tokens', inicial: 'PT', color: 'from-red-500 to-orange-600', tipo: 'interno' },
  orquesta: { path: 'orquestador', nombre: 'Orquestador', inicial: 'O', color: 'from-indigo-500 to-purple-600', tipo: 'interno' },
};

/**
 * Obtiene la lista de agentes disponibles
 */
function listarAgentes() {
  return Object.entries(AGENTS).map(([key, config]) => ({
    id: key,
    nombre: config.nombre,
    inicial: config.inicial,
    color: config.color,
    tipo: config.tipo || 'operativo',
    activo: esAgenteActivo(key),
  }));
}

/**
 * Verifica si un agente tiene todos sus archivos necesarios
 */
function esAgenteActivo(agenteId) {
  const config = AGENTS[agenteId];
  if (!config) return false;

  const agentPath = path.join(AGENTS_PATH, config.path);
  const required = ['SOUL.md', 'IDENTITY.md'];

  return required.every(file =>
    fs.existsSync(path.join(agentPath, file))
  );
}

/**
 * Obtiene la ruta del overlay de un cliente para un agente
 */
function getOverlayPath(agenteId, clienteId) {
  const config = AGENTS[agenteId];
  if (!config) return null;
  return path.join(AGENTS_PATH, config.path, 'overlays', clienteId);
}

/**
 * Obtiene el contexto completo de un agente para un cliente específico
 * (Core Común + Overlay del cliente)
 * @param {string} agenteId
 * @param {string} clienteId
 * @param {Object} opts — { plan, includeTools }
 */
function buildContext(agenteId, clienteId, opts = {}) {
  const { plan = 'BASICO', includeTools = true } = opts
  const config = AGENTS[agenteId];
  if (!config) throw new Error(`Agente ${agenteId} no encontrado`);

  const agentPath = path.join(AGENTS_PATH, config.path);

  // Cargar archivos del Core
  const core = {
    soul: fs.existsSync(path.join(agentPath, 'SOUL.md'))
      ? fs.readFileSync(path.join(agentPath, 'SOUL.md'), 'utf8')
      : '',
    identity: fs.existsSync(path.join(agentPath, 'IDENTITY.md'))
      ? fs.readFileSync(path.join(agentPath, 'IDENTITY.md'), 'utf8')
      : '',
    skill: fs.existsSync(path.join(agentPath, 'SKILL.md'))
      ? fs.readFileSync(path.join(agentPath, 'SKILL.md'), 'utf8')
      : '',
    memory: fs.existsSync(path.join(agentPath, 'MEMORY.md'))
      ? fs.readFileSync(path.join(agentPath, 'MEMORY.md'), 'utf8')
      : '',
  };

  // Cargar overlay del cliente
  const overlayPath = path.join(agentPath, 'overlays', clienteId);
  let overlay = { user: '', memoria: [] };

  if (fs.existsSync(overlayPath)) {
    if (fs.existsSync(path.join(overlayPath, 'USER.md'))) {
      overlay.user = fs.readFileSync(path.join(overlayPath, 'USER.md'), 'utf8');
    }

    const memoriaPath = path.join(overlayPath, 'memoria');
    if (fs.existsSync(memoriaPath)) {
      overlay.memoria = fs.readdirSync(memoriaPath)
        .filter(f => f.endsWith('.md'))
        .map(f => fs.readFileSync(path.join(memoriaPath, f), 'utf8'));
    }
  }

  // Ensamblar contexto
  return `
${core.soul}

---

## TU IDENTIDAD
${core.identity}

---

## TUS CAPACIDADES
${core.skill}

---

## MEMORIA ACUMULADA
${core.memory}

${buildMemoryContext(agenteId)}

---

## CONTEXTO DEL CLIENTE ACTUAL
${overlay.user}

---

## HISTORIAL CON ESTE CLIENTE
${overlay.memoria.join('\n\n---\n\n')}

${includeTools ? buildToolsContext(plan) : ''}
`.trim();
}

/**
 * Registra una interacción en la memoria del cliente
 */
function logInteraction(agenteId, clienteId, interaction) {
  const overlayPath = getOverlayPath(agenteId, clienteId);
  if (!overlayPath) return;

  const memoriaPath = path.join(overlayPath, 'memoria');
  if (!fs.existsSync(memoriaPath)) {
    fs.mkdirSync(memoriaPath, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(memoriaPath, `${today}.md`);

  const entry = `
### Interacción ${new Date().toISOString()}
${interaction}
`;

  fs.appendFileSync(logFile, entry);
}

/**
 * Obtiene información de un agente específico
 */
function getAgenteInfo(agenteId) {
  const config = AGENTS[agenteId];
  if (!config) return null;

  const agentPath = path.join(AGENTS_PATH, config.path);

  return {
    id: agenteId,
    nombre: config.nombre,
    inicial: config.inicial,
    color: config.color,
    path: config.path,
    activo: esAgenteActivo(agenteId),
    archivos: fs.existsSync(agentPath)
      ? fs.readdirSync(agentPath)
      : [],
  };
}

// =============================================
// MEMORIA DISTRIBUIDA — Aprendizajes por agente
// =============================================

/**
 * Obtiene la ruta de la carpeta de memoria de un agente
 */
function getAgentMemoryPath(agenteId) {
  const config = AGENTS[agenteId];
  if (!config) return null;
  return path.join(AGENTS_PATH, config.path, 'memory');
}

/**
 * Guarda un aprendizaje para un agente específico
 * @param {string} agenteId - ID del agente (luna, enzo, carlos, etc.)
 * @param {Object} aprendizaje - { titulo, contenido, tags }
 */
function guardarAprendizaje(agenteId, aprendizaje) {
  const memoryPath = getAgentMemoryPath(agenteId);
  if (!memoryPath) return false;

  if (!fs.existsSync(memoryPath)) {
    fs.mkdirSync(memoryPath, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const filename = `${today}.md`;
  const filepath = path.join(memoryPath, filename);

  const entry = `
## ${aprendizaje.titulo || 'Aprendizaje sin título'}
**Fecha:** ${new Date().toISOString()}
**Tags:** ${(aprendizaje.tags || []).join(', ') || 'sin tags'}

${aprendizaje.contenido}

---
`;

  // Si el archivo de hoy ya existe, añadir al final
  if (fs.existsSync(filepath)) {
    fs.appendFileSync(filepath, entry);
  } else {
    // Crear con header
    const header = `# Memoria Diaria — ${today}\n\n`;
    fs.writeFileSync(filepath, header + entry);
  }

  return true;
}

/**
 * Obtiene todos los aprendizajes de un agente
 * @param {string} agenteId
 * @param {number} dias - cuántos días hacia atrás leer (default 7)
 */
function obtenerAprendizados(agenteId, dias = 7) {
  const memoryPath = getAgentMemoryPath(agenteId);
  if (!memoryPath || !fs.existsSync(memoryPath)) return [];

  const cutoff = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  const files = fs.readdirSync(memoryPath)
    .filter(f => f.endsWith('.md'))
    .filter(f => {
      const stats = fs.statSync(path.join(memoryPath, f));
      return stats.mtime >= cutoff;
    })
    .sort()
    .reverse();

  return files.map(f => ({
    fecha: f.replace('.md', ''),
    contenido: fs.readFileSync(path.join(memoryPath, f), 'utf8'),
  }));
}

/**
 * Obtiene aprendizajes COMUNES (compartidos entre todos los agentes)
 * Leídos desde mycompi/memory/aprendizajes-compartidos.md
 */
function obtenerAprendizadosCompartidos() {
  const sharedPath = path.join(MYCOMPI_PATH, 'memory', 'aprendizajes-compartidos.md');
  if (!fs.existsSync(sharedPath)) return '';
  return fs.readFileSync(sharedPath, 'utf8');
}

/**
 * Guarda un aprendizaje compartido (apuntes que todos los agentes deben conocer)
 */
function guardarAprendidoCompartido(aprendizaje) {
  const sharedDir = path.join(MYCOMPI_PATH, 'memory');
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  const filepath = path.join(sharedDir, 'aprendizajes-compartidos.md');
  const entry = `

## ${aprendizaje.titulo}
**Fecha:** ${new Date().toISOString()}
**Autor:** ${aprendizaje.autor || 'Sistema'}
**Tags:** ${(aprendizaje.tags || []).join(', ')}

${aprendizaje.contenido}
`;

  fs.appendFileSync(filepath, entry);
  return true;
}

/**
 * Construye la sección de herramientas disponibles para el contexto del agente.
 * Muestra las tools que el agente puede invocar via la API.
 */
function buildToolsContext(plan) {
  // Lazy load para evitar circular require
  const { getToolsDisponibles } = require('./toolRegistry')
  const tools = getToolsDisponibles(plan)

  if (!tools.length) return ''

  const lines = ['\n\n---\n\n## 🛠️ HERRAMIENTAS DISPONIBLES\n']
  lines.push(`**Plan actual:** ${plan}`)
  lines.push('Usa estas herramientas cuando necesites ejecutar acciones reales. ')
  lines.push('Para invocar una tool, incluye en tu respuesta el bloque JSON siguiente:\n')
  lines.push('```json\n{ "tool": "nombre_de_tool", "params": { ... } }\n```\n')
  lines.push('**Tools disponibles:**\n')

  tools.forEach(t => {
    lines.push(`\n### ${t.nombre} \`${t.id}\``)
    lines.push(t.descripcion)
    if (t.args?.properties) {
      const required = t.args.required || []
      lines.push('\nArgumentos:')
      Object.entries(t.args.properties).forEach(([key, prop]) => {
        const req = required.includes(key) ? '**(requerido)**' : '(opcional)'
        const def = prop.default ? ` [default: ${prop.default}]` : ''
        const max = prop.maxLength ? ` [max: ${prop.maxLength}]` : ''
        lines.push(`  - \`${key}\`: ${prop.description} ${req}${def}${max}`)
      })
    }
  })

  lines.push('\n**Ejemplo de uso:**')
  lines.push('```json\n{ "tool": "send_email", "params": { "para": "cliente@email.com", "asunto": "Bienvenida", "html": "<h1>Hola</h1>" } }\n```')
  lines.push('\nSolo invoca UNA tool por respuesta. El resultado te llegará en el siguiente mensaje.')

  return lines.join('\n')
}

/**
 * Construye el texto de memoria para inyectar en el prompt de un agente.
 * Llamar antes de cada tarea para que el agente tenga contexto de aprendizajes previos.
 */
function buildMemoryContext(agenteId) {
  const personales = obtenerAprendizados(agenteId, 7);
  const comunes = obtenerAprendizadosCompartidos();

  let ctx = '';

  if (personales.length > 0) {
    ctx += `\n\n## TUS APRENDIZAJES RECIENTES (últimos 7 días)\n`;
    personales.forEach(a => {
      ctx += `\n### ${a.fecha}\n${a.contenido}\n`;
    });
  }

  if (comunes) {
    ctx += `\n\n## APRENDIZAJES COMPARTIDOS DEL EQUIPO\n${comunes}\n`;
  }

  return ctx;
}

module.exports = {
  AGENTS,
  listarAgentes,
  esAgenteActivo,
  getOverlayPath,
  buildContext,
  logInteraction,
  getAgenteInfo,
  // Memoria distribuida
  guardarAprendizaje,
  obtenerAprendizados,
  obtenerAprendizadosCompartidos,
  guardarAprendidoCompartido,
  buildMemoryContext,
  // Tools
  buildToolsContext,
};
