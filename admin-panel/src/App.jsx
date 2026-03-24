import { useState, useEffect, useCallback } from 'react'
import HierarchyView from './components/HierarchyView'

const API = ''

// ─── Bar Chart ───────────────────────────────────────────────
function SpendChart({ agentes, metricas }) {
  if (!metricas?.agentes?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Gasto por Agente</h3>
        <div className="text-sm text-gray-400 text-center py-12">
          Sin datos aún. Los agentes generarán métricas al procesar requests.
        </div>
      </div>
    )
  }

  const sorted = [...metricas.agentes].sort((a, b) => b.costo - a.costo)
  const max = sorted[0]?.costo || 1

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4">Gasto por Agente</h3>
      <div className="space-y-2">
        {sorted.map(a => {
          const pct = Math.min(100, (a.costo / max) * 100)
          return (
            <div
              key={a.agenteId}
              className="flex items-center gap-3"
            >
              <div className="w-28 text-xs font-semibold text-gray-600 truncate">{a.agenteId}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-20 text-right text-xs font-bold text-gray-800 tabular-nums">
                ${a.costo.toFixed(4)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agent List ──────────────────────────────────────────────
function AgentList({ agentes, selected, onSelect, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">Cargando...</div>
    )
  }
  if (!agentes.length) {
    return (
      <div className="text-center py-12">
        <div className="text-sm text-gray-400 mb-4">Conecta con el Owner Key para ver agentes</div>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      {agentes.map(a => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
            selected?.id === a.id
              ? 'bg-indigo-50 border border-indigo-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
            {a.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">{a.nombre}</div>
            <div className="text-xs text-gray-400 truncate">{a.tipo}</div>
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.activo ? 'bg-green-400' : 'bg-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

// ─── Agent Detail ───────────────────────────────────────────
function AgentDetail({ agente, metricas, apiCall, onRecargar }) {
  if (!agente) return null

  const agenteMet = metricas?.agentes?.find(a => a.agenteId === agente.id)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
              {agente.emoji}
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900">{agente.nombre}</div>
              <div className="text-xs text-gray-400 mt-0.5">{agente.tipo} · {agente.id}</div>
            </div>
          </div>
          <button
            onClick={onRecargar}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-gray-400 transition-colors"
          >
            ↻ Recargar
          </button>
        </div>

        {/* Quick stats */}
        {agenteMet && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-gray-900">{agenteMet.turnos}</div>
              <div className="text-[10px] text-gray-400">Turnos</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-gray-900">{agenteMet.tokens.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400">Tokens</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-green-600">${agenteMet.costo.toFixed(4)}</div>
              <div className="text-[10px] text-gray-400">Costo</div>
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Archivos</div>
          <div className="space-y-1">
            {(agente.archivos || []).map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-600 py-1">
                <span className="text-gray-300">📄</span>
                <span className="flex-1 truncate">{f}</span>
              </div>
            ))}
            {(!agente.archivos || agente.archivos.length === 0) && (
              <div className="text-xs text-gray-400">Sin archivos</div>
            )}
          </div>
        </div>
      </div>

      {/* SOUL preview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">SOUL</div>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
          {agente.soulPreview || 'Sin contenido cargado. Pulsa Recargar para ver el SOUL del agente.'}
        </pre>
      </div>
    </div>
  )
}

// ─── Platform User Panel ─────────────────────────────────────
function PlatformUserPanel({ ownerKey }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Datos de Plataforma</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Owner Key</span>
            <span className="font-mono text-xs text-gray-700 truncate max-w-[200px]">{ownerKey || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">API Status</span>
            <span className="text-green-600 font-semibold text-xs">● Conectado</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Render</span>
            <a href="https://dashboard.render.com" target="_blank" className="text-indigo-600 text-xs hover:underline">Abrir dashboard →</a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Suscripción MyCompi</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className="font-bold text-gray-900">Profesional Agéntico</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estado</span>
            <span className="text-green-600 font-semibold text-xs">● Activo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio</span>
            <span className="font-bold text-gray-900">€10/mes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Renovación</span>
            <span className="text-gray-700 text-xs">14 abr 2026</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-gray-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
          Gestionar suscripción →
        </button>
      </div>
    </div>
  )
}

// ─── Main Admin App ─────────────────────────────────────────
export default function App() {
  const [ownerKey, setOwnerKey] = useState(() => localStorage.getItem('mycompi_owner_key') || '')
  const [agentes, setAgentes] = useState([])
  const [agenteActual, setAgenteActual] = useState(null)
  const [metricas, setMetricas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conectado, setConectado] = useState(false)
  const [vista, setVista] = useState('dashboard') // dashboard | jerarquia | plataforma
  const [showSidebar, setShowSidebar] = useState(true)

  const apiCall = useCallback(async (url, options = {}) => {
    const headers = {
      'X-Owner-Key': ownerKey,
      'Content-Type': 'application/json',
      ...options.headers,
    }
    const res = await fetch(API + url, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de API')
    return data
  }, [ownerKey])

  const conectar = async () => {
    if (!ownerKey) return
    localStorage.setItem('mycompi_owner_key', ownerKey)
    setLoading(true)
    setError('')
    try {
      const [agData, metData] = await Promise.all([
        apiCall('/api/admin/agentes'),
        apiCall('/api/admin/metrics/dashboard'),
      ])
      setAgentes(agData.agentes || [])
      setMetricas(metData)
      setConectado(true)
    } catch (err) {
      setError(err.message)
      setConectado(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ownerKey) conectar()
  }, [])

  const seleccionarAgente = async (agente) => {
    setAgenteActual(agente)
    if (window.innerWidth < 1024) setShowSidebar(false)
  }

  const recargar = async () => {
    if (!agenteActual) return
    setLoading(true)
    try {
      const data = await apiCall(`/api/admin/agentes/${agenteActual.id}`)
      setAgenteActual({ ...data.agente, archivos: data.agente.archivos })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="h-[68px] bg-white border-b border-gray-200 flex items-center px-6 gap-6 sticky top-0 z-50">
        <a href="/" className="h-9">
          <img src="/assets/logo.png" alt="MyCompi" className="h-full" />
        </a>
        <div className="flex-1 flex items-center gap-3">
          <input
            type="password"
            value={ownerKey}
            onChange={e => setOwnerKey(e.target.value)}
            placeholder="Owner Key..."
            className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-xs w-48 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={conectar}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? '...' : conectado ? 'Actualizar' : 'Conectar'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{conectado ? '●' : '○'}</span>
          <span className="text-xs font-semibold" style={{ color: conectado ? '#22c55e' : '#9ca3af' }}>
            {conectado ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </nav>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      {conectado && (
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'jerarquia', label: 'Jerarquía' },
            { id: 'plataforma', label: 'Plataforma' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                vista === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-6">
        {vista === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Left: Agent list + chart */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agentes</div>
                <AgentList agentes={agentes} selected={agenteActual} onSelect={seleccionarAgente} loading={loading} />
              </div>
              <SpendChart agentes={agentes} metricas={metricas} />
            </div>

            {/* Right: Detail */}
            <div>
              {agenteActual ? (
                <AgentDetail
                  agente={agenteActual}
                  metricas={metricas}
                  apiCall={apiCall}
                  onRecargar={recargar}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="text-4xl mb-4">👈</div>
                  <div className="text-sm font-bold text-gray-700 mb-1">Selecciona un agente</div>
                  <div className="text-xs text-gray-400">Pulsa en un agente de la lista para ver sus archivos y métricas</div>
                </div>
              )}
            </div>
          </div>
        )}

        {vista === 'jerarquia' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <HierarchyView />
          </div>
        )}

        {vista === 'plataforma' && (
          <PlatformUserPanel ownerKey={ownerKey} />
        )}
      </div>
    </div>
  )
}
