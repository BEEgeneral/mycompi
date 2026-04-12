const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const u = await prisma.usuario.count().catch(() => 'error');
    const c = await prisma.cliente.count().catch(() => 'error');
    const a = await prisma.agente.count().catch(() => 'error');
    const t = await prisma.trabajo.count().catch(() => 'error');
    const n = await prisma.notificacion.count().catch(() => 'error');
    console.log(JSON.stringify({ Usuario: u, Cliente: c, Agente: a, Trabajo: t, Notificacion: n }, null, 2));
  } catch(e) {
    console.log('Error:', e.message.slice(0, 200));
  }
  await prisma.$disconnect();
}
check();
