/**
 * Admin metrics — delega al backend Express en Render
 * El Worker no tiene acceso directo a la DB (Neon blocklist en Workers outbound)
 */
import { Hono } from 'hono';
import type { Env } from '../index.js';

const router = new Hono<{ Bindings: Env }>();

router.get('/business', async (c) => {
  const backendUrl = c.env?.RENDER_BACKEND_URL || 'https://mycompi.onrender.com';
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${backendUrl}/api/admin/metrics/business`, {
      headers: {
        'Authorization': `Bearer ${c.env?.AGENT_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(t);
    const data = await res.json();
    return c.json(data, res.status);
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('aborted')) {
      return c.json({ error: 'Timeout contacting backend' }, 504);
    }
    return c.json({ error: `Backend unreachable: ${msg}` }, 502);
  }
});

export default router;
