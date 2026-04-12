// Reset admin password for admin.mycompi.com
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: 'postgresql://mycompi:TU_PASSWORD_POSTGRES@172.24.0.2:5432/mycompi'
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  // Check if usuario exists
  const check = await client.query(
    'SELECT id, "passwordHash" FROM "Usuario" WHERE email = $1',
    ['beenocode@gmail.com']
  );
  console.log('Usuario rows:', check.rows.length);
  if (check.rows.length > 0) {
    console.log('passwordHash length:', check.rows[0].passwordHash ? check.rows[0].passwordHash.length : 'NULL');
    console.log('passwordHash starts with:', check.rows[0].passwordHash ? check.rows[0].passwordHash.slice(0,3) : 'NULL');
  }

  const hash = await bcrypt.hash('MyCompi2026!', 10);
  console.log('Hash generated, length:', hash.length);

  const r = await client.query(
    'UPDATE "Usuario" SET "passwordHash" = $1 WHERE email = $2 RETURNING id, email',
    [hash, 'beenocode@gmail.com']
  );

  if (r.rows.length === 0) {
    console.log('Usuario no encontrado');
  } else {
    console.log('OK:', r.rows[0].email, '- nueva password: MyCompi2026!');
  }

  await client.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
