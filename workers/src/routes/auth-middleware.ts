/**
 * Auth middleware — extrae JWT del Authorization header
 * e inyecta payload en el contexto de Hono
 */
import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'fallback-secret-change-in-production'
);

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = auth.slice(7);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    c.set('jwtPayload', payload);
    c.set('clienteId', payload.clienteId as string);
    c.set('usuarioId', payload.usuarioId as string);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

export function getClienteId(c: Context): string {
  return c.get('clienteId') as string;
}
