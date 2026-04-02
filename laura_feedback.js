const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trabajo = await prisma.trabajo.update({
    where: { id: '2b5d684d-74c2-4c93-a2da-20a5e0ce5b2c' },
    data: { estado: 'IN_PROGRESS' }
  });
  console.log('Trabajo marcado IN_PROGRESS');

  const interacciones = await prisma.interaccionChat.findMany({
    where: { createdAt: { gte: new Date('2026-03-01') } },
    include: { cliente: { select: { nombre: true } }, agente: { select: { nombre: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const emails = await prisma.email.findMany({
    where: { 
      createdAt: { gte: new Date('2026-03-01') },
      estado: { in: ['RECIBIDO', 'PROCESANDO'] }
    },
    orderBy: { createdAt: 'desc' }
  });

  const feedbackItems = [];
  
  for (const i of interacciones) {
    if (i.respuestaAgente) {
      const text = (i.mensajeOriginal + ' ' + (i.resumen || '')).toLowerCase();
      let categoria = 'general';
      
      if (text.includes('bug') || text.includes('error') || text.includes('no funciona') || text.includes('crash') || text.includes('fallo')) {
        categoria = 'bug';
      } else if (text.includes('sugeren') || text.includes('sería bueno') || text.includes('podríais') || text.includes('feature') || text.includes('nueva función')) {
        categoria = 'feature request';
      } else if (text.includes('ux') || text.includes('interfaz') || text.includes('difícil') || text.includes('confuso')) {
        categoria = 'mejora UX';
      } else if (text.includes('precio') || text.includes('costoso') || text.includes('caro') || text.includes('factura')) {
        categoria = 'billing';
      } else if (text.includes('contido') || text.includes('respuesta') || text.includes('IA') || text.includes('chatbot')) {
        categoria = 'contenido/IA';
      }
      
      feedbackItems.push({
        tipo: 'chat',
        fecha: i.createdAt.toISOString(),
        cliente: i.cliente?.nombre || 'Unknown',
        agente: i.agente?.nombre || 'Unknown',
        mensaje: i.mensajeOriginal.substring(0, 200),
        resumen: i.resumen,
        categoria
      });
    }
  }

  for (const e of emails) {
    const text = (e.asunto + ' ' + e.texto).toLowerCase();
    let categoria = 'general';
    
    if (text.includes('bug') || text.includes('error') || text.includes('no funciona')) categoria = 'bug';
    else if (text.includes('sugeren') || text.includes('feature') || text.includes('sería')) categoria = 'feature request';
    else if (text.includes('ux') || text.includes('interfaz') || text.includes('difícil')) categoria = 'mejora UX';
    else if (text.includes('precio') || text.includes('factura') || text.includes('pago')) categoria = 'billing';
    else if (text.includes('contenido') || text.includes('respuesta') || text.includes('ia')) categoria = 'contenido/IA';
    
    feedbackItems.push({
      tipo: 'email',
      fecha: e.createdAt.toISOString(),
      cliente: 'Cliente (email)',
      agente: e.agenteId || 'Unknown',
      asunto: e.asunto,
      mensaje: e.texto.substring(0, 300),
      categoria
    });
  }

  const porCategoria = {};
  for (const f of feedbackItems) {
    porCategoria[f.categoria] = porCategoria[f.categoria] || [];
    porCategoria[f.categoria].push(f);
  }

  const resumen = {
    total: feedbackItems.length,
    porCategoria,
    interaccionesCount: interacciones.length,
    emailsPendientes: emails.length
  };

  await prisma.trabajo.update({
    where: { id: '2b5d684d-74c2-4c93-a2da-20a5e0ce5b2c' },
    data: { 
      estado: 'COMPLETED',
      outputData: resumen,
      completedAt: new Date()
    }
  });

  console.log(JSON.stringify({ success: true, resumen }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
