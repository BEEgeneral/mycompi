/**
 * chat.js — Ruta de chat para Agente Luna
 * 
 * POST /api/chat
 * Body: { agente, mensaje }
 * 
 * El cliente escribe → se carga contexto de Luna + overlay del cliente → se responde
 */

const express = require('express');
const path = require('path');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Integration layer de Luna (carga contexto completo)
const { buildContext, logInteraction } = require('../../agents/atencion-cliente/luna');

// mapping de agentes disponibles
const AGENTES = {
  'luna': 'atencion-cliente',
  'atencion-cliente': 'atencion-cliente',
};

/**
 * POST /api/chat
 * Envía un mensaje al agente especificado para este cliente
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { agente: agenteKey, mensaje } = req.body;
    const clienteId = req.clienteId;

    // Validaciones
    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'mensaje es requerido' });
    }

    if (!agenteKey || !AGENTES[agenteKey]) {
      return res.status(400).json({ 
        error: 'agente no reconocido',
        agentes_disponibles: Object.keys(AGENTES)
      });
    }

    // Obtener el agent_id (ej: 'pizzeriacliente')
    // En producción vendría de la DB según el plan del cliente
    // Por ahora usamos el overlay que exista en el filesystem
    const agentesPath = path.join(__dirname, '../../agents', AGENTES[agenteKey]);
    const overlaysPath = path.join(agentesPath, 'overlays', clienteId);

    // Verificar que existe overlay para este cliente
    const fs = require('fs');
    if (!fs.existsSync(overlaysPath)) {
      // Si no hay overlay, crear uno genérico básico
      console.log(`Creando overlay básico para cliente ${clienteId}`);
      fs.mkdirSync(overlaysPath, { recursive: true });
      fs.writeFileSync(
        path.join(overlaysPath, 'USER.md'),
        `# Cliente ${clienteId}\n\nCliente de MyCompi.\n`
      );
      fs.mkdirSync(path.join(overlaysPath, 'memoria'), { recursive: true });
    }

    // Construir contexto completo: SOUL + IDENTITY + SKILL + MEMORY + overlay cliente
    const contexto = buildContext(clienteId);

    // Llamar al modelo
    const respuesta = await llamarModelo(contexto, mensaje);

    // Registrar la interacción en memoria
    try {
      logInteraction(clienteId, `Pregunta: ${mensaje}\nRespuesta: ${respuesta}`);
    } catch (logError) {
      console.warn('No se pudo guardar en memoria:', logError.message);
    }

    res.json({
      ok: true,
      agente: agenteKey,
      respuesta,
      cliente: clienteId,
    });

  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

/**
 * Llama al modelo de IA con el contexto de Luna
 * Usa la API de OpenClaw Gateway (más adelante se puede mover a API directa)
 */
async function llamarModelo(contexto, mensaje) {
  // Configuración del modelo
  const OPENCLAW_URL = process.env.OPENCLAW_URL || 'http://localhost:18789';
  const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

  if (!OPENCLAW_TOKEN) {
    throw new Error('OPENCLAW_TOKEN no configurado');
  }

  const prompt = `Eres Luna, la responsable de atención al cliente de MyCompi.

${contexto}

---

Cliente: "${mensaje}"
Luna:`;

  try {
    // Llamada al gateway de OpenClaw (OpenAI-compatible)
    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: mensaje }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenClaw API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (err) {
    console.error('Error llamando al modelo:', err);
    throw err;
  }
}

/**
 * GET /api/chat/historial
 * Obtiene el historial de chat con un agente
 */
router.get('/historial', authMiddleware, async (req, res) => {
  try {
    const { agente: agenteKey } = req.query;
    const clienteId = req.clienteId;

    if (!agenteKey || !AGENTES[agenteKey]) {
      return res.status(400).json({ error: 'agente requerido' });
    }

    const memoriaPath = path.join(
      __dirname, '../../agents', AGENTES[agenteKey], 
      'overlays', clienteId, 'memoria'
    );

    const fs = require('fs');
    if (!fs.existsSync(memoriaPath)) {
      return res.json({ historial: [] });
    }

    const files = fs.readdirSync(memoriaPath)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 10); // últimos 10 días

    const historial = files.map(f => ({
      fecha: f.replace('.md', ''),
      contenido: fs.readFileSync(path.join(memoriaPath, f), 'utf8')
    }));

    res.json({ historial });

  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
