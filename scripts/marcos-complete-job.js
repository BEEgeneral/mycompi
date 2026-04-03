const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_WtabOh4u2KiL@ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

const outputData = {
  "mejoras-implementadas": [
    {
      "tipo": "service-worker",
      "descripcion": "Service Worker con estrategia cache-first para assets, network-first para HTML. Caching offline de la landing page."
    },
    {
      "tipo": "seo-technique",
      "descripcion": "Preload de imagen LCP (dashboard.jpg) para mejorar Largest Contentful Paint."
    },
    {
      "tipo": "seo-content",
      "descripcion": "sitemap.xml actualizado a 2026-04-03 con URLs completas del portal (contratacion, login, registro, checkout)."
    },
    {
      "tipo": "rendimiento",
      "descripcion": "CSS class .content-visibility-auto añadido para skip rendering de contenido off-screen."
    }
  ],
  "build-verified": true,
  "nota": "No hay feedback de early adopters disponible en BD. Mejoras aplicadas según spec: rendimiento, SEO técnico, UX.",
  "trabajo-completado": "2d7f1390-380d-4ca9-a95c-7bfa77a3df9b"
};

const outputJson = JSON.stringify(outputData);

pool.query("UPDATE \"Trabajo\" SET estado = 'COMPLETED', \"outputData\" = $1, \"completedAt\" = NOW() WHERE id = '2d7f1390-380d-4ca9-a95c-7bfa77a3df9b'", [outputJson])
  .then(r => { console.log("Job COMPLETED"); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
