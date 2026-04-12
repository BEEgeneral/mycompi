const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const u = await prisma.usuario.count();
  const c = await prisma.cliente.count();
  const a = await prisma.agente.count();
  const t = await prisma.trabajo.count();
  const clientes = await prisma.cliente.findMany({ take: 3, select: { nombre: true } });
  console.log(JSON.stringify({ usuarios: u, clientes: c, agentes: a, trabajos: t, sample: clientes }, null, 2));
  await prisma.$disconnect();
}
check();
