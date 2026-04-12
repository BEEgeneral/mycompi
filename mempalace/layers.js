/**
 * LAYERS — MyCompi Memory Stack
 * 
 * Implementación del stack L0-L3 de MemPalace adaptado:
 * 
 * L0 (siempre cargado): Quién es el agente, identidad
 * L1 (siempre cargado): Datos críticos del cliente activo
 * L2 (bajo demanda): Actividad reciente del agente en la sesión
 * L3 (bajo demanda): Búsqueda profunda en historial / palace
 * 
 * Esto evita arrastrar contexto irrelevante en cada mensaje.
 */

const fs = require('fs');
const path = require('path');
const { Palace } = require('./palace');

const LAYERS_FILE = '/root/mycompi/shared/layers.json';
const IDENTITY_FILE = '/root/mycompi/shared/identity.json';

// ─── L0: Identity ────────────────────────────────────────────────────────────
const L0_IDENTITY = {
  sistema: 'MyCompi',
  version: '2.0',
  descripcion: 'Sistema de Compis Agénticos — 8 agentes especializados trabajando 24/7',
  agentes: [
    { id: 'paco',   rol: 'Director', emoji: '🎯' },
    { id: 'laura',  rol: 'Customer Success', emoji: '📊' },
    { id: 'enzo',   rol: 'Marketing', emoji: '📣' },
    { id: 'carlos', rol: 'Ventas', emoji: '💰' },
    { id: 'elena',  rol: 'Operaciones', emoji: '⚙️' },
    { id: 'diana',  rol: 'Finanzas', emoji: '📈' },
    { id: 'marcos', rol: 'Producto', emoji: '🔧' },
    { id: 'valeria', rol: 'QA', emoji: '✅' },
  ],
};

// ─── L1: Critical facts (carga siempre) ─────────────────────────────────────
class L1Loader {
  constructor() {
    this.cache = null;
    this.lastLoad = null;
  }

  async load(pg, clienteId = null) {
    // Recarga cada 5 min máximo
    if (this.cache && this.lastLoad && (Date.now() - this.lastLoad) < 300000) {
      return this.cache;
    }

    const facts = { clientes: [], agentes: [], trabajos_stats: {}, timestamp: new Date().toISOString() };

    try {
      const [clientes, agentes, stats] = await Promise.all([
        pg.query('SELECT id, nombre, email, plan, activo FROM "Cliente" WHERE activo = true LIMIT 20'),
        pg.query('SELECT id, nombre, tipo, activo, "ultimoHeartbeat" FROM "Agente" WHERE activo = true LIMIT 20'),
        pg.query(`SELECT 
          count(*) filter (where estado = 'TODO') as todo,
          count(*) filter (where estado = 'IN_PROGRESS') as in_progress,
          count(*) filter (where estado = 'COMPLETED') as completed
          FROM "Trabajo"`),
      ]);

      facts.clientes = clientes.rows.map(c => ({ id: c.id, nombre: c.nombre, plan: c.plan }));
      facts.agentes = agentes.rows.map(a => ({ id: a.id, nombre: a.nombre, tipo: a.tipo }));
      facts.trabajos_stats = {
        todo: parseInt(stats.rows[0]?.todo || 0),
        in_progress: parseInt(stats.rows[0]?.in_progress || 0),
        completed: parseInt(stats.rows[0]?.completed || 0),
      };

      // Si hay cliente específico, cargar sus datos
      if (clienteId) {
        const clienteData = await pg.query(
          'SELECT id, nombre, email, plan, "createdAt" FROM "Cliente" WHERE id = $1',
          [clienteId]
        );
        if (clienteData.rows.length > 0) {
          facts.cliente_activo = clienteData.rows[0];
          
          // Sus trabajos recientes
          const trabajos = await pg.query(
            `SELECT titulo, estado, prioridad, "createdAt" FROM "Trabajo" 
             WHERE "clienteId" = $1 ORDER BY "createdAt" DESC LIMIT 10`,
            [clienteId]
          );
          facts.cliente_activo.trabajos_recientes = trabajos.rows;
        }
      }

    } catch(e) {
      facts.error = e.message;
    }

    this.cache = facts;
    this.lastLoad = Date.now();
    return facts;
  }

  invalidate() {
    this.cache = null;
    this.lastLoad = null;
  }
}

// ─── L2: Room recall (por sesión) ──────────────────────────────────────────
class L2Loader {
  constructor() {
    this.sessionMemory = new Map(); // agente → recuerdos de la sesión
  }

  remember(agentId, key, value) {
    if (!this.sessionMemory.has(agentId)) {
      this.sessionMemory.set(agentId, []);
    }
    this.sessionMemory.get(agentId).push({ key, value, timestamp: Date.now() });
  }

  recall(agentId, key) {
    const mems = this.sessionMemory.get(agentId) || [];
    return mems.filter(m => m.key === key).map(m => m.value);
  }

  recent(agentId, limit = 10) {
    const mems = this.sessionMemory.get(agentId) || [];
    return mems.slice(-limit);
  }

  clear(agentId) {
    this.sessionMemory.delete(agentId);
  }
}

// ─── L3: Deep search ( palace ) ───────────────────────────────────────────
class L3Loader {
  async search(query, wing = null, room = null, limit = 10) {
    return Palace.search(query, wing, room, limit);
  }

  async getTaxonomy() {
    return Palace.getTaxonomy();
  }

  async getDiary(agentName, lastN = 10) {
    return Palace.diaryRead(agentName, lastN);
  }

  async writeDiary(agentName, entry, topic = 'general') {
    return Palace.diaryWrite(agentName, entry, topic);
  }

  async saveMemory(wing, room, content, metadata = {}) {
    return Palace.addDrawer(wing, room, content, null, metadata);
  }
}

// ─── Main Layers API ─────────────────────────────────────────────────────────
const l1 = new L1Loader();
const l2 = new L2Loader();
const l3 = new L3Loader();

/**
 * Cargar contexto completo para un agente + cliente.
 * L0 siempre → L1 siempre → L2 bajo demanda → L3 bajo demanda
 */
async function loadContext(pg, agentId, clienteId = null, options = {}) {
  const { includeL2 = true, includeL3 = false, l3Query = null } = options;

  const context = {
    L0: L0_IDENTITY,
    L1: await l1.load(pg, clienteId),
  };

  if (includeL2) {
    context.L2 = {
      session: l2.recent(agentId),
      total: l2.recent(agentId).length,
    };
  }

  if (includeL3 && l3Query) {
    context.L3 = {
      search: await l3.search(l3Query, null, null, 5),
      diary: await l3.getDiary(agentId, 5),
    };
  }

  return context;
}

/**
 * Guardar un hecho memorable (MemPalace-style)
 */
async function remember(agentId, clienteId, room, content, metadata = {}) {
  const wing = clienteId ? `cliente_${clienteId.slice(0, 8)}` : `agente_${agentId}`;
  await l3.saveMemory(wing, room, content, { agentId, ...metadata });
  l2.remember(agentId, room, content);
}

/**
 * Resumen del palace para un agente
 */
async function palaceStatus() {
  const stats = Palace.stats();
  const taxonomy = await l3.getTaxonomy();
  return { stats, taxonomy };
}

module.exports = {
  L0_IDENTITY,
  L1Loader,
  L2Loader,
  L3Loader,
  loadContext,
  remember,
  palaceStatus,
  l1, l2, l3,
};