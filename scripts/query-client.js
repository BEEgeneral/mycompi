const { Pool } = require('pg');
require('dotenv').config({ path: '/data/.openclaw/workspace/mycompi/.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const clienteId = 'cmn3je5zq0000e31xg8wru9iy';

pool.query('SELECT * FROM "Cliente" WHERE id = $1', [clienteId])
  .then(r => { console.log('CLIENTE:', JSON.stringify(r.rows, null, 2)); return pool.query('SELECT * FROM "Trabajo" WHERE "clienteId" = $1 ORDER BY "createdAt" DESC LIMIT 20', [clienteId]); })
  .then(r => { console.log('TRABAJOS DEL CLIENTE:', JSON.stringify(r.rows, null, 2)); return pool.query('SELECT * FROM "InteraccionChat" WHERE "clienteId" = $1 ORDER BY "createdAt" DESC LIMIT 10', [clienteId]); })
  .then(r => { console.log('CHATS:', JSON.stringify(r.rows, null, 2)); return pool.query('SELECT * FROM "Email" WHERE "clienteId" = $1 ORDER BY "createdAt" DESC LIMIT 20', [clienteId]); })
  .then(r => { console.log('EMAILS:', JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
