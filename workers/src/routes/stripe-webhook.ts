/** Stripe webhook handler — raw body, sin auth */
import { Hono } from 'hono';
import { prisma } from '../lib/prisma';

const router = new Hono();

router.post('/', async (c) => {
  const stripeKey = (globalThis as any).__STRIPE_SECRET_KEY__ || '';
  const webhookSecret = (globalThis as any).__STRIPE_WEBHOOK_SECRET__ || '';

  if (!stripeKey) return c.json({ error: 'Stripe not configured' }, 500);

  let body: ArrayBuffer;
  try {
    body = await c.req.arrayBuffer();
  } catch {
    return c.json({ error: 'Could not read body' }, 400);
  }

  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'No signature' }, 400);

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as any });
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const clienteId = session.metadata?.clienteId;
      if (clienteId) {
        await prisma.cliente.update({
          where: { id: clienteId },
          data: { plan: 'EQUIPO', stripeCustomerId: session.customer as string },
        });
      }
    }

    return c.json({ received: true });
  } catch (err: any) {
    return c.json({ error: `Webhook error: ${err.message}` }, 400);
  }
});

export default router;
