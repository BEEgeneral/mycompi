/**
 * Auth routes — registro + login con JWT (jose)
 */
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = new Hono();

// DEBUG: test endpoint sin bcrypt/prisma
router.get('/debug-test', (c) => {
  return c.json({ msg: 'auth route works', ts: Date.now() });
});

const registerSchema = z.object({ nombre: z.string().min(2), email: z.string().email(), password: z.string().min(8), nombreEmpresa: z.string().min(2) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateTokens(c: any, payload: { usuarioId: string; clienteId: string; email: string }) {
  const jwtSecret = new TextEncoder().encode(c.env.JWT_SECRET || 'fallback-dev-secret');
  const refreshSecret = new TextEncoder().encode(c.env.JWT_REFRESH_SECRET || 'refresh-fallback-dev-secret');
  const accessToken = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').sign(jwtSecret);
  const refreshToken = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(refreshSecret);
  return { accessToken, refreshToken };
}

router.post('/register', zValidator('json', registerSchema), async (c) => {
  const { nombre, email, password, nombreEmpresa } = c.req.valid('json');
  try {
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) return c.json({ error: 'Email ya registrado' }, 400);
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx: any) => {
      const cliente = await tx.cliente.create({ data: { nombre: nombreEmpresa, slug: slugify(nombreEmpresa), email, plan: 'BASICO' } });
      const usuario = await tx.usuario.create({ data: { clienteId: cliente.id, nombre, email, passwordHash, rol: 'USUARIO' } });
      return { cliente, usuario };
    });
    const tokens = await generateTokens(c, { usuarioId: result.usuario.id, clienteId: result.cliente.id, email });
    return c.json({ tokens, cliente: result.cliente }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Error registrando usuario' }, 500);
  }
});

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  try {
    const testHash = await bcrypt.hash('test', 4);
    const usuario = await prisma.usuario.findUnique({ where: { email }, include: { cliente: true } });
    if (!usuario) return c.json({ error: 'Credenciales inválidas' }, 401);
    const valid = await bcrypt.compare(password, usuario.passwordHash);
    if (!valid) return c.json({ error: 'Credenciales inválidas' }, 401);
    const tokens = await generateTokens(c, { usuarioId: usuario.id, clienteId: usuario.clienteId, email: usuario.email });
    return c.json({ tokens, usuario, cliente: usuario.cliente });
  } catch (err) {
    return c.json({ error: 'Error en login', detail: String(err) }, 500);
  }
});

router.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json().catch(() => ({}));
  if (!refreshToken) return c.json({ error: 'Token requerido' }, 401);
  try {
    const refreshSecret = new TextEncoder().encode(c.env.JWT_REFRESH_SECRET || 'refresh-fallback-dev-secret');
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    const tokens = await generateTokens(c, { usuarioId: payload.usuarioId as string, clienteId: payload.clienteId as string, email: payload.email as string });
    return c.json({ tokens });
  } catch {
    return c.json({ error: 'Refresh token inválido' }, 401);
  }
});

export default router;
