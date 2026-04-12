#!/usr/bin/env node
/**
 * purge-cloudflare-cache.js
 * Purga el cache de Cloudflare para un dominio.
 * Uso: node scripts/purge-cloudflare-cache.js
 *
 * Variables de entorno requeridas (en .env):
 *   CLOUDFLARE_ZONE_ID
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_DOMAIN (opcional, solo para logging)
 */

require('dotenv').config()

const ZONE_ID  = process.env.CLOUDFLARE_ZONE_ID
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const DOMAIN   = process.env.CLOUDFLARE_DOMAIN || 'dominio'

if (!ZONE_ID || !API_TOKEN) {
  console.error('❌  Falta CLOUDFLARE_ZONE_ID o CLOUDFLARE_API_TOKEN en el .env')
  process.exit(1)
}

const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`

console.log(`🗑️  Purgando cache de Cloudflare (${DOMAIN})...`)

fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ purge_everything: true }),
})
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log(`✅  Cache purgado en Cloudflare para ${DOMAIN}`)
    } else {
      console.error('❌  Error al purgar:', JSON.stringify(data.errors, null, 2))
      process.exit(1)
    }
  })
  .catch(err => {
    console.error('❌  Error de red:', err.message)
    process.exit(1)
  })
