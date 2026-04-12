require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.trabajo.findMany({ take: 3 }).then(r => { console.log(JSON.stringify(r, null, 2)); prisma.$disconnect(); }).then(r => { console.log(JSON.stringify(r)); prisma.$disconnect(); }).catch(e => console.log(e.message));
