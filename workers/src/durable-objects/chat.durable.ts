/**
 * Chat — stateless via Prisma/Neon
 * Sin Durable Objects (gratis — usa KV solo para cache de sesión activa)
 */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

const MINIMAX_API_KEY = (globalThis as any).__MINIMAX_API_KEY__ || '';
const MINIMAX_BASE_URL = 'https://api.minimax.io/v1';
const PACO_CORE = `Eres Paco, el orquestador de MyCompi — plataforma SaaS de equipos de agentes IA para PYMES españolas.

EQUIPO: Laura (Atención), Enzo (Marketing), Carlos (Ventas), Elena (Operaciones), Diana (Data), Marcos (Desarrollo Web).

CONSEJOS: Responde directo e informal. Máximo 4-5 líneas. Usa emoji con moderación. Si puedes resolver algo tú mismo, hazlo. Si necesitas un agente, propón crear una tarea.`;

// GET /api/chat — historial
router.get('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const historial = await prisma.interaccionChat.findMany({
      where: { clienteId: p.clienteId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        mensajeOriginal: true,
        respuestaAgente: true,
        createdAt: true,
        agenteId: true,
      },
    });
    return c.json({
      messages: historial.reverse().map(m => ({
        role: 'user',
        content: m.mensajeOriginal,
        ts: m.createdAt.toISOString(),
      })).concat(
        historial.reverse().map(m => ({
          role: 'assistant',
          content: m.respuestaAgente || '',
          ts: m.createdAt.toISOString(),
          agenteId: m.agenteId,
        }))
      ),
    });
  } catch (err) { return c.json({ error: 'Error' }, 500); }
});

// POST /api/chat — enviar mensaje
router.post('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { mensaje, plan } = body;
  if (!mensaje?.trim()) return c.json({ error: 'Mensaje requerido' }, 400);

  // Crear interaccion en BD
  let interaccionId: string | null = null;
  try {
    const ic = await prisma.interaccionChat.create({
      data: {
        clienteId: p.clienteId,
        agenteId: 'paco',
        tipoPeticion: 'CONSULTAR_INFO',
        mensajeOriginal: mensaje.trim(),
        respuestaAgente: 'Procesando...',
        estadoChat: 'PROCESSING',
      },
    });
    interaccionId = ic.id;
  } catch (err) { /* ok */ }

  // Obtener historial reciente
  let historial: Array<{ mensajeOriginal: string; respuestaAgente: string | null }> = [];
  try {
    historial = await prisma.interaccionChat.findMany({
      where: { clienteId: p.clienteId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { mensajeOriginal: true, respuestaAgente: true },
    });
    historial = historial.reverse();
  } catch { /* ok */ }

  const contexto = historial.map(m => `Cliente: ${m.mensajeOriginal}\nPaco: ${m.respuestaAgente ?? ''}`).join('\n\n');

  const prompt = `${PACO_CORE}

${contexto ? `CONVERSACIÓN RECIENTE:\n${contexto}\n\n` : ''}Cliente ahora: ${mensaje.trim()}`;

  let respuesta = '';
  try {
    respuesta = await callMiniMax(prompt);
  } catch (err: any) {
    respuesta = `❌ Error: ${err.message}`;
  }

  // Guardar respuesta
  try {
    if (interaccionId) {
      await prisma.interaccionChat.update({
        where: { id: interaccionId },
        data: {
          respuestaAgente: respuesta,
          estadoChat: 'COMPLETED',
          resultadoExitoso: true,
        },
      });
    }
  } catch { /* ok */ }

  return c.json({
    ok: true,
    interaccionId,
    respuesta,
    agenteId: 'paco',
    timestamp: new Date().toISOString(),
  });
});

// DELETE /api/chat — reset
router.delete('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  // No borramos historial en BD — solo respondemos ok
  return c.json({ ok: true });
});

async function callMiniMax(prompt: string): Promise<string> {
  if (!MINIMAX_API_KEY) return '⚠️ MINIMAX_API_KEY no disponible.';

  const [systemPart, userContent] = prompt.split('Cliente ahora:').map(s => s.trim());

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [
          { role: 'system', content: systemPart },
          { role: 'user', content: `Cliente ahora: ${userContent}` },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!response.ok) return `❌ MiniMax (${response.status})`;
    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || 'Respuesta vacía';
  } catch (err: any) {
    if (err.name === 'AbortError') return '⏱️ Timeout (55s). Intenta de nuevo.';
    return `❌ ${err.message}`;
  }
}

export default router;
