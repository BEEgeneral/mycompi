/** Debug route — remove in production */
import { Hono } from 'hono';

const router = new Hono();

router.get('/debug/db', async (c) => {
  const url = (globalThis as any).__DATABASE_URL__ || '';
  return c.json({ hasUrl: !!url, masked: url ? url.replace(/\/\/.*:.*@/, '//***@') : 'NOT SET' });
});

router.get('/debug/prisma', async (c) => {
  try {
    const { prisma } = await import('../lib/prisma.js');
    const count = await prisma.cliente.count();
    return c.json({ ok: true, clientes: count });
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message || String(err) });
  }
});

router.get('/debug/neon-conn', async (c) => {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const r = await fetch('https://ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech/', { signal: controller.signal });
    clearTimeout(t);
    const text = await r.text();
    return c.json({ ok: true, neon: text.slice(0, 200) });
  } catch (err: any) {
    return c.json({ ok: false, neonError: err?.message || String(err) });
  }
});

router.get('/debug/1.1.1.1', async (c) => {
  try {
    const r = await fetch('https://1.1.1.1/cdn-cgi/trace');
    const text = await r.text();
    return c.json({ ok: true, cf: text.slice(0, 200) });
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message });
  }
});

export default router;
