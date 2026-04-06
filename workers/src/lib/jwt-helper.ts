/**
 * JWT helper — verificación directa con jose
 */
import { Context } from 'hono';
import { jwtVerify } from 'jose';
import { HTTPException } from 'hono/http-exception';

export interface JWTPayload {
  usuarioId: string;
  clienteId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function verifyJWT(c: Context): Promise<JWTPayload | null> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const secret = c.env.JWT_SECRET || 'fallback-dev-secret';
    const { payload } = await jwtVerify(auth.slice(7), new TextEncoder().encode(secret));
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function requireAuth(c: Context): JWTPayload {
  const payload = c.get('jwtPayload') as JWTPayload | undefined;
  if (!payload) throw new HTTPException(401, { message: 'Unauthorized' });
  return payload;
}
