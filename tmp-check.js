const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Trabajo'`
  .then(r => { console.log(JSON.stringify(r, null, 2)); prisma.$disconnect(); })
  .catch(e => { console.error(e.message); prisma.$disconnect(); });
