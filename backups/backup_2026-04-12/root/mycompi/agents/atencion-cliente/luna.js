/**
 * luna.js — Integration layer para Agente Luna
 * 
 * Este módulo conecta el Core Común (SOUL, IDENTITY, SKILL, MEMORY)
 * con el contexto del cliente (overlay) y expone métodos para
 * interactuar con la API MyCompi existente.
 */

const fs = require('fs');
const path = require('path');

// Rutas del agente
const AGENT_PATH = path.join(__dirname);
const OVERLAYS_PATH = path.join(AGENT_PATH, 'overlays');

// Cargo archivos del Core Común
function loadCore() {
  return {
    soul: fs.readFileSync(path.join(AGENT_PATH, 'SOUL.md'), 'utf8'),
    identity: fs.readFileSync(path.join(AGENT_PATH, 'IDENTITY.md'), 'utf8'),
    skill: fs.readFileSync(path.join(AGENT_PATH, 'SKILL.md'), 'utf8'),
    memory: fs.readFileSync(path.join(AGENT_PATH, 'MEMORY.md'), 'utf8'),
  };
}

// Cargo overlay de un cliente específico
function loadOverlay(clientId) {
  const clientPath = path.join(OVERLAYS_PATH, clientId);
  
  if (!fs.existsSync(clientPath)) {
    throw new Error(`Cliente ${clientId} no encontrado`);
  }
  
  return {
    user: fs.readFileSync(path.join(clientPath, 'USER.md'), 'utf8'),
    memoriaPath: path.join(clientPath, 'memoria'),
    memoriaFiles: fs.existsSync(path.join(clientPath, 'memoria'))
      ? fs.readdirSync(path.join(clientPath, 'memoria')).map(f => 
          fs.readFileSync(path.join(clientPath, 'memoria', f), 'utf8')
        )
      : [],
  };
}

// Construyo el "contexto completo" que recibe el modelo
function buildContext(clientId) {
  const core = loadCore();
  const overlay = loadOverlay(clientId);
  
  return `
${core.soul}

---

## TU IDENTIDAD (no cambiar)
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
${overlay.memoriaFiles.join('\n\n---\n\n')}
`;
}

// Guardo interacción en memoria del cliente
function logInteraction(clientId, interaction) {
  const overlay = loadOverlay(clientId);
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(overlay.memoriaPath, `${today}.md`);
  
  const entry = `
### Interacción ${new Date().toISOString()}
${interaction}
`;
  
  fs.appendFileSync(logFile, entry);
}

module.exports = {
  loadCore,
  loadOverlay,
  buildContext,
  logInteraction,
};
