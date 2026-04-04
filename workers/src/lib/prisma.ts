/**
 * Prisma client singleton para Cloudflare Workers
 * Neon PostgreSQL — usa datasources override (sin driver adapter)
 */
import { PrismaClient } from '@prisma/client';

function createPrisma(url: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });
}

const STORE = '__prisma_store__';
const g = globalThis as any;

export function getPrisma(env: { DATABASE_URL: string }): PrismaClient {
  const url = env.DATABASE_URL || '';
  if (!url) throw new Error('DATABASE_URL binding missing');
  if (!g[STORE] || g[STORE + '_url'] !== url) {
    g[STORE] = createPrisma(url);
    g[STORE + '_url'] = url;
  }
  return g[STORE] as PrismaClient;
}
