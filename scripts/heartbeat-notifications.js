/**
 * heartbeat-notifications.js
 * Convierte heartbeats JSON de los agentes en notificaciones en BD.
 * Se ejecuta cada hora vía cron job.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const AGENT_API_KEY = process.env.AGENT_API_KEY || 'mycompi-agent-676025ea6a55babc77473d69bc2be380';
const NOTIF_URL = 'https://mycompi.onrender.com/api/notificaciones/interna';
const CLIENTE_ID = 'cmn3je5zq0000e31xg8wru9iy'; // BeeNoCode

const agentes = [
  { id: 'Laura', dir: '/data/.openclaw/workspace/mycompi/agents/laura' },
  { id: 'Enzo', dir: '/data/.openclaw/workspace/mycompi/agents/enzo' },
  { id: 'Carlos', dir: '/data/.openclaw/workspace/mycompi/agents/carlos' },
  { id: 'Elena', dir: '/data/.openclaw/workspace/mycompi/agents/elena' },
  { id: 'Diana', dir: '/data/.openclaw/workspace/mycompi/agents/diana' },
  { id: 'Marcos', dir: '/data/.openclaw/workspace/mycompi/agents/marcos' },
]

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function postNotificacao(agenteId, resumen) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      clienteId: CLIENTE_ID,
      agenteId,
      tipo: 'INFO',
      titulo: `${agenteId} — actividad`,
      contenido: resumen,
    })
    const url = new URL(NOTIF_URL)
    const opts = {
      hostname: url.host,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': AGENT_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(opts, (res) => resolve(res.statusCode))
    req.on('error', () => resolve(0))
    req.write(body)
    req.end()
  })
}

async function main() {
  const hoje = hoy()
  for (const ag of agentes) {
    const file = path.join(ag.dir, 'last-heartbeat.json')
    try {
      if (!fs.existsSync(file)) continue
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (!data.timestamp || !data.timestamp.startsWith(hoje)) {
        fs.rmSync(file)
        continue
      }
      const resumen = `[${ag.id}] ${data.resumen || data.tareas?.join(', ') || 'actividad'}`
      const status = await postNotificacao(ag.id, resumen)
      if (status === 200) {
        console.log(`OK: ${ag.id}`)
        fs.rmSync(file)
      } else {
        console.log(`ERR ${status}: ${ag.id}`)
      }
    } catch (e) {
      try { fs.rmSync(file) } catch {}
    }
  }
}

main().catch(console.error)
