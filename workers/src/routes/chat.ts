/**
 * Chat routes — usa Durable Objects para mantener contexto
 */
import { Hono } from 'hono';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

function getChatSessionId(clienteId: string): string {
  return `mycompi-chat-${clienteId}`;
}

// GET /api/chat — obtener historial
router.get('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  const sessionId = getChatSessionId(p.clienteId);
  const env = c.env as any;
  const id = env?.CHAT_SESSION?.idFromName?.(sessionId);
  if (!id) return c.json({ sessionId, messages: [] });

  try {
    const stub = env.CHAT_SESSION.get(id);
    const res = await stub.fetch('https://internal/history');
    const data = await res.json() as any;
    return c.json({ sessionId, messages: data.messages || [] });
  } catch {
    return c.json({ sessionId, messages: [] });
  }
});

// POST /api/chat — enviar mensaje
router.post('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json().catch(() => ({}));
  if (!body?.mensaje?.trim()) return c.json({ error: 'Mensaje requerido' }, 400);

  const sessionId = getChatSessionId(p.clienteId);
  const env = c.env as any;

  try {
    const id = env?.CHAT_SESSION?.idFromName?.(sessionId);
    if (!id) return c.json({ error: 'Chat not initialized' }, 500);

    const stub = env.CHAT_SESSION.get(id);
    const res = await stub.fetch('https://internal/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensaje: body.mensaje,
        clienteId: p.clienteId,
        plan: body.plan || 'BASICO',
      }),
    });
    const data = await res.json() as any;
    return c.json({ ok: true, ...data, sessionId });
  } catch (err: any) {
    console.error('Chat DO error:', err);
    return c.json({ error: `Error: ${err?.message}` }, 500);
  }
});

// DELETE /api/chat — reset conversación
router.delete('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  const sessionId = getChatSessionId(p.clienteId);
  const env = c.env as any;

  try {
    const id = env?.CHAT_SESSION?.idFromName?.(sessionId);
    if (id) {
      const stub = env.CHAT_SESSION.get(id);
      await stub.fetch('https://internal/reset');
    }
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: true });
  }
});

export default router;
