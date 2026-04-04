/**
 * Trabajos routes
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

// GET /api/trabajos
router.get('/', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const { estado, limite = '50' } = c.req.query();

  try {
    const where: any = { clienteId: p.clienteId };
    if (estado) where.estado = estado;

    const trabajos = await prisma.trabajo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limite),
      include: { agente: { select: { id: true, nombre: true, tipo: true } } },
    });
    return c.json({ trabajos });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// POST /api/trabajos
router.post('/', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const body = await c.req.json();

  try {
    const trabajo = await prisma.trabajo.create({
      data: {
        clienteId: p.clienteId,
        agenteId: body.agenteId || null,
        titulo: body.titulo,
        descripcion: body.descripcion || '',
        tipo: body.tipo || 'OPERATIVO',
        prioridad: body.prioridad || 'MEDIA',
        estado: 'TODO',
        requiereAprobacion: body.requiereAprobacion ?? false,
      },
    });
    return c.json({ trabajo }, 201);
  } catch { return c.json({ error: 'Error' }, 500); }
});

// PATCH /api/trabajos/:id
router.patch('/:id', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const trabajoId = c.req.param('id');
  const body = await c.req.json();

  try {
    const updated = await prisma.trabajo.updateMany({
      where: { id: trabajoId, clienteId: p.clienteId },
      data: body,
    });
    if (!updated.count) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ trabajo: await prisma.trabajo.findFirst({ where: { id: trabajoId } }) });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// POST /api/trabajos/:id/aprobar
router.post('/:id/aprobar', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const trabajoId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  try {
    const updated = await prisma.trabajo.updateMany({
      where: { id: trabajoId, clienteId: p.clienteId, requiereAprobacion: true },
      data: { estado: 'COMPLETED', aprobadoPor: p.clienteId, aprobadoAt: new Date(), notaAprobacion: body.nota || null },
    });
    if (!updated.count) return c.json({ error: 'No encontrado o no requiere aprobación' }, 404);
    return c.json({ ok: true });
  } catch { return c.json({ error: 'Error' }, 500); }
});

// POST /api/trabajos/:id/rechazar
router.post('/:id/rechazar', async (c) => {
  const p = await auth(c);
  if (!p || p === 401) return;
  const trabajoId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));

  try {
    const updated = await prisma.trabajo.updateMany({
      where: { id: trabajoId, clienteId: p.clienteId, requiereAprobacion: true },
      data: { estado: 'BLOCKED', notaAprobacion: body.nota || null },
    });
    if (!updated.count) return c.json({ error: 'No encontrado' }, 404);
    return c.json({ ok: true });
  } catch { return c.json({ error: 'Error' }, 500); }
});

export default router;
