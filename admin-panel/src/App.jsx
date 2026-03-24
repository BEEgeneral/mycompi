import { useState, useEffect, useCallback } from 'react'
import HierarchyView from './components/HierarchyView'

const API = ''

// ─── Login form ─────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      localStorage.setItem('mycompi_token', data.tokens.accessToken)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))
      onLogin(data.usuario, data.tokens.accessToken)
    } catch { setError('No se pudo conectar') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <img src="/assets/logo.png" alt="MyCompi" className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-gray-900">Admin MyCompi</h1>
          <p className="text-sm text-gray-500 mt-1">Accede con tu cuenta de usuario</p>
        </div>
        <form onSubmit={handle} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-gray-400">
            <a href="/#/recuperar" className="hover:underline">Olvidé mi contraseña</a>
          </p>
        </form>
      </div>
    </div>
  )
}

// ─── Bar Chart ─────────────────────────────────────
function SpendChart({ metricas }) {
  if (!metricas?.agentes?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Gasto por Agente</div>
        <div className="text-sm text-gray-400 text-center py-8">Sin datos aún. Los agentes generarán métricas al procesar.</div>
      </div>
    )
  }
  const sorted = [...metricas.agentes].sort((a, b) => b.costo - a.costo)
  const max = sorted[0]?.costo || 1
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Gasto por Agente</div>
      <div className="space-y-3">
        {sorted.map(a => {
          const pct = Math.min(100, (a.costo / max) * 100)
          return (
            <div key={a.agenteId} className="flex items-center gap-3">
              <div className="w-28 text-xs font-semibold text-gray-600 truncate">{a.agenteId}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="w-20 text-right text-xs font-bold text-gray-800 tabular-nums">${a.costo.toFixed(4)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agent List ───────────────────────────────────
function AgentList({ agentes, selected, onSelect, loading }) {
  if (loading) return <div className="text-center py-8 text-sm text-gray-400">Cargando...</div>
  if (!agentes.length) return (
    <div className="text-center py-8 text-sm text-gray-400">No hay agentes registrados.</div>
  )
  return (
    <div className="space-y-1">
      {agentes.map(a => (
        <button key={a.id} onClick={() => onSelect(a)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
            selected?.id === a.id
              ? 'bg-indigo-50 border border-indigo-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{a.emoji}</div>
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

// ─── Agent Detail ──────────────────────────────────
function AgentDetail({ agente, onRecargar }) {
  if (!agente) return null
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">{agente.emoji}</div>
          <div>
            <div className="font-extrabold text-gray-900">{agente.nombre}</div>
            <div className="text-xs text-gray-400 mt-0.5">{agente.tipo} · {agente.id}</div>
          </div>
        </div>
        <button onClick={onRecargar}
          className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:border-gray-400 transition-colors">
          ↻ Recargar
        </button>
      </div>

      {/* Quick stats */}
      {agente.metricas && (
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="px-6 py-4 text-center">
            <div className="text-lg font-extrabold text-gray-900">{agente.metricas.turnos}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Turnos</div>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="text-lg font-extrabold text-gray-900">{agente.metricas.tokens?.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Tokens</div>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="text-lg font-extrabold text-green-600">${agente.metricas.costo?.toFixed(4)}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Costo</div>
          </div>
        </div>
      )}

      {/* Files */}
      <div className="p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Archivos</div>
        <div className="space-y-1">
          {(agente.archivos || []).map(f => (
            <div key={f} className="flex items-center gap-2 py-1.5 text-sm text-gray-600">
              <span className="text-gray-300">📄</span>
              <span className="flex-1 truncate font-mono text-xs">{f}</span>
            </div>
          ))}
          {!agente.archivos?.length && (
            <div className="text-xs text-gray-400 py-2">Sin archivos</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Platform User Panel ────────────────────────────
function PlatformPanel({ usuario }) {
  if (!usuario) return null
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Mi Cuenta</div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nombre</span>
            <span className="font-semibold text-gray-900">{usuario.nombre}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-700 text-xs">{usuario.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rol plataforma</span>
            <span className="font-bold text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{usuario.rol_platform}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className="font-bold text-gray-900">{usuario.cliente?.plan || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Empresa</span>
            <span className="text-gray-700 text-sm">{usuario.cliente?.nombre || '—'}</span>
          </div>
        </div>
      </div>

      <button onClick={() => {
        localStorage.removeItem('mycompi_token')
        localStorage.removeItem('mycompi_usuario')
        window.location.reload()
      }}
        className="w-full text-center text-sm text-gray-500 hover:text-red-600 py-2 transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const [agentes, setAgentes] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [agenteActual, setAgenteActual] = useState(null)
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('dashboard') // dashboard | jerarquia | plataforma
  const [error, setError] = useState('')

  const apiCall = useCallback(async (url, options = {}) => {
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
    const res = await fetch(API + url, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de API')
    return data
  }, [token])

  useEffect(() => {
    if (!token) return
    apiCall('/api/auth/me').then(setUsuario).catch(() => { localStorage.removeItem('mycompi_token'); localStorage.removeItem('mycompi_usuario'); setToken(null) })
  }, [token])

  useEffect(() => {
    if (!token) return
    Promise.all([
      apiCall('/api/admin/agentes').catch(() => ({ agentes: [] })),
      apiCall('/api/admin/metrics/dashboard').catch(() => null),
    ]).then(([agData, metData]) => {
      setAgentes(agData.agentes || [])
      if (metData) setMetricas(metData)
    })
  }, [token])

  const seleccionarAgente = (agente) => {
    setAgenteActual(agente)
    if (agente) {
      apiCall(`/api/admin/agentes/${agente.id}`).then(d => setAgenteActual(d.agente)).catch(console.error)
    }
  }

  const recargar = () => { if (agenteActual) seleccionarAgente(agenteActual) }

  if (!token) return <LoginScreen onLogin={(u, t) => { setUsuario(u); setToken(t) }} />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-50">
        <a href="/" className="h-9"><img src="/assets/logo.png" alt="MyCompi" className="h-full" /></a>
        <div className="flex-1 flex items-center gap-2">
          {usuario?.rol_platform === 'ADMIN' && (
            <a href="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              Landing
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{usuario?.nombre}</div>
            <div className="text-xs text-gray-400">{usuario?.cliente?.nombre}</div>
          </div>
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
            {usuario?.nombre?.charAt(0) || '?'}
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'jerarquia', label: 'Jerarquía' },
          { id: 'plataforma', label: 'Mi cuenta' },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setVista(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              vista === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {vista === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agentes</div>
                <AgentList agentes={agentes} selected={agenteActual} onSelect={seleccionarAgente} loading={loading} />
              </div>
              <SpendChart metricas={metricas} />
            </div>
            <div>
              {agenteActual ? (
                <AgentDetail agente={agenteActual} onRecargar={recargar} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="text-4xl mb-4">👈</div>
                  <div className="text-sm font-bold text-gray-700">Selecciona un agente</div>
                  <div className="text-xs text-gray-400 mt-1">Pulsa en un agente para ver sus archivos y métricas</div>
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
          <PlatformPanel usuario={usuario} />
        )}
      </div>
    </div>
  )
}
