/** Approvals routes */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

async function auth(c: any) {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  return p;
}

router.get('/', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  try {
    return c.json({ approvals: await prisma.trabajo.findMany({
      where: { clienteId: p.clienteId, requiereAprobacion: true, estado: 'TODO' },
      orderBy: { createdAt: 'desc' },
      include: { agente: { select: { id: true, nombre: true, tipo: true } } },
    })});
  } catch { return c.json({ error: 'Error' }, 500); }
});

router.get('/:id/approvals', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  const trabajoId = c.req.param('id');
  try {
    const trabajo = await prisma.trabajo.findFirst({ where: { id: trabajoId, clienteId: p.clienteId } });
    if (!trabajo) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ logs: [] });
  } catch { return c.json({ error: 'Error' }, 500); }
});

export default router;
