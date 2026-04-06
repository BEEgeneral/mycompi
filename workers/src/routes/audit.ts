/** Audit routes */
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
  const { limit = '100', offset = '0', accion, agenteId } = c.req.query();

  try {
    const where: any = { clienteId: p.clienteId };
    if (accion) where.accion = accion;
    if (agenteId) where.agenteId = agenteId;

    // Trabajar con InteraccionChat como log de auditoría
    const logs = await prisma.interaccionChat.findMany({
      where: { clienteId: p.clienteId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });
    return c.json({ logs });
  } catch { return c.json({ error: 'Error' }, 500); }
});

router.get('/tokens', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const agentes = await prisma.agente.findMany({
      where: { clienteId: p.clienteId },
      select: { id: true, nombre: true, tipo: true, budgetTokensMes: true, tokensUsadosMes: true },
    });
    return c.json({ agentes });
  } catch { return c.json({ error: 'Error' }, 500); }
});

export default router;
