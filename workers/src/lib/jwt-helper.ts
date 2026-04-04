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

function getSecret(): Uint8Array {
  const secret = (globalThis as any).__JWT_SECRET__ || 'fallback-dev-secret';
  return new TextEncoder().encode(secret);
}

export async function verifyJWT(c: Context): Promise<JWTPayload | null> {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(auth.slice(7), getSecret());
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
