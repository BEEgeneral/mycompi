/**
 * Stripe config — GET /api/stripe/config
 * Compatible con el frontend existente de MyCompi
 */
import { Hono } from 'hono';

const router = new Hono();

router.get('/config', (c) => {
  const key = (globalThis as any).__STRIPE_PUBLISHABLE_KEY__ || '';
  return c.json({ publishableKey: key });
});

export default router;
