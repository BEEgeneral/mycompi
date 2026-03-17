const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('📦 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en PostgreSQL:', err);
});

// Inicializar tablas
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Tabla de clientes (empresas que contratan MyCompi)
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        plan VARCHAR(50) DEFAULT 'basico',
        estado VARCHAR(20) DEFAULT 'activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de usuarios (dentro de cada cliente)
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'viewer',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de profesionales agénticos
      CREATE TABLE IF NOT EXISTS agentes (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        core_expertise TEXT,
        especializacion TEXT,
        estado VARCHAR(20) DEFAULT 'activo',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de trabajos/tareas
      CREATE TABLE IF NOT EXISTS trabajos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        agente_id INTEGER REFERENCES agentes(id) ON DELETE SET NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente',
        prioridad VARCHAR(20) DEFAULT 'media',
        resultado TEXT,
        scored_at TIMESTAMP,
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de pagos
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        cantidad DECIMAL(10,2) NOT NULL,
        moneda VARCHAR(3) DEFAULT 'EUR',
        concepto VARCHAR(255),
        stripe_payment_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        fecha_pago TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de memoria (Layer 1 - Domain Knowledge)
      CREATE TABLE IF NOT EXISTS memoria (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        layer INTEGER CHECK (layer IN (1, 2, 3)),
        contenido TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de documentos
      CREATE TABLE IF NOT EXISTS documentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(255),
        contenido TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de reports
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        contenido TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de skills
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        agente_id INTEGER REFERENCES agentes(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        contenido TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de learnings
      CREATE TABLE IF NOT EXISTS learnings (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para rendimiento
      CREATE INDEX IF NOT EXISTS idx_clientes_slug ON clientes(slug);
      CREATE INDEX IF NOT EXISTS idx_usuarios_cliente ON usuarios(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_agentes_cliente ON agentes(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_trabajos_cliente ON trabajos(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON trabajos(estado);
      CREATE INDEX IF NOT EXISTS idx_memoria_cliente_layer ON memoria(cliente_id, layer);
      CREATE INDEX IF NOT EXISTS idx_documentos_cliente ON documentos(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_reports_cliente ON reports(cliente_id);
    `);
    console.log('✅ Base de datos inicializada');
  } catch (err) {
    console.error('Error inicializando DB:', err);
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
