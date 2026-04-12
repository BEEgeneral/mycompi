/**
 * KNOWLEDGE GRAPH — MyCompi
 * 
 * Grafo de conocimiento temporal basado en MemPalace.
 * Usa las tablas existentes de PostgreSQL como storage:
 * - TripleStore: basado en AuditLog con tipos
 * - Entity registry: Agente + Cliente
 * - Temporal validity: valid_from / valid_to
 * 
 * Concepto MemPalace adaptado:
 * - Wings = clientes (cada cliente es un wing)
 * - Rooms = agentes dentro de cada cliente
 * - Drawers = trabajos/outputs/deliverables
 * - Knowledge Graph = relaciones agente↔cliente↔trabajo con tiempo
 */

const { Client } = require('pg');
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

// Tipos de relación (predicate vocabulary)
const PREDICATES = {
  WORKS_ON: 'works_on',
  DELIVERS_TO: 'delivers_to',
  BELONGS_TO: 'belongs_to',
  COMPLETED: 'completed',
  BLOCKED_BY: 'blocked_by',
  REQUIRES_APPROVAL: 'requires_approval',
  APPROVED_BY: 'approved_by',
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  LEADS: 'leads',
};

// MemPalace-style entity types
const ENTITY_TYPES = {
  CLIENT: 'client',
  AGENT: 'agent', 
  TRABAJO: 'trabajo',
  MEMORABLE: 'memorable',
  DECISION: 'decision',
  PREFERENCE: 'preference',
};

class KnowledgeGraph {
  constructor(pg) {
    this.pg = pg;
  }

  // ─── Add entity ──────────────────────────────────────────────────────────
  async addEntity(name, type, properties = {}) {
    const id = this._entityId(name);
    const clienteId = 'cmn3je5zq0000e31xg8wru9iy'; // AlberBEE = system customer
    const recursoId = `entity_${id}`;
    await this.pg.query(
      `INSERT INTO "AuditLog" ("id","clienteid","agenteid","accion","recursotipo","recursoid","detalle","createdat")
       VALUES (gen_random_uuid(), $1, NULL, 'SYSTEM', 'ENTITY', $2, $3, NOW())
       ON CONFLICT DO NOTHING`,
      [clienteId, recursoId, JSON.stringify({ name, type, properties, entity_id: id })]
    );
    return id;
  }

  // ─── Add triple (subject → predicate → object) ───────────────────────────
  async addTriple(subject, predicate, obj, validFrom = null, sourceFile = null) {
    const subId = this._entityId(subject);
    const objId = this._entityId(obj);
    const pred = predicate.toLowerCase().replace(/ /g, '_');
    const clienteId = 'cmn3je5zq0000e31xg8wru9iy';
    const id = require('crypto').randomUUID();
    const recursoId = `triple_${pred}`;
    const detalle = JSON.stringify({
      triple: { subject: subId, predicate: pred, object: objId },
      valid_from: validFrom || new Date().toISOString().slice(0, 10),
      source_file: sourceFile,
    });

    await this.pg.query(
      `INSERT INTO "AuditLog" ("id","clienteid","agenteid","accion","recursotipo","recursoid","detalle","createdat")
       VALUES ($1, $2, NULL, 'SYSTEM', 'TRIPLE', $3, $4, NOW())`,
      [id, clienteId, recursoId, detalle]
    );

    return id;
  }

  // ─── Query entity ────────────────────────────────────────────────────────
  async queryEntity(name, asOf = null, direction = 'both') {
    const eid = this._entityId(name);
    
    const rows = await this.pg.query(
      `SELECT * FROM "AuditLog" 
       WHERE "recursotipo" = 'TRIPLE' 
         AND "detalle" ILIKE $1
         AND "createdat" > NOW() - INTERVAL '90 days'`,
      [`%${eid}%`]
    );
    
    return rows.map(r => {
      try {
        const data = typeof r.detalle === 'string' ? JSON.parse(r.detalle) : r.detalle;
        return {
          id: r.id,
          predicate: r.recursoid,
          subject_id: data?.triple?.subject,
          object_id: data?.triple?.object,
          valid_from: data?.valid_from,
          source_file: data?.source_file,
          created_at: r.createdat,
        };
      } catch { return null; }
    }).filter(Boolean);
  }

  // ─── Timeline of entity ──────────────────────────────────────────────────
  async timeline(name, limit = 50) {
    const eid = this._entityId(name);
    const rows = await this.pg.query(
      `SELECT * FROM "AuditLog" 
       WHERE "detalle" ILIKE $1
         AND "createdat" > NOW() - INTERVAL '30 days'
       ORDER BY "createdat" ASC
       LIMIT $2`,
      [`%${eid}%`, limit]
    );
    return rows.map(r => ({
      id: r.id,
      tipo: r.recursotipo,
      titulo: r.recursoid,
      contenido: r.detalle,
      timestamp: r.createdat,
    }));
  }

  // ─── Stats ──────────────────────────────────────────────────────────────
  async stats() {
    const [entities, triples] = await Promise.all([
      this.pg.query(`SELECT count(*) as c FROM "AuditLog" WHERE "recursotipo" = 'ENTITY'`),
      this.pg.query(`SELECT count(*) as c FROM "AuditLog" WHERE "recursotipo" = 'TRIPLE'`),
    ]);
    return {
      entities: parseInt(entities.rows[0]?.c || 0),
      triples: parseInt(triples.rows[0]?.c || 0),
    };
  }

  // ─── Stats ──────────────────────────────────────────────────────────────
  async stats() {
    const [entities, triples] = await Promise.all([
      this.pg.query(`SELECT count(*) as c FROM "AuditLog" WHERE "recursotipo" = 'ENTITY'`),
      this.pg.query(`SELECT count(*) as c FROM "AuditLog" WHERE "recursotipo" = 'TRIPLE'`),
    ]);
    return {
      entities: parseInt(entities.rows[0]?.c || 0),
      triples: parseInt(triples.rows[0]?.c || 0),
    };
  }

  // ─── Invalidate triple ───────────────────────────────────────────────────
  async invalidate(subject, predicate, obj, ended = null) {
    await this.addTriple(subject, predicate + '_ended', obj, ended || new Date().toISOString().slice(0, 10));
  }

  // ─── Seed from MyCompi data ─────────────────────────────────────────────
  async seedFromMyCompi() {
    const clienteId = 'cmn3je5zq0000e31xg8wru9iy';
    const [clientes, agentes, trabajos] = await Promise.all([
      this.pg.query('SELECT id, nombre, email, activo FROM "Cliente" WHERE activo = true'),
      this.pg.query('SELECT id, nombre, tipo, activo FROM "Agente" WHERE activo = true'),
      this.pg.query('SELECT id, "clienteId", "agenteId", estado, titulo, "createdAt" FROM "Trabajo" LIMIT 100'),
    ]);

    let seeded = 0;

    for (const c of clientes.rows) {
      await this.addEntity(c.nombre || c.email, ENTITY_TYPES.CLIENT, { id: c.id });
      seeded++;
    }

    for (const a of agentes.rows) {
      await this.addEntity(a.nombre, ENTITY_TYPES.AGENT, { id: a.id, tipo: a.tipo });
      seeded++;
    }

    for (const t of trabajos.rows) {
      if (t.clienteId) {
        await this.addTriple(t.agenteId || 'Unknown', PREDICATES.DELIVERS_TO, t.clienteId, t.createdAt?.toISOString().slice(0,10));
        seeded++;
      }
      if (t.estado === 'COMPLETED') {
        await this.addTriple(t.agenteId || 'Unknown', PREDICATES.COMPLETED, t.titulo || t.id, t.createdAt?.toISOString().slice(0,10));
        seeded++;
      }
    }

    return seeded;
  }

  _entityId(name) {
    return String(name).toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 40);
  }
}

module.exports = { KnowledgeGraph, PREDICATES, ENTITY_TYPES };