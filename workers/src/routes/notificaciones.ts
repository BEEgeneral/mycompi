/** Notificaciones routes */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();
const AGENT_API_KEY = (globalThis as any).__AGENT_API_KEY__ || '';

// POST /api/notificaciones/interna — agentes con API key
router.post('/interna', async (c) => {
  const key = c.req.header('x-agent-key');
  if (key !== AGENT_API_KEY) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { clienteId, agenteId, tipo, titulo, contenido } = body;
  if (!clienteId || !titulo || !contenido) {
    return c.json({ error: 'clienteId, titulo y contenido requeridos' }, 400);
  }

  try {
    const notif = await prisma.notificacion.create({
      data: { clienteId, agenteId, tipo: tipo || 'INFO', titulo, contenido },
    });
    return c.json({ notificacion: notif }, 201);
  } catch { return c.json({ error: 'Error' }, 500); }
});

// GET /api/notificaciones — lista del cliente
router.get('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  const { take = '50', skip = '0' } = c.req.query();

  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { clienteId: p.clienteId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(take),
      skip: parseInt(skip),
    });
    return c.json({ notificaciones });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// GET /api/notificaciones/no-leidas
router.get('/no-leidas', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const count = await prisma.notificacion.count({ where: { clienteId: p.clienteId, leida: false } });
    return c.json({ count });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// PATCH /api/notificaciones/:id/leida
router.patch('/:id/leida', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  const notifId = c.req.param('id');

  try {
    await prisma.notificacion.updateMany({ where: { id: notifId, clienteId: p.clienteId }, data: { leida: true } });
    return c.json({ ok: true });
  } catch { return c.json({ error: 'Error' }, 500); }
});

export default router;
