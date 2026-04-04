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

const JWT_SECRET = new TextEncoder().encode('fallback-dev-secret');
const REFRESH_SECRET = new TextEncoder().encode('refresh-fallback-dev-secret');

const registerSchema = z.object({ nombre: z.string().min(2), email: z.string().email(), password: z.string().min(8), nombreEmpresa: z.string().min(2) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateTokens(payload: { usuarioId: string; clienteId: string; email: string }) {
  const accessToken = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').sign(JWT_SECRET);
  const refreshToken = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(REFRESH_SECRET);
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
    const tokens = await generateTokens({ usuarioId: result.usuario.id, clienteId: result.cliente.id, email });
    return c.json({ tokens, cliente: result.cliente }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Error registrando usuario' }, 500);
  }
});

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email }, include: { cliente: true } });
    if (!usuario) return c.json({ error: 'Credenciales inválidas' }, 401);
    const valid = await bcrypt.compare(password, usuario.passwordHash);
    if (!valid) return c.json({ error: 'Credenciales inválidas' }, 401);
    const tokens = await generateTokens({ usuarioId: usuario.id, clienteId: usuario.clienteId, email: usuario.email });
    return c.json({ tokens, usuario, cliente: usuario.cliente });
  } catch {
    return c.json({ error: 'Error en login' }, 500);
  }
});

router.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json().catch(() => ({}));
  if (!refreshToken) return c.json({ error: 'Token requerido' }, 401);
  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    const tokens = await generateTokens({ usuarioId: payload.usuarioId as string, clienteId: payload.clienteId as string, email: payload.email as string });
    return c.json({ tokens });
  } catch {
    return c.json({ error: 'Refresh token inválido' }, 401);
  }
});

export default router;
