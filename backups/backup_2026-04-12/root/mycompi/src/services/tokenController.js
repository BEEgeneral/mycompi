/**
 * tokenController.js — Gestor de requests, budget y métricas de tokens
 *
 * Controla el consumo de API y reporta métricas para el dashboard de MyCompi:
 * - Conteo de turnos por sesión
 * - Clasificación de tokens (Input, Output, Cache Write, Cache Read)
 * - Ratio de eficiencia (tokens/turno)
 * - Costo estimado por modelo
 * - Reporte final de consumo
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE MODELOS Y COSTOS
// ─────────────────────────────────────────────

// Precios por 1M tokens (aproximados, ajustar según провайдер real)
const MODELOS = {
  'MiniMax-M2.7': {
    input: 0.30,      // $0.30 / 1M tokens input
    output: 0.30,     // $0.30 / 1M tokens output
    cacheWrite: 0.10, // Cache write (más barato)
    cacheRead: 0.03,  // Cache read (muy barato)
    nombre: 'MiniMax M2.7',
    tier: 'haiku',    // Haiku-tier
  },
  'MiniMax-M2.7-highspeed': {
    input: 0.50,
    output: 0.50,
    cacheWrite: 0.15,
    cacheRead: 0.05,
    nombre: 'MiniMax M2.7 (High Speed)',
    tier: 'sonnet',   // Sonnet-tier
  },
};

// Fallback si no se reconoce el modelo
const MODELO_DEFAULT = MODELOS['MiniMax-M2.7'];

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE PLANES
// ─────────────────────────────────────────────

const PLANES = {
  demo: {
    nombre: 'Demo Beta',
    requestsPorHora: 20,
    maxTokensPorRequest: 500,
    modeloDefault: 'MiniMax-M2.7',
    modeloPermitidos: ['MiniMax-M2.7'],
    precioEuros: 0,
  },
  basico: {
    nombre: 'Básico',
    requestsPorHora: 100,
    maxTokensPorRequest: 2000,
    modeloDefault: 'MiniMax-M2.7',
    modeloPermitidos: ['MiniMax-M2.7'],
    precioEuros: 147,
  },
  equipo: {
    nombre: 'Equipo',
    requestsPorHora: 500,
    maxTokensPorRequest: 8000,
    modeloDefault: 'MiniMax-M2.7',
    modeloPermitidos: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed'],
    precioEuros: 497,
  },
  direccion: {
    nombre: 'Dirección',
    requestsPorHora: 1500,
    maxTokensPorRequest: 32000,
    modeloDefault: 'MiniMax-M2.7-highspeed',
    modeloPermitidos: ['MiniMax-M2.7', 'MiniMax-M2.7-highspeed'],
    precioEuros: 1320,
  },
};

// ─────────────────────────────────────────────
// ESTADO DEL CONTROLLER
// ─────────────────────────────────────────────

class TokenController {
  constructor() {
    // Contadores por plan (reset cada hora)
    this.contadores = {
      demo: { consumidos: 0, ventanaInicio: Date.now() },
      basico: { consumidos: 0, ventanaInicio: Date.now() },
      equipo: { consumidos: 0, ventanaInicio: Date.now() },
      direccion: { consumidos: 0, ventanaInicio: Date.now() },
    };

    // Cola de requests en espera
    this.cola = [];

    // Bucket global Starter (1500 requests / 5 horas)
    this.starterBucket = {
      consumidos: 0,
      maximos: 1500,
      ventanaInicio: Date.now(),
      resetIntervalMs: 5 * 60 * 60 * 1000,
    };

    // Sesiones activas — para tracking de turnos y métricas
    // { sessionId: { clienteId, plan, modelo, turnos, tokens: { input, output, cacheWrite, cacheRead }, inicio } }
    this.sesiones = new Map();

    // Settings
    this.config = {
      starterMode: true,
      demoMode: true,
      maxColaSize: 100,
      requestTimeoutMs: 30000,
    };

    // Persistencia
    this.logPath = path.join(__dirname, '../../data');
    this.logsFile = path.join(this.logPath, 'token-logs.json');
    this.sessionsFile = path.join(this.logPath, 'sessions.json');
    this._initLogs();
  }

  _initLogs() {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
    if (!fs.existsSync(this.logsFile)) {
      fs.writeFileSync(this.logsFile, JSON.stringify([]));
    }
  }

  // ─────────────────────────────────────────────
  // API PÚBLICA
  // ─────────────────────────────────────────

  /**
   * Solicita usar la API. Devuelve:
   * { ok: true, puedeProcesar: true, sessionId, metadata }
   * { ok: true, puedeProcesar: false, esperarMs, razon }
   */
  async solicitar(clienteId, plan, requestData = {}) {
    const sessionId = requestData.sessionId || this._generarSessionId();

    // 1. Verificar bucket global Starter
    if (this.config.starterMode) {
      this._checkBucketReset();

      if (this.starterBucket.consumidos >= this.starterBucket.maximos) {
        const esperarMs = this.starterBucket.resetIntervalMs - (Date.now() - this.starterBucket.ventanaInicio);
        return {
          ok: true,
          puedeProcesar: false,
          esperarMs,
          razon: 'BUCKET_STARTER_LLENO',
          mensaje: `Límite global alcanzado. Espera ${Math.ceil(esperarMs/60000)} min.`,
        };
      }
    }

    // 2. Verificar límite del plan
    const planConfig = PLANES[plan] || PLANES.demo;
    this._checkPlanReset(plan);

    const contadorPlan = this.contadores[plan];
    if (contadorPlan.consumidos >= planConfig.requestsPorHora) {
      return {
        ok: true,
        puedeProcesar: false,
        esperarMs: 3600000,
        razon: 'PLAN_LIMIT_EXCEDED',
        mensaje: `Has excedido tu límite de ${planConfig.requestsPorHora} requests/hora.`,
      };
    }

    // 3. Marcar como usado
    this.contadores[plan].consumidos++;
    this.starterBucket.consumidos++;

    // 4. Iniciar o continuar sesión
    let sesion = this.sesiones.get(sessionId);
    if (!sesion) {
      sesion = {
        clienteId,
        plan,
        modelo: this._seleccionarModelo(requestData, planConfig),
        turnos: 0,
        tokens: { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 },
        inicio: Date.now(),
      };
      this.sesiones.set(sessionId, sesion);
    }

    sesion.turnos++;

    const estimacion = this._estimarTokens(requestData);
    sesion.tokens.input += estimacion.input;
    sesion.tokens.output += estimacion.output;

    return {
      ok: true,
      puedeProcesar: true,
      sessionId,
      metadata: {
        plan,
        modelo: sesion.modelo,
        estimacionTokens: estimacion,
        consumidosBucket: this.starterBucket.consumidos,
        remainingBucket: this.starterBucket.maximos - this.starterBucket.consumidos,
        turnoActual: sesion.turnos,
      },
    };
  }

  /**
   * Registra el resultado de una llamada al modelo (para afinar métricas)
   * Llamar DESPUÉS de recibir respuesta del modelo
   */
  registrarLlamada(sessionId, resultado) {
    const sesion = this.sesiones.get(sessionId);
    if (!sesion) return;

    // Actualizar con datos reales si vienen del provider
    if (resultado.usage) {
      sesion.tokens.input = resultado.usage.prompt_tokens || sesion.tokens.input;
      sesion.tokens.output = resultado.usage.completion_tokens || sesion.tokens.output;
      sesion.tokens.cacheWrite = resultado.usage.prompt_cache_tokens || 0;
      sesion.tokens.cacheRead = resultado.usage.prompt_cache_hits || 0;
    }
  }

  /**
   * Finaliza una sesión y devuelve el reporte de consumo
   */
  cerrarSesion(sessionId) {
    const sesion = this.sesiones.get(sessionId);
    if (!sesion) return null;

    const reporte = this._generarReporte(sesion);

    // Guardar en logs
    this._logConsumo(sesion, reporte);

    // Guardar en sessions history
    this._guardarSesion(sesion, reporte);

    // Limpiar sesión activa
    this.sesiones.delete(sessionId);

    return reporte;
  }

  /**
   * Obtener estado actual (para dashboard)
   */
  estado() {
    this._checkBucketReset();

    // Métricas agregadas del día
    const metricasDia = this._getMetricsDia();

    return {
      starter: {
        consumidos: this.starterBucket.consumidos,
        maximos: this.starterBucket.maximos,
        restante: this.starterBucket.maximos - this.starterBucket.consumidos,
        resetEnMs: this.starterBucket.resetIntervalMs - (Date.now() - this.starterBucket.ventanaInicio),
      },
      planes: Object.entries(this.contadores).reduce((acc, [plan, data]) => {
        const planConfig = PLANES[plan];
        acc[plan] = {
          consumidos: data.consumidos,
          limite: planConfig?.requestsPorHora || 0,
        };
        return acc;
      }, {}),
      colaSize: this.cola.length,
      sesionesActivas: this.sesiones.size,
      metricasDia,
      modelos: Object.entries(MODELOS).reduce((acc, [id, cfg]) => {
        acc[id] = { nombre: cfg.nombre, tier: cfg.tier };
        return acc;
      }, {}),
    };
  }

  /**
   * Obtener métricas detalladas de un cliente (para dashboard admin)
   */
  metricasCliente(clienteId) {
    const logs = this._leerLogs();
    const delCliente = logs.filter(l => l.clienteId === clienteId);

    if (delCliente.length === 0) {
      return { clienteId, mensaje: 'Sin datos' };
    }

    // Agregar
    const totalTokens = delCliente.reduce((sum, l) => sum + l.tokens.total, 0);
    const totalTurnos = delCliente.reduce((sum, l) => sum + l.turnos, 0);
    const costoTotal = delCliente.reduce((sum, l) => sum + l.costoEstimado, 0);

    // Por modelo
    const porModelo = {};
    delCliente.forEach(l => {
      if (!porModelo[l.modelo]) {
        porModelo[l.modelo] = { tokens: 0, turnos: 0, costo: 0 };
      }
      porModelo[l.modelo].tokens += l.tokens.total;
      porModelo[l.modelo].turnos += l.turnos;
      porModelo[l.modelo].costo += l.costoEstimado;
    });

    // Por día (últimos 7)
    const porDia = {};
    delCliente.forEach(l => {
      const dia = l.timestamp.split('T')[0];
      if (!porDia[dia]) porDia[dia] = { tokens: 0, turnos: 0, costo: 0 };
      porDia[dia].tokens += l.tokens.total;
      porDia[dia].turnos += l.turnos;
      porDia[dia].costo += l.costoEstimado;
    });

    return {
      clienteId,
      resumen: {
        totalTokens,
        totalTurnos,
        costoEstimadoTotal: costoTotal,
        eficienciaPromedio: totalTurnos > 0 ? Math.round(totalTokens / totalTurnos) : 0,
      },
      porModelo,
      porDia,
      sessionsCount: delCliente.length,
    };
  }

  /**
   * Dashboard completo de costos (para admin)
   */
  dashboard() {
    const logs = this._leerLogs();
    const metricasDia = this._getMetricsDia();

    // Gasto total
    const gastoTotal = logs.reduce((sum, l) => sum + l.costoEstimado, 0);
    const tokensTotal = logs.reduce((sum, l) => sum + l.tokens.total, 0);
    const turnosTotal = logs.reduce((sum, l) => sum + l.turnos, 0);

    // Top clientes
    const porCliente = {};
    logs.forEach(l => {
      if (!porCliente[l.clienteId]) {
        porCliente[l.clienteId] = { tokens: 0, costo: 0, turnos: 0, agentes: {} };
      }
      porCliente[l.clienteId].tokens += l.tokens.total;
      porCliente[l.clienteId].costo += l.costoEstimado;
      porCliente[l.clienteId].turnos += l.turnos;
      // por agente
      if (l.agente) {
        if (!porCliente[l.clienteId].agentes[l.agente]) {
          porCliente[l.clienteId].agentes[l.agente] = { tokens: 0, costo: 0, turnos: 0 };
        }
        porCliente[l.clienteId].agentes[l.agente].tokens += l.tokens.total;
        porCliente[l.clienteId].agentes[l.agente].costo += l.costoEstimado;
        porCliente[l.clienteId].agentes[l.agente].turnos += l.turnos;
      }
    });

    const topClientes = Object.entries(porCliente)
      .sort((a, b) => b[1].costo - a[1].costo)
      .slice(0, 10)
      .map(([id, data]) => ({ clienteId: id, ...data }));

    // Por agente
    const porAgente = {};
    logs.forEach(l => {
      if (!l.agente) return;
      if (!porAgente[l.agente]) {
        porAgente[l.agente] = { tokens: 0, costo: 0, turnos: 0, clientes: {} };
      }
      porAgente[l.agente].tokens += l.tokens.total;
      porAgente[l.agente].costo += l.costoEstimado;
      porAgente[l.agente].turnos += l.turnos;
      if (!porAgente[l.agente].clientes[l.clienteId]) {
        porAgente[l.agente].clientes[l.clienteId] = { tokens: 0, costo: 0, turnos: 0 };
      }
      porAgente[l.agente].clientes[l.clienteId].tokens += l.tokens.total;
      porAgente[l.agente].clientes[l.clienteId].costo += l.costoEstimado;
      porAgente[l.agente].clientes[l.clienteId].turnos += l.turnos;
    });

    const agentes = Object.entries(porAgente)
      .sort((a, b) => b[1].costo - a[1].costo)
      .map(([id, data]) => ({ agenteId: id, ...data }));

    return {
      resumen: {
        gastoTotal,
        tokensTotal,
        turnosTotal,
        eficienciaGlobal: turnosTotal > 0 ? Math.round(tokensTotal / turnosTotal) : 0,
        sessionsTotales: logs.length,
      },
      metricasDia,
      agentes,
      topClientes,
      modeloActual: MODELO_DEFAULT.nombre,
    };
  }

  // ─────────────────────────────────────────────
  // FUNCIONES PRIVADAS
  // ─────────────────────────────────────────

  _generarSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _checkBucketReset() {
    const elapsed = Date.now() - this.starterBucket.ventanaInicio;
    if (elapsed >= this.starterBucket.resetIntervalMs) {
      console.log('🔄 TokenController: Reset bucket Starter');
      this.starterBucket.consumidos = 0;
      this.starterBucket.ventanaInicio = Date.now();
    }
  }

  _checkPlanReset(plan) {
    const elapsed = Date.now() - this.contadores[plan].ventanaInicio;
    if (elapsed >= 3600000) {
      this.contadores[plan].consumidos = 0;
      this.contadores[plan].ventanaInicio = Date.now();
    }
  }

  _estimarTokens(requestData) {
    // Estimación basada en el mensaje
    const texto = requestData.mensaje || '';
    const tokensInput = Math.ceil(texto.length / 4) + 1000; // prompt del sistema ~1000 tokens
    const tokensOutput = Math.min(800, Math.ceil(texto.length * 1.2));

    return {
      input: tokensInput,
      output: tokensOutput,
      cacheWrite: 0,
      cacheRead: 0,
    };
  }

  _seleccionarModelo(requestData, planConfig) {
    const complejidad = requestData.complejidad || 'baja';
    const longitud = (requestData.mensaje || '').length;

    if (this.config.starterMode || planConfig === PLANES.demo) {
      return 'MiniMax-M2.7';
    }

    if (complejidad === 'alta' || longitud > 2000) {
      return planConfig.modeloPermitidos.includes('MiniMax-M2.7-highspeed')
        ? 'MiniMax-M2.7-highspeed'
        : planConfig.modeloDefault;
    }

    return planConfig.modeloDefault;
  }

  _calcularCosto(modelo, tokens) {
    const cfg = MODELOS[modelo] || MODELO_DEFAULT;

    const costoInput = (tokens.input / 1_000_000) * cfg.input;
    const costoOutput = (tokens.output / 1_000_000) * cfg.output;
    const costoCacheWrite = (tokens.cacheWrite / 1_000_000) * cfg.cacheWrite;
    const costoCacheRead = (tokens.cacheRead / 1_000_000) * cfg.cacheRead;

    return costoInput + costoOutput + costoCacheWrite + costoCacheRead;
  }

  _generarReporte(sesion) {
    const tokensTotal = sesion.tokens.input + sesion.tokens.output + sesion.tokens.cacheWrite + sesion.tokens.cacheRead;
    const costo = this._calcularCosto(sesion.modelo, sesion.tokens);
    const eficiencia = sesion.turnos > 0 ? Math.round(tokensTotal / sesion.turnos) : 0;
    const duracionMs = Date.now() - sesion.inicio;

    return {
      sessionId: sesion.sessionId || 'unknown',
      clienteId: sesion.clienteId,
      plan: sesion.plan,
      modelo: sesion.modelo,
      modeloNombre: (MODELOS[sesion.modelo] || MODELO_DEFAULT).nombre,
      tier: (MODELOS[sesion.modelo] || MODELO_DEFAULT).tier,
      turnos: sesion.turnos,
      tokens: {
        input: sesion.tokens.input,
        output: sesion.tokens.output,
        cacheWrite: sesion.tokens.cacheWrite,
        cacheRead: sesion.tokens.cacheRead,
        total: tokensTotal,
      },
      costoEstimado: Math.round(costo * 10000) / 10000, // 4 decimales en $
      eficiencia, // tokens por turno
      duracionMs,
      timestamp: new Date().toISOString(),
      // Para mostrar en chat: "📊 Reporte de Consumo: ..."
      resumenChat: `📊 **Consumo:** ${sesion.modelo} | In: ${sesion.tokens.input} Out: ${sesion.tokens.output} | $${costo.toFixed(4)} | Eff: ${eficiencia} tok/turno`,
    };
  }

  _logConsumo(sesion, reporte) {
    try {
      const logs = JSON.parse(fs.readFileSync(this.logsFile, 'utf8'));
      logs.push({
        timestamp: reporte.timestamp,
        clienteId: sesion.clienteId,
        agente: sesion.agente || null,
        plan: sesion.plan,
        sessionId: reporte.sessionId,
        modelo: reporte.modelo,
        turnos: reporte.turnos,
        tokens: reporte.tokens,
        costoEstimado: reporte.costoEstimado,
        eficiencia: reporte.eficiencia,
        duracionMs: reporte.duracionMs,
      });
      if (logs.length > 5000) {
        logs.splice(0, logs.length - 5000);
      }
      fs.writeFileSync(this.logsFile, JSON.stringify(logs));
    } catch (err) {
      console.error('Error guardando log de tokens:', err);
    }
  }

  _leerLogs() {
    try {
      return JSON.parse(fs.readFileSync(this.logsFile, 'utf8'));
    } catch {
      return [];
    }
  }

  _getMetricsDia() {
    const logs = this._leerLogs();
    const hoy = new Date().toISOString().split('T')[0];

    const hoyLogs = logs.filter(l => l.timestamp.startsWith(hoy));

    return {
      tokens: hoyLogs.reduce((sum, l) => sum + l.tokens.total, 0),
      turnos: hoyLogs.reduce((sum, l) => sum + l.turnos, 0),
      costo: hoyLogs.reduce((sum, l) => sum + l.costoEstimado, 0),
      sessions: hoyLogs.length,
    };
  }

  _guardarSesion(sesion, reporte) {
    try {
      const sessions = JSON.parse(fs.readFileSync(this.sessionsFile, 'utf8') || '[]');
      sessions.push(reporte);
      if (sessions.length > 1000) {
        sessions.splice(0, sessions.length - 1000);
      }
      fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  }
}

// Singleton
const tokenController = new TokenController();

module.exports = tokenController;
module.exports.PLANES = PLANES;
module.exports.MODELOS = MODELOS;
