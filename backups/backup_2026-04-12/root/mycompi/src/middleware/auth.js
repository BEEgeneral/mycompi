const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
  const { prisma } = require('../lib/db');
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.usuarioId },
      include: { cliente: true }
    });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.usuario = usuario;
    req.clienteId = usuario.clienteId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { authMiddleware };
