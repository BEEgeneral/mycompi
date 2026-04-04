/** Debug route — remove in production */
import { Hono } from 'hono';
import type { Env } from '../index.js';
import { getPrisma } from '../lib/prisma.js';

const router = new Hono<{ Bindings: Env }>();

router.get('/db', (c) => {
  const url = c.env?.DATABASE_URL || '';
  return c.json({ hasUrl: !!url, masked: url ? url.replace(/\/\/.*:.*@/, '//***@') : 'NOT SET' });
});

router.get('/prisma', async (c) => {
  try {
    const db = getPrisma(c.env as { DATABASE_URL: string });
    const count = await db.cliente.count();
    return c.json({ ok: true, clientes: count });
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message || String(err) });
  }
});

router.get('/neon-conn', async (c) => {
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

router.get('/cf', async (c) => {
  try {
    const r = await fetch('https://1.1.1.1/cdn-cgi/trace');
    const text = await r.text();
    return c.json({ ok: true, cf: text.slice(0, 200) });
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message });
  }
});

router.get('/neon-direct', async (c) => {
  // Test PrismaNeonHttp (HTTP) — funciona en edge runtimes
  try {
    const { PrismaNeonHttp } = await import('@prisma/adapter-neon');
    const { PrismaClient } = await import('@prisma/client');
    const url = c.env?.DATABASE_URL || '';
    if (!url) return c.json({ ok: false, error: 'no DATABASE_URL env' });
    const adapter = new PrismaNeonHttp({ url });
    const db = new PrismaClient({ adapter, log: ['error'] });
    const count = await db.cliente.count();
    db.$disconnect().catch(() => {});
    return c.json({ ok: true, clientes: count });
  } catch (err: any) {
    return c.json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;
