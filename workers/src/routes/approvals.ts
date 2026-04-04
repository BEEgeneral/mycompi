/** Approvals routes */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

function auth(c: any) {
  const p = verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  return p;
}

router.get('/', async (c) => {
  const p = auth(c);
  if (!p || p === 401) return;
  try {
    return c.json({ approvals: await prisma.trabajo.findMany({
      where: { clienteId: p.clienteId, requiereAprobacion: true, estado: 'PENDIENTE' },
      orderBy: { createdAt: 'desc' },
      include: { agente: { select: { id: true, nombre: true, tipo: true } } },
    })});
  } catch { return c.json({ error: 'Error' }, 500); }
});

router.get('/:id/approvals', async (c) => {
  const p = auth(c);
  if (!p || p === 401) return;
  const trabajoId = c.req.param('id');
  try {
    const trabajo = await prisma.trabajo.findFirst({ where: { id: trabajoId, clienteId: p.clienteId } });
    if (!trabajo) return c.json({ error: 'No encontrado' }, 404);
    const logs = await prisma.auditLog.findMany({
      where: { clienteId: p.clienteId, accion: { in: ['APROBAR', 'RECHAZAR'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return c.json({ logs });
  } catch { return c.json({ error: 'Error' }, 500); }
});

export default router;
