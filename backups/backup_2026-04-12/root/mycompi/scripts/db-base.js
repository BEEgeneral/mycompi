/**
 * db-base.js — Base de conexión PostgreSQL para scripts de monitoring
 *
 * Usa conexión directa a la BD via IP del container (no hostname).
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: '172.24.0.2',   // IP del container postgres (mycompi-postgres-1)
  port: 5432,
  user: 'mycompi',
  password: 'TU_PASSWORD_POSTGRES',
  database: 'mycompi',
  ssl: false,
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
};

function createClient(overrides = {}) {
  return new Client({ ...DB_CONFIG, ...overrides });
}

module.exports = { createClient };