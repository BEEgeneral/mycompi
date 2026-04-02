import { useState, useEffect } from 'react'

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n || 0)
}

function formatEur(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)
}

function tiempoRelativo(fecha) {
  if (!fecha) return 'nunca'
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'justo ahora'
  if (mins < 60) return `hace ${mins}m`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  return `hace ${Math.floor(horas / 24)}d`
}

// ─── ROI Card ─────────────────────────────────────────────────────────────
function ROICard({ clientes, agentes, trabajos, mrr }) {
  // Cálculo: cada Compi trabaja ~8h/día × 30 días = 240h/mes
  // Valor hora empleado medio español: ~25€/h
  const horasCompisMes = agentes.length * 240
  const valorHorasEmpleado = horasCompisMes * 25
  const costeMyCompi = mrr || 49
  const ahorro = Math.max(0, valorHorasEmpleado - costeMyCompi)
  const roi = costeMyCompi > 0 ? Math.round(valorHorasEmpleado / costeMyCompi) : 0

  const trabajosCompletados = trabajos.filter(t => t.estado === 'COMPLETADO').length
  const trabajosPendientes = trabajos.filter(t => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO').length

  return (
    <div className="bg-gradient-to-br from-[#2D3261] to-[#3d4080] rounded-2xl p-5 text-white mb-4">
      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">💡 ROI de tu equipo</div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-3xl font-extrabold tabular-nums">{ahorro > 0 ? formatEur(ahorro) : formatEur(0)}</div>
          <div className="text-[10px] opacity-60 mt-0.5">ahorrado este mes vs empleado tradicional</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold tabular-nums">{roi}x</div>
          <div className="text-[10px] opacity-60 mt-0.5">retorno sobre tu inversión</div>
        </div>
      </div>

      <div className="flex gap-6 text-[11px]">
        <div>
          <span className="font-bold">{agentes.length}</span> <span className="opacity-60">Compis activos</span>
        </div>
        <div>
          <span className="font-bold">{trabajosCompletados}</span> <span className="opacity-60">trabajos hechos</span>
        </div>
        <div>
          <span className="font-bold">{trabajosPendientes}</span> <span className="opacity-60">en cola</span>
        </div>
        <div>
          <span className="font-bold">{clientes}</span> <span className="opacity-60">clientes</span>
        </div>
      </div>

      <div className="mt-4 bg-white/10 rounded-xl p-3">
        <div className="text-[10px] font-bold mb-1">📊 Equivalencia laboral</div>
        <div className="text-[11px] opacity-80">
          Tus {agentes.length} Compis = ~{horasCompisMes}h/mes · Valor en empleado: {formatEur(valorHorasEmpleado)}
        </div>
      </div>
    </div>
  )
}

// ─── Agent Activity Card ───────────────────────────────────────────────────
function AgentCard({ agente, trabajos }) {
  const agenteTrabajos = trabajos.filter(t => t.agenteId === agente.id)
  const completados = agenteTrabajos.filter(t => t.estado === 'COMPLETADO').length
  const ultimoTrabajo = agenteTrabajos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
  const emoji = { paco: '🎯', laura: '💬', enzo: '💻', carlos: '💼', elena: '⚙️', diana: '📈', marcos: '📋', valeria: '✅', pelayo: '🤖' }[agente.nombre?.toLowerCase()] || '🤖'
  const ultimo = ultimoTrabajo ? tiempoRelativo(ultimoTrabajo.updatedAt) : 'sin actividad'

  const ACTIVO = agente.activoHeartbeat
  const lastPing = agente.ultimoHeartbeat ? tiempoRelativo(agente.ultimoHeartbeat) : '—'
  const presupuestoUsado = agente.budgetTokensMes > 0
    ? Math.round((agente.tokensUsadosMes / agente.budgetTokensMes) * 100)
    : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#FFD154] transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <div className="font-bold text-gray-900 text-sm">{agente.nombre}</div>
            <div className="text-[10px] text-gray-400">{agente.especialidad}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ACTIVO ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {ACTIVO ? '● activo' : '○ pausa'}
          </span>
          {presupuestoUsado > 0 && (
            <div className="w-16 bg-gray-100 rounded-full h-1">
              <div className={`h-full rounded-full ${presupuestoUsado > 80 ? 'bg-red-400' : 'bg-[#FFD154]'}`}
                style={{ width: `${Math.min(100, presupuestoUsado)}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] mt-3">
        <div className="text-center bg-gray-50 rounded-lg py-1.5">
          <div className="font-bold text-gray-900">{completados}</div>
          <div className="text-gray-400">hechos</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-1.5">
          <div className="font-bold text-gray-900">{agenteTrabajos.length}</div>
          <div className="text-gray-400">total</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-1.5">
          <div className="font-bold text-gray-900">{lastPing}</div>
          <div className="text-gray-400">latido</div>
        </div>
      </div>

      {ultimoTrabajo && (
        <div className="mt-2 text-[9px] text-gray-400 truncate">
          Último: {ultimoTrabajo.titulo || ultimoTrabajo.descripcion?.slice(0, 40) || '—'}
        </div>
      )}
    </div>
  )
}

// ─── Alert Banner ───────────────────────────────────────────────────────────
function AlertBanner({ type, title, body, action }) {
  const styles = {
    ok:     { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', title: 'text-green-800', body: 'text-green-600' },
    warn:   { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400', title: 'text-amber-800', body: 'text-amber-600' },
    danger: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', title: 'text-red-800', body: 'text-red-600' },
    info:   { bg: 'bg-sky-50 border-sky-200', dot: 'bg-sky-400', title: 'text-sky-800', body: 'text-sky-600' },
  }
  const s = styles[type] || styles.info
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border mb-3 ${s.bg}`}>
      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold ${s.title}`}>{title}</div>
        {body && <div className={`text-[10px] mt-0.5 ${s.body}`}>{body}</div>}
        {action && <div className="text-[10px] mt-1 text-gray-400">{action}</div>}
      </div>
    </div>
  )
}

// ─── Funnel Viz ────────────────────────────────────────────────────────────
function Funnel({ datos }) {
  const etapas = [
    { label: 'Registrados', key: 'registros', color: '#2D3261' },
    { label: 'Email verificado', key: 'emailVerificado', color: '#4f56a8' },
    { label: 'Primer acceso', key: 'primerAcceso', color: '#FFD154' },
    { label: 'Primer mensaje', key: 'primerMensaje', color: '#34d399' },
    { label: 'Retenido', key: 'retenido', color: '#059669' },
  ]
  const max = datos?.registros || 1

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs font-bold text-gray-700 mb-3">�漏 Embudo de conversión</div>
      <div className="space-y-2">
        {etapas.map((etapa, i) => {
          const val = datos?.[etapa.key] || 0
          const pct = Math.round((val / max) * 100)
          return (
            <div key={etapa.key} className="flex items-center gap-2">
              <div className="w-20 text-[10px] text-gray-500 text-right">{etapa.label}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className="h-full rounded-full transition-all flex items-center justify-end pr-1"
                  style={{ width: `${Math.max(4, pct)}%`, backgroundColor: etapa.color, minWidth: 20 }}>
                  {pct > 0 && <span className="text-[8px] font-bold text-white">{val}</span>}
                </div>
              </div>
              <div className="w-8 text-[10px] text-gray-400">{pct}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Aprobaciones Pendientes ──────────────────────────────────────────────
function AprobacionesCard({ trabajos, apiCall }) {
  const pendientes = trabajos.filter(t => t.requiereAprobacion && !t.aprobadoPor).slice(0, 5)

  if (pendientes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-xs font-bold text-gray-700 mb-2">⚠️ Aprobaciones pendientes</div>
        <div className="text-[11px] text-green-600 font-semibold">✅ Sin trabajos pendientes de aprobación</div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-4">
      <div className="text-xs font-bold text-amber-700 mb-3">⚠️ {pendientes.length} trabajo{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''} de aprobación</div>
      <div className="space-y-2">
        {pendientes.map(t => (
          <div key={t.id} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-gray-800 truncate">{t.titulo || t.descripcion?.slice(0, 35) || 'Sin título'}</div>
              <div className="text-[9px] text-gray-400">{t.agente?.nombre || '—'} · {tiempoRelativo(t.createdAt)}</div>
            </div>
            <a href="/admin" className="text-[10px] font-bold text-amber-600 hover:text-amber-800 ml-2">Revisar →</a>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BusinessMetricsTab({ apiCall }) {
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState([])
  const [agentes, setAgentes] = useState([])
  const [trabajos, setTrabajos] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [error, setError] = useState(null)

  const cargarTodo = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cli, ag, trab, met] = await Promise.all([
        apiCall('/api/clientes?limit=50'),
        apiCall('/api/agentes?limit=50'),
        apiCall('/api/trabajos?limit=100'),
        apiCall('/api/admin/metrics/business').catch(() => null),
      ])
      setClientes(cli.clientes || [])
      setAgentes(ag.agentes || [])
      setTrabajos(trab.trabajos || [])
      if (met) setMetricas(met)
    } catch (e) {
      console.error(e)
      setError('No se pudieron cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarTodo() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-400 text-sm animate-pulse">Cargando métricas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-sm mb-3">{error}</div>
        <button onClick={cargarTodo} className="text-xs text-indigo-600 font-bold hover:underline">Reintentar</button>
      </div>
    )
  }

  const clientesActivos = clientes.filter(c => c.activo)
  const agentesActivos = agentes.filter(a => a.activoHeartbeat)
  const agentesInactivos = agentes.filter(a => !a.activoHeartbeat)
  const funnel = metricas?.funnel || { registros: clientes.length, emailVerificado: clientes.length, primerAcceso: clientesActivos.length, primerMensaje: 0, retenido: 0 }

  return (
    <div className="space-y-4 p-1">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">💰 Ingresos</div>
          <div className="text-2xl font-extrabold text-[#2D3261]">{formatEur(metricas?.mrr || 49)}<span className="text-xs font-normal text-gray-400">/mes</span></div>
          <div className="text-[10px] text-gray-400 mt-0.5">MRR</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">👥 Clientes</div>
          <div className="text-2xl font-extrabold text-[#2D3261]">{clientesActivos.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{clientes.length} registrados</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">🤖 Compis</div>
          <div className="text-2xl font-extrabold text-[#2D3261]">{agentesActivos.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{agentesActivos.length}/{agentes.length} activos</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">📋 Jobs</div>
          <div className="text-2xl font-extrabold text-[#2D3261]">{trabajos.filter(t=>t.estado==='COMPLETADO').length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{trabajos.length} totales</div>
        </div>
      </div>

      {/* ROI Card */}
      <ROICard
        clientes={clientesActivos.length}
        agentes={agentesActivos}
        trabajos={trabajos}
        mrr={metricas?.mrr || 49}
      />

      {/* Alerts */}
      {agentesInactivos.length > 0 && (
        <AlertBanner type="warn" title={`${agentesInactivos.length} Compi${agentesInactivos.length > 1 ? 's' : ''} pausado${agentesInactivos.length > 1 ? 's' : ''}`}
          body={`${agentesInactivos.map(a => a.nombre).join(', ')} no han batido en las últimas horas`} />
      )}
      {metricas?.diasTrialRestantes <= 3 && metricas?.diasTrialRestantes > 0 && (
        <AlertBanner type="danger" title="Trial por terminar"
          body={`${metricas.diasTrialRestantes} día${metricas.diasTrialRestantes > 1 ? 's' : ''} para fin del trial`} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Compis Grid */}
        <div>
          <div className="text-xs font-bold text-gray-700 mb-3">🤖 Estado de tus Compis</div>
          <div className="grid grid-cols-1 gap-2">
            {agentes.map(a => (
              <AgentCard key={a.id} agente={a} trabajos={trabajos.filter(t => t.agenteId === a.id)} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Funnel */}
          <Funnel datos={funnel} />

          {/* Aprobaciones */}
          <AprobacionesCard trabajos={trabajos} apiCall={apiCall} />

          {/* Budget alerts */}
          {agentes.filter(a => {
            const pct = a.budgetTokensMes > 0 ? (a.tokensUsadosMes / a.budgetTokensMes) * 100 : 0
            return pct >= 80
          }).map(a => {
            const pct = Math.round((a.tokensUsadosMes / a.budgetTokensMes) * 100)
            return (
              <AlertBanner key={a.id} type="warn"
                title={`${a.nombre} al ${pct}% del presupuesto`}
                body="Tokens consumidos este mes" />
            )
          })}
        </div>
      </div>
    </div>
  )
}
