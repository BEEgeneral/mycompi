require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ─────────────────────────────────────────
// HELPERS DE NOTIFICACIONES
// ─────────────────────────────────────────
async function listarTodasNotificaciones({ take = 50, skip = 0 } = {}) {
  return prisma.notificacion.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    include: {
      cliente: { select: { id: true, nombre: true } },
    }
  })
}

async function contarNotificaciones() {
  return prisma.notificacion.count()
}

async function marcarNotificacionLeida(id) {
  return prisma.notificacion.update({
    where: { id },
    data: { leida: true }
  })
}

async function marcarTodasNotificacionesLeidas() {
  return prisma.notificacion.updateMany({
    where: { leida: false },
    data: { leida: true }
  })
}

module.exports = prisma
module.exports.listarTodasNotificaciones = listarTodasNotificaciones
module.exports.contarNotificaciones = contarNotificaciones
module.exports.marcarNotificacionLeida = marcarNotificacionLeida
module.exports.marcarTodasNotificacionesLeidas = marcarTodasNotificacionesLeidas
