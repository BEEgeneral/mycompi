/**
 * Agentes routes — Hono
 */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

async function auth(c: any) {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  return p;
}

// GET /api/agentes
router.get('/', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  try {
    const agentes = await prisma.agente.findMany({
      where: { clienteId: p.clienteId },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ agentes });
  } catch (err) { return c.json({ error: 'Error' }, 500); }
});

// POST /api/agentes
router.post('/', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const body = await c.req.json();

  // Generar workerId y email automáticos
  const nombreSlug = (body.nombre || 'agente').toLowerCase().replace(/\s+/g, '-');
  const workerId = `worker_${nombreSlug}_${Date.now()}`;
  const email = `${nombreSlug}@mycompi.com`;

  try {
    const agente = await prisma.agente.create({
      data: {
        clienteId: p.clienteId,
        workerId,
        email,
        nombre: body.nombre,
        tipo: body.tipo || 'MARKETING',
        activo: true,
        activoHeartbeat: false,
        budgetTokensMes: body.budgetTokensMes ?? 1_000_000,
        tokensUsadosMes: 0,
        ultimoHeartbeat: null,
      },
    });
    return c.json({ agente }, 201);
  } catch (err) { return c.json({ error: 'Error creando agente' }, 500); }
});

// GET /api/agentes/:id
router.get('/:id', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const agenteId = c.req.param('id');
  try {
    const agente = await prisma.agente.findFirst({ where: { id: agenteId, clienteId: p.clienteId } });
    if (!agente) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ agente });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// PATCH /api/agentes/:id
router.patch('/:id', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const agenteId = c.req.param('id');
  const body = await c.req.json();
  try {
    const updated = await prisma.agente.updateMany({
      where: { id: agenteId, clienteId: p.clienteId },
      data: body,
    });
    if (!updated.count) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ agente: await prisma.agente.findFirst({ where: { id: agenteId } }) });
  } catch { return c.json({ error: 'Error updating' }, 500); }
});

// DELETE /api/agentes/:id
router.delete('/:id', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const agenteId = c.req.param('id');
  try {
    const deleted = await prisma.agente.deleteMany({ where: { id: agenteId, clienteId: p.clienteId } });
    if (!deleted.count) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ ok: true });
  } catch { return c.json({ error: 'Error deleting' }, 500); }
});

export default router;
