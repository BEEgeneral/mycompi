/**
 * PALACE ORGANIZER — MyCompi
 * 
 * Sistema de organización Wing/Room/Drawer adaptado de MemPalace.
 * 
 * WINGS:
 *  - wing_clientes → cada cliente es un wing (cliente_{id})
 *  - wing_agentes → cada agente es un wing (agente_{nombre})
 * 
 * ROOMS (tipos de memoria):
 *  - hechos → decisiones y choices lockados
 *  - eventos → sesiones, milestones, debugging
 *  - descubrimientos → breakthroughs, insights nuevos
 *  - preferencias → habits, opinions
 *  - advice → recommendations and solutions
 * 
 * DRAWERS:
 *  - Cada deliverable/output/trabajo completado → 1 drawer
 *  - Contenido verbatim (no resumido)
 * 
 * Storage: JSON files por wing en /root/mycompi/shared/palace/
 */

const fs = require('fs');
const path = require('path');

const PALACE_DIR = '/root/mycompi/shared/palace';
const DIARIES_DIR = '/root/mycompi/shared/diaries';

// ─── WING MANAGEMENT ──────────────────────────────────────────────────────
function getWingPath(wingId) {
  return path.join(PALACE_DIR, `${wingId}.json`);
}

function getDiaryPath(agentName) {
  return path.join(DIARIES_DIR, `${agentName.toLowerCase()}_diary.json`);
}

// ─── PALACE METHODS ─────────────────────────────────────────────────────────
const Palace = {
  /**
   * Guardar un drawer (memoria verbatim) en un wing/room
   */
  async addDrawer(wingId, roomId, content, sourceFile = null, metadata = {}) {
    if (!fs.existsSync(PALACE_DIR)) {
      fs.mkdirSync(PALACE_DIR, { recursive: true });
    }

    const wingFile = getWingPath(wingId);
    let palace = { wing: wingId, rooms: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    if (fs.existsSync(wingFile)) {
      try { palace = JSON.parse(fs.readFileSync(wingFile, 'utf8')); } catch { }
    }

    const drawerId = require('crypto').randomUUID().slice(0, 12);
    const drawer = {
      id: drawerId,
      room: roomId,
      content: content,
      source: sourceFile,
      metadata,
      createdAt: new Date().toISOString(),
    };

    if (!palace.rooms[roomId]) {
      palace.rooms[roomId] = { drawers: [] };
    }
    palace.rooms[roomId].drawers.push(drawer);
    palace.updatedAt = new Date().toISOString();

    fs.writeFileSync(wingFile, JSON.stringify(palace, null, 2));
    return drawerId;
  },

  /**
   * Listar wings disponibles
   */
  listWings() {
    if (!fs.existsSync(PALACE_DIR)) return [];
    const files = fs.readdirSync(PALACE_DIR).filter(f => f.endsWith('.json'));
    return files.map(f => {
      const content = fs.readFileSync(path.join(PALACE_DIR, f), 'utf8');
      const data = JSON.parse(content);
      const totalDrawers = Object.values(data.rooms || {}).reduce((sum, r) => sum + (r.drawers?.length || 0), 0);
      return { id: data.wing, rooms: Object.keys(data.rooms || {}).length, drawers: totalDrawers, updatedAt: data.updatedAt };
    });
  },

  /**
   * Listar rooms dentro de un wing
   */
  listRooms(wingId) {
    const wingFile = getWingPath(wingId);
    if (!fs.existsSync(wingFile)) return [];
    const data = JSON.parse(fs.readFileSync(wingFile, 'utf8'));
    return Object.entries(data.rooms || {}).map(([name, room]) => ({
      name,
      drawers: room.drawers?.length || 0,
    }));
  },

  /**
   * Buscar en todos los drawers (búsqueda full-text simple)
   */
  search(query, wingId = null, roomId = null, limit = 10) {
    const results = [];
    const queryLower = query.toLowerCase();

    const wings = wingId ? [{ id: wingId }] : this.listWings();
    
    for (const wing of wings) {
      const wingFile = getWingPath(wing.id);
      if (!fs.existsSync(wingFile)) continue;
      
      const data = JSON.parse(fs.readFileSync(wingFile, 'utf8'));
      for (const [roomName, room] of Object.entries(data.rooms || {})) {
        if (roomId && roomName !== roomId) continue;
        
        for (const drawer of (room.drawers || [])) {
          if (drawer.content.toLowerCase().includes(queryLower)) {
            results.push({
              wing: wing.id,
              room: roomName,
              drawerId: drawer.id,
              snippet: drawer.content.slice(0, 200),
              score: drawer.content.toLowerCase().includes(queryLower) ? 1 : 0,
            });
            if (results.length >= limit) break;
          }
        }
        if (results.length >= limit) break;
      }
    }

    return results.sort((a, b) => b.score - a.score);
  },

  /**
   * Taxonomy completa (wing → room → count)
   */
  getTaxonomy() {
    return this.listWings().map(wing => ({
      wing: wing.id,
      rooms: this.listRooms(wing.id),
    }));
  },

  /**
   * Guardar un diary entry para un agente
   */
  async diaryWrite(agentName, entry, topic = 'general') {
    if (!fs.existsSync(DIARIES_DIR)) {
      fs.mkdirSync(DIARIES_DIR, { recursive: true });
    }

    const diaryFile = getDiaryPath(agentName);
    let diary = { agent: agentName, entries: [], updatedAt: new Date().toISOString() };

    if (fs.existsSync(diaryFile)) {
      try { diary = JSON.parse(fs.readFileSync(diaryFile, 'utf8')); } catch { }
    }

    diary.entries.push({
      id: require('crypto').randomUUID().slice(0, 12),
      topic,
      entry,
      timestamp: new Date().toISOString(),
    });

    // Mantener solo últimos 50 entries
    if (diary.entries.length > 50) {
      diary.entries = diary.entries.slice(-50);
    }

    diary.updatedAt = new Date().toISOString();
    fs.writeFileSync(diaryFile, JSON.stringify(diary, null, 2));
  },

  /**
   * Leer diary entries de un agente
   */
  diaryRead(agentName, lastN = 10) {
    const diaryFile = getDiaryPath(agentName);
    if (!fs.existsSync(diaryFile)) return [];
    const diary = JSON.parse(fs.readFileSync(diaryFile, 'utf8'));
    return diary.entries.slice(-lastN);
  },

  /**
   * Guardar un hecho en el knowledge graph
   */
  async kgAddFact(subject, predicate, object, validFrom = null) {
    // Guardar como drawer especial en wing 'knowledge_graph'
    await this.addDrawer('knowledge_graph', predicate, `${subject} → ${predicate} → ${object}`, null, {
      subject, predicate, object, valid_from: validFrom || new Date().toISOString().slice(0, 10),
    });
  },

  /**
   * Obtener hechos de un entity
   */
  kgQuery(entityName) {
    const results = this.search(entityName, 'knowledge_graph', null, 20);
    return results.map(r => {
      try {
        const meta = JSON.parse(fs.readFileSync(getWingPath('knowledge_graph'), 'utf8'));
        // Parsear el contenido como triple
        const parts = r.snippet.split('→').map(p => p.trim());
        return { subject: parts[0], predicate: parts[1], object: parts[2] };
      } catch { return { subject: r.snippet.slice(0, 50) }; }
    });
  },

  /**
   * Stats del palace
   */
  stats() {
    const wings = this.listWings();
    const totalDrawers = wings.reduce((sum, w) => sum + w.drawers, 0);
    const totalRooms = wings.reduce((sum, w) => sum + w.rooms, 0);
    
    // Diaries stats
    let diaryAgents = 0, diaryEntries = 0;
    if (fs.existsSync(DIARIES_DIR)) {
      const files = fs.readdirSync(DIARIES_DIR).filter(f => f.endsWith('_diary.json'));
      diaryAgents = files.length;
      for (const f of files) {
        try {
          const d = JSON.parse(fs.readFileSync(path.join(DIARIES_DIR, f), 'utf8'));
          diaryEntries += d.entries?.length || 0;
        } catch { }
      }
    }

    return { wings: wings.length, rooms: totalRooms, drawers: totalDrawers, diaryAgents, diaryEntries };
  },
};

module.exports = { Palace };