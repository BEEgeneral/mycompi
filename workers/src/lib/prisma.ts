/**
 * Prisma client singleton para Cloudflare Workers
 * Neon PostgreSQL — connection string directa
 */
import { PrismaClient } from '@prisma/client';

function createPrisma(): PrismaClient {
  // En Cloudflare Workers: globalThis.env.DATABASE_URL
  // En local/dev: process.env.DATABASE_URL
  const url = (globalThis as any).__DATABASE_URL__ || '';

  return new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });
}

const key = '__prisma_myc__';
const g = globalThis as any;
if (!g[key]) g[key] = createPrisma();

export const prisma = g[key] as PrismaClient;
export default prisma;
