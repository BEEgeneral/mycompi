/**
 * tokenController.js — Gestor de requests y budget de API
 * 
 * Controla el consumo de la API de MiniMax para evitar exceder los límites
 * del plan Starter ($10/mes = 1500 requests / 5 horas)
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// CONFIGURACIÓN DE PLANES
// ─────────────────────────────────────────────

const PLANES = {
  demo: {
    nombre: 'Demo Beta',
    requestsPorHora: 20,        // ~1500/5hrs pero muy limitado
    maxTokensPorRequest: 500,  // Solo Haiku
    modeloDefault: 'MiniMax-M2.7',
    modeloPermitidos: ['MiniMax-M2.7'], // Solo el base
    precioEuros: 0,
  },
  basico: {
    nombre: 'Básico',
    requestsPorHora: 100,      // 1500/5hrs pero con más capacidad
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
// ESTADO DEL CONTROLLER (en memoria, no persiste)
// ─────────────────────────────────────────────

class TokenController {
  constructor() {
    // Contadores por plan (reset cada 5 horas según el bucket de MiniMax)
    this.contadores = {
      demo: { consumidos: 0, ventanaInicio: Date.now() },
      basico: { consumidos: 0, ventanaInicio: Date.now() },
      equipo: { consumidos: 0, ventanaInicio: Date.now() },
      direccion: { consumidos: 0, ventanaInicio: Date.now() },
    };

    // Cola de requests en espera
    this.cola = [];

    // Lock global para no exceder 1500 requests/5hrs (Starter)
    this.starterBucket = {
      consumidos: 0,
      maximos: 1500, // del plan Starter
      ventanaInicio: Date.now(),
      resetIntervalMs: 5 * 60 * 60 * 1000, // 5 horas
    };

    // Settings
    this.config = {
      starterMode: true, // Limita a 1500 requests/5hrs global
      demoMode: true,    // Limita a 20 requests/hora en demo
      maxColaSize: 100,
      requestTimeoutMs: 30000, // 30s max esperando en cola
    };

    // Persistencia de logs (para dashboard)
    this.logPath = path.join(__dirname, '../../data');
    this.logsFile = path.join(this.logPath, 'token-logs.json');
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
  // ─────────────────────────────────────────────

  /**
   * Solicita usar la API. Devuelve:
   * { ok: true, puedeProcesar: true, ejecutar: fn }
   * { ok: true, puedeProcesar: false, esperarMs: 1234 }
   * { ok: false, error: 'BUDGET_EXCEDED', mensaje: '...' }
   */
  async solicitar(clienteId, plan, requestData) {
    // 1. Verificar si el bucket global Starter permite
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

    // 2. Verificar límite del plan específico
    const planConfig = PLANES[plan] || PLANES.demo;
    this._checkPlanReset(plan);
    
    const contadorPlan = this.contadores[plan];
    if (contadorPlan.consumidos >= planConfig.requestsPorHora) {
      return {
        ok: true,
        puedeProcesar: false,
        esperarMs: 3600000, // 1 hora hasta reset del plan
        razon: 'PLAN_LIMIT_EXCEDED',
        mensaje: `Has excedido tu límite de ${planConfig.requestsPorHora} requests/hora. Upgrade tu plan para más capacidad.`,
      };
    }

    // 3. Si hay cola y estamos en demo, verificar también límite demo
    if (plan === 'demo' && this.config.demoMode) {
      const enCola = this.cola.filter(r => r.plan === 'demo').length;
      if (enCola >= 5) {
        return {
          ok: true,
          puedeProcesar: false,
          esperarMs: this._estimateColaWait(),
          razon: 'DEMO_COLA_LLENA',
          mensaje: 'Demo con mucha demanda. Puedes esperar o hacer upgrade a Básico.',
        };
      }
    }

    // 4. Todo OK — marcar como usado y devolver función de ejecución
    this.contadores[plan].consumidos++;
    this.starterBucket.consumidos++;

    const estimacionTokens = this._estimarTokens(requestData);
    const modelo = this._seleccionarModelo(requestData, planConfig);

    return {
      ok: true,
      puedeProcesar: true,
      ejecutar: this._crearFnEjecutar(clienteId, plan, modelo, estimacionTokens),
      metadata: {
        plan,
        modelo,
        estimacionTokens,
        consumidosBucket: this.starterBucket.consumidos,
        remainingBucket: this.starterBucket.maximos - this.starterBucket.consumidos,
      },
    };
  }

  /**
   * Obtener estado actual (para dashboard)
   */
  estado() {
    this._checkBucketReset();
    
    return {
      starter: {
        consumidos: this.starterBucket.consumidos,
        maximos: this.starterBucket.maximos,
        restante: this.starterBucket.maximos - this.starterBucket.consumidos,
        resetEnMs: this.starterBucket.resetIntervalMs - (Date.now() - this.starterBucket.ventanaInicio),
      },
      planes: Object.entries(this.contadores).reduce((acc, [plan, data]) => {
        acc[plan] = {
          consumidos: data.consumidos,
          limite: PLANES[plan]?.requestsPorHora || 0,
        };
        return acc;
      }, {}),
      colaSize: this.cola.length,
      config: {
        starterMode: this.config.starterMode,
        demoMode: this.config.demoMode,
      },
    };
  }

  /**
   * Obtener modelo sugerido para un request
   */
  getModeloSugerido(plan, complejidad) {
    const planConfig = PLANES[plan] || PLANES.demo;
    
    // En starter/demo, siempre MiniMax-M2.7 base
    if (this.config.starterMode || plan === 'demo') {
      return 'MiniMax-M2.7';
    }

    if (complejidad === 'alta') {
      return planConfig.modeloPermitidos.includes('MiniMax-M2.7-highspeed') 
        ? 'MiniMax-M2.7-highspeed' 
        : planConfig.modeloDefault;
    }
    
    return planConfig.modeloDefault;
  }

  // ─────────────────────────────────────────────
  // FUNCIONES PRIVADAS
  // ─────────────────────────────────────────────

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
    if (elapsed >= 3600000) { // 1 hora
      this.contadores[plan].consumidos = 0;
      this.contadores[plan].ventanaInicio = Date.now();
    }
  }

  _estimarTokens(requestData) {
    // Estimación simple basada en longitud del mensaje
    const texto = requestData.mensaje || '';
    const promptSistema = 9000; // SOUL + IDENTITY + SKILL + MEMORY + overlay
    const tokensInput = Math.ceil(texto.length / 4) + promptSistema;
    const tokensOutput = Math.min(1000, Math.ceil(texto.length * 1.5));
    return tokensInput + tokensOutput;
  }

  _seleccionarModelo(requestData, planConfig) {
    const complejidad = requestData.complejidad || 'baja';
    const longitud = (requestData.mensaje || '').length;

    // En starter/demo, siempre el modelo base
    if (this.config.starterMode) {
      return 'MiniMax-M2.7';
    }

    // Alta complejidad o mensaje largo → modelo más capaz
    if (complejidad === 'alta' || longitud > 2000) {
      return planConfig.modeloPermitidos.includes('MiniMax-M2.7-highspeed')
        ? 'MiniMax-M2.7-highspeed'
        : planConfig.modeloDefault;
    }

    return planConfig.modeloDefault;
  }

  _crearFnEjecutar(clienteId, plan, modelo, estimacionTokens) {
    // Esta función se devuelve al controller para que la llame cuando quiera
    return async (fnEjecutar) => {
      try {
        const resultado = await fnEjecutar(modelo);
        
        // Log del consumo
        this._logConsumo(clienteId, plan, modelo, estimacionTokens);
        
        return resultado;
      } catch (err) {
        // Si falla, no devolvemos los tokens al contador (ya se descontaron)
        throw err;
      }
    };
  }

  _estimateColaWait() {
    // Estimación: ~12 segundos por request en Starter
    return this.cola.length * 12000;
  }

  _logConsumo(clienteId, plan, modelo, tokens) {
    const entry = {
      timestamp: new Date().toISOString(),
      clienteId,
      plan,
      modelo,
      tokensEstimados: tokens,
    };

    try {
      const logs = JSON.parse(fs.readFileSync(this.logsFile, 'utf8'));
      logs.push(entry);
      // Mantener solo últimos 1000 entries
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      fs.writeFileSync(this.logsFile, JSON.stringify(logs));
    } catch (err) {
      console.error('Error guardando log de tokens:', err);
    }
  }
}

// Singleton
const tokenController = new TokenController();

module.exports = tokenController;
module.exports.PLANES = PLANES;
