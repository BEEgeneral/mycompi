/** Pagos routes — Stripe */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { verifyJWT } from '../lib/jwt-helper';

const router = new Hono();

router.get('/planes', (c) => c.json({
  planes: [
    { id: 'basico', nombre: 'Básico', precio: 10, agentes: 1 },
    { id: 'equipo', nombre: 'Equipo Completo', precio: 49, agentes: 7 },
    { id: 'direccion', nombre: 'Dirección', precio: 150, agentes: 10 },
  ]
}));

router.get('/suscripcion', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: p.clienteId }, select: { plan: true } });
    return c.json({ suscripcion: cliente });
  } catch { return c.json({ error: 'Error' }, 500); }
});

router.post('/create-checkout', async (c) => {
  const p = await verifyJWT(c);
  if (!p) return c.json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json().catch(() => ({}));
  const stripeKey = (globalThis as any).__STRIPE_SECRET_KEY__ || '';

  if (!stripeKey) return c.json({ error: 'Stripe no configurado' }, 500);

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_TU_STRIPE_PRICE_ID', quantity: 1 }],
      customer_email: body.email || p.email,
      metadata: { clienteId: p.clienteId },
      success_url: `https://mycompi.com/dashboard?checkout=success`,
      cancel_url: `https://mycompi.com/pricing?checkout=cancelled`,
    });
    return c.json({ url: session.url });
  } catch (err: any) {
    return c.json({ error: `Stripe error: ${err.message}` }, 500);
  }
});

export default router;
