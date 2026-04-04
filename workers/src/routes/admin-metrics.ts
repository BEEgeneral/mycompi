/** Admin metrics — business KPIs (owner-only) */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';

const router = new Hono();

router.get('/business', async (c) => {
  try {
    const [totalClientes, clientesActivos, totalAgentes, agentesActivos, trabajosRecientes] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ where: { activo: true } }),
      prisma.agente.count(),
      prisma.agente.count({ where: { activoHeartbeat: true } }),
      prisma.trabajo.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const agentes = await prisma.agente.findMany({
      where: { activo: true, budgetTokensMes: { gt: 0 } },
      select: { nombre: true, tipo: true, budgetTokensMes: true, tokensUsadosMes: true },
    });

    const agentesAlerta = agentes
      .filter((a: any) => (a.tokensUsadosMes / a.budgetTokensMes) >= 0.8)
      .map((a: any) => ({ nombre: a.nombre, tipo: a.tipo, uso: Math.round((a.tokensUsadosMes / a.budgetTokensMes) * 100) }));

    return c.json({
      totalClientes,
      clientesActivos,
      totalAgentes,
      agentesActivos,
      trabajosRecientes,
      agentesAlerta,
      roi: { precioMes: 49, ahorroEstimado: 9951 },
    });
  } catch (err: any) {
    console.error('Metrics error:', err);
    return c.json({ error: 'Error cargando métricas' }, 500);
  }
});

export default router;
