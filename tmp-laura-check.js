const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

const sql = `
SELECT id, de, asunto, texto, "clienteId", "createdAt"
FROM "Email"
WHERE "EstadoEmail" = 'RECIBIDO'
ORDER BY "createdAt" ASC
LIMIT 20
`;

pool.query(sql)
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
