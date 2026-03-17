// Mock database for development without Neon
const mockPool = {
  query: async () => {
    console.log('⚠️ Using mock database - no real DB connection');
    return { rows: [] };
  },
  connect: async () => ({
    query: async () => { console.log('Mock query'); return { rows: [] }; },
    release: () => {}
  })
};

// Try to load real DB, fall back to mock
let pool = mockPool;

try {
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
    });
    console.log('📦 Using real PostgreSQL');
  }
} catch (err) {
  console.log('⚠️ pg module not available, using mock');
}

pool.on('connect', () => {
  console.log('📦 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en PostgreSQL:', err.message);
});

const initDB = async () => {
  console.log('📦 Database init skipped (using mock or will init on connection)');
};

module.exports = { pool, initDB };
