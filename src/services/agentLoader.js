/**
 * agentLoader.js — Gestor centralizado de agentes
 * 
 * Carga, valida y proporciona acceso a todos los agentes del sistema
 */

const fs = require('fs');
const path = require('path');

// Rutas
const AGENTS_PATH = path.join(__dirname, '../../agents');

// Agentes disponibles (directorios)
const AGENTS = {
  luna: { path: 'atencion-cliente', nombre: 'Luna', emoji: '🌙' },
  marcos: { path: 'marketing', nombre: 'Marcos', emoji: '📊' },
  carlos: { path: 'ventas', nombre: 'Carlos', emoji: '💼' },
  elena: { path: 'operaciones', nombre: 'Elena', emoji: '⚙️' },
  diana: { path: 'data', nombre: 'Diana', emoji: '📈' },
};

/**
 * Obtiene la lista de agentes disponibles
 */
function listarAgentes() {
  return Object.entries(AGENTS).map(([key, config]) => ({
    id: key,
    nombre: config.nombre,
    emoji: config.emoji,
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
 */
function buildContext(agenteId, clienteId) {
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

---

## CONTEXTO DEL CLIENTE ACTUAL
${overlay.user}

---

## HISTORIAL CON ESTE CLIENTE
${overlay.memoria.join('\n\n---\n\n')}
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
    emoji: config.emoji,
    path: config.path,
    activo: esAgenteActivo(agenteId),
    archivos: fs.existsSync(agentPath)
      ? fs.readdirSync(agentPath)
      : [],
  };
}

module.exports = {
  AGENTS,
  listarAgentes,
  esAgenteActivo,
  getOverlayPath,
  buildContext,
  logInteraction,
  getAgenteInfo,
};
