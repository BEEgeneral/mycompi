const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});
pool.query("UPDATE \"Trabajo\" SET estado = 'IN_PROGRESS', \"updatedAt\" = NOW() WHERE id = '2d7f1390-380d-4ca9-a95c-7bfa77a3df9b'")
  .then(r => { console.log("Job 2d7f1390 marked IN_PROGRESS"); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
