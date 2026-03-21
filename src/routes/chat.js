/**
 * chat.js — Ruta de chat para Agente Luna
 * 
 * POST /api/chat
 * Body: { agente, mensaje }
 * 
 * Incluye Token Controller para gestionar budget
 */

const express = require('express');
const path = require('path');
const { authMiddleware } = require('./auth');
const tokenController = require('../services/tokenController');

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
 * 
 * Flow:
 * 1. Token Controller verifica budget disponible
 * 2. Si OK → construye contexto → llama al modelo
 * 3. Si no OK → devuelve error 429 con info de espera
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { agente: agenteKey, mensaje, complejidad } = req.body;
    
    // Soportar modo demo (para testing sin auth completo)
    const isDemoMode = req.headers['x-demo-mode'] === 'true';
    const clienteId = isDemoMode 
      ? (req.headers['x-client-id'] || 'demo') 
      : req.clienteId;
    const planCliente = isDemoMode 
      ? 'demo' 
      : (req.clientePlan || 'demo');

    // ─────────────────────────────────────────
    // 1. VALIDACIONES
    // ─────────────────────────────────────────
    if (!mensaje || typeof mensaje !== 'string') {
      return res.status(400).json({ error: 'mensaje es requerido' });
    }

    if (!agenteKey || !AGENTES[agenteKey]) {
      return res.status(400).json({ 
        error: 'agente no reconocido',
        agentes_disponibles: Object.keys(AGENTES)
      });
    }

    // ─────────────────────────────────────────
    // 2. OBTENER PLAN DEL CLIENTE
    // Por ahora hardcodeado, luego vendrá de DB
    // ─────────────────────────────────────────
    const planCliente = req.clientePlan || 'demo'; // demo, basico, equipo, direccion

    // ─────────────────────────────────────────
    // 3. TOKEN CONTROLLER — ¿podemos procesar?
    // ─────────────────────────────────────────
    const solicitud = await tokenController.solicitar(
      clienteId, 
      planCliente, 
      { mensaje, complejidad: complejidad || 'baja' }
    );

    if (!solicitud.puedeProcesar) {
      return res.status(429).json({
        error: 'TEMPORALMENTE_NO_DISPONIBLE',
        razon: solicitud.razon,
        esperarMs: solicitud.esperarMs,
        mensaje: solicitud.mensaje,
        estadoBucket: tokenController.estado().starter,
      });
    }

    // ─────────────────────────────────────────
    // 4. CARGAR CONTEXTO DEL CLIENTE
    // ─────────────────────────────────────────
    const agentesPath = path.join(__dirname, '../../agents', AGENTES[agenteKey]);
    const overlaysPath = path.join(agentesPath, 'overlays', clienteId);

    const fs = require('fs');
    if (!fs.existsSync(overlaysPath)) {
      // Crear overlay básico si no existe
      console.log(`Creando overlay básico para cliente ${clienteId}`);
      fs.mkdirSync(overlaysPath, { recursive: true });
      fs.writeFileSync(
        path.join(overlaysPath, 'USER.md'),
        `# Cliente ${clienteId}\n\nCliente de MyCompi.\n`
      );
      fs.mkdirSync(path.join(overlaysPath, 'memoria'), { recursive: true });
    }

    // Construir contexto completo
    const contexto = buildContext(clienteId);
    const modelo = solicitud.metadata.modelo;

    // ─────────────────────────────────────────
    // 5. LLAMAR AL MODELO
    // ─────────────────────────────────────────
    let respuesta;
    try {
      respuesta = await llamadaModelo(contexto, mensaje, modelo);
    } catch (modelError) {
      console.error('Error llamando al modelo:', modelError);
      return res.status(502).json({ 
        error: 'ERROR_DEL_MODELO',
        mensaje: 'No se pudo generar respuesta. Intenta de nuevo.'
      });
    }

    // ─────────────────────────────────────────
    // 6. REGISTRAR EN MEMORIA
    // ─────────────────────────────────────────
    try {
      logInteraction(clienteId, `Pregunta: ${mensaje}\nRespuesta: ${respuesta}`);
    } catch (logError) {
      console.warn('No se pudo guardar en memoria:', logError.message);
    }

    // ─────────────────────────────────────────
    // 7. RESPUESTA
    // ─────────────────────────────────────────
    const tiempoRespuesta = Date.now() - startTime;

    res.json({
      ok: true,
      agente: agenteKey,
      respuesta,
      sessionId: solicitud.sessionId,
      modeloUsado: modelo,
      metadata: {
        tiempoMs: tiempoRespuesta,
        plan: planCliente,
        turno: solicitud.metadata.turnoActual,
        tokensEstimados: solicitud.metadata.estimacionTokens,
        bucketRestante: solicitud.metadata.remainingBucket,
        // Reporte resumido para mostrar al usuario si quiere
        reporteConsumo: `📊 ${modelo} | In: ${solicitud.metadata.estimacionTokens.input} Out: ${solicitud.metadata.estimacionTokens.output}`,
      },
    });

  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

/**
 * GET /api/chat/estado
 * Estado actual del Token Controller (para dashboard)
 */
router.get('/estado', authMiddleware, async (req, res) => {
  try {
    const estado = tokenController.estado();
    res.json({
      ok: true,
      ...estado,
    });
  } catch (err) {
    console.error('Error obteniendo estado:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

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
      .slice(0, 10);

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

/**
 * GET /api/chat/modelos
 * Modelos disponibles según el plan
 */
router.get('/modelos', authMiddleware, async (req, res) => {
  const { PLANES } = require('../services/tokenController');
  const planCliente = req.clientePlan || 'demo';
  const plan = PLANES[planCliente] || PLANES.demo;

  res.json({
    modeloDefault: plan.modeloDefault,
    modelosPermitidos: plan.modeloPermitidos,
    plan: planCliente,
    nombrePlan: plan.nombre,
  });
});

/**
 * Llamada al modelo de IA via OpenClaw Gateway
 */
async function llamadaModelo(contexto, mensaje, modelo) {
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

  const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
    },
    body: JSON.stringify({
      model: modelo || 'MiniMax-M2.7',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: mensaje }
      ],
      max_tokens: 800,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenClaw API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

module.exports = router;
