import { useState, useEffect, useCallback, useRef } from 'react'
import HierarchyView from './components/HierarchyView'
import DecisionesTab from './components/tabs/DecisionesTab'
import ActividadTab from './components/tabs/ActividadTab'
import ColaTab from './components/tabs/ColaTab'
import ChatTab from './components/tabs/ChatTab'

const API = ''

// ─── Login ──────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('beenocode@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, timezone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      localStorage.setItem('mycompi_token', data.tokens.accessToken)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))
      onLogin(data.usuario, data.tokens.accessToken)
    } catch { setError('No se pudo conectar al servidor') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          
          <h1 className="text-2xl font-extrabold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500 mt-2">Accede con tu cuenta MyCompi</p>
        </div>
        <form onSubmit={handle} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">{error}</div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-gray-400">
            <a href="/#/recuperar" className="hover:underline">¿Olvidaste tu contraseña?</a>
          </p>
        </form>
      </div>
    </div>
  )
}

// ─── Spend Chart ────────────────────────────────────
function SpendChart({ metricas }) {
  if (!metricas?.agentes?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Gasto por Agente</div>
        <div className="text-sm text-gray-400 text-center py-8">Sin datos de gasto aún.</div>
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
          const pct = Math.round(Math.min(100, (a.costo / max) * 100))
          return (
            <div key={a.agenteId} className="flex items-center gap-3">
              <div className="w-28 text-xs font-semibold text-gray-600 truncate">{a.agenteId}</div>
              <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center px-2" style={{ width: `${pct}%` }}>
                  {pct > 30 && <span className="text-white text-[10px] font-bold">{pct}%</span>}
                </div>
              </div>
              <div className="w-24 text-right text-xs font-bold text-gray-800 tabular-nums">${a.costo.toFixed(4)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agent List ─────────────────────────────────────
function AgentList({ agentes, selected, onSelect, loading }) {
  if (loading) return <div className="text-center py-10 text-sm text-gray-400">Cargando agentes...</div>
  if (!agentes.length) return (
    <div className="text-center py-10 text-sm text-gray-400">
      <div className="text-3xl mb-2">📋</div>
      No hay agentes registrados.
    </div>
  )
  return (
    <div className="space-y-1">
      {agentes.map(a => (
        <button key={a.id} onClick={() => onSelect(a)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
            selected?.id === a.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'
          }`}>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{a.inicial}</div>
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

// ─── File Viewer / Editor ────────────────────────────
function FileViewer({ archivo, contenido, onSave, saving }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState(contenido)

  useEffect(() => { setValor(contenido); setEditando(false) }, [archivo, contenido])

  const guardar = async () => {
    await onSave(valor)
    setEditando(false)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{archivo}</span>
          {editando && <span className="text-[10px] text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">Editando</span>}
        </div>
        <div className="flex gap-2">
          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all">
              Editar
            </button>
          ) : (
            <>
              <button onClick={guardar} disabled={saving}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => { setValor(contenido); setEditando(false) }}
                className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:border-gray-400 transition-all">
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4">
        {editando ? (
          <textarea
            value={valor}
            onChange={e => setValor(e.target.value)}
            className="w-full h-64 font-mono text-xs leading-relaxed bg-gray-900 text-gray-100 rounded-xl p-4 resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <pre className="font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">{contenido}</pre>
        )}
      </div>
    </div>
  )
}

// ─── Agent Detail ───────────────────────────────────
function AgentDetail({ agente, apiCall }) {
  const [tab, setTab] = useState('archivos')
  const [archivos, setArchivos] = useState({}) // nombre -> contenido
  const [loadingArch, setLoadingArch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [guardado, setGuardado] = useState('')

  const tabs = [
    { id: 'archivos', label: 'Archivos' },
    { id: 'soul', label: 'SOUL.md' },
    { id: 'identity', label: 'IDENTITY.md' },
    { id: 'metrics', label: 'Métricas' },
  ]

  const cargarArchivos = async () => {
    if (!agente) return
    setLoadingArch(true)
    try {
      const data = await apiCall(`/api/admin/agentes/${agente.id}/archivos`)
      setArchivos(data.archivos || {})
    } catch { } finally { setLoadingArch(false) }
  }

  useEffect(() => { if (agente) cargarArchivos() }, [agente?.id])

  const guardarArchivo = async (nombre, contenido) => {
    setSaving(true)
    setGuardado('')
    try {
      await apiCall(`/api/admin/agentes/${agente.id}/archivos/${nombre}`, {
        method: 'PUT',
        body: JSON.stringify({ contenido }),
      })
      setArchivos(prev => ({ ...prev, [nombre]: contenido }))
      setGuardado(`✓ ${nombre} guardado`)
      setTimeout(() => setGuardado(''), 3000)
    } catch (e) { setGuardado('✗ Error al guardar') }
    finally { setSaving(false) }
  }

  if (!agente) return null

  const metricas = agente.metricas

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
            {agente.inicial}
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-lg text-gray-900">{agente.nombre}</div>
            <div className="text-xs text-gray-400 mt-0.5">{agente.tipo} · {agente.id}</div>
          </div>
          {guardado && (
            <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${guardado.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {guardado}
            </div>
          )}
        </div>

        {/* Stats row */}
        {metricas && (
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="px-6 py-5 text-center">
              <div className="text-xl font-extrabold text-gray-900">{metricas.turnos || 0}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Turnos</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-xl font-extrabold text-gray-900">{(metricas.tokens || 0).toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Tokens</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-xl font-extrabold text-green-600">${(metricas.costo || 0).toFixed(4)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Costo</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-3 text-xs font-bold transition-all ${
                tab === t.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'archivos' && (
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Archivos de configuración</div>
              {loadingArch ? (
                <div className="text-center py-8 text-sm text-gray-400">Cargando archivos...</div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(archivos).map(([nombre, contenido]) => (
                    <FileViewer key={nombre} archivo={nombre} contenido={contenido} onSave={(c) => guardarArchivo(nombre, c)} saving={saving} />
                  ))}
                  {!Object.keys(archivos).length && (
                    <div className="text-sm text-gray-400 text-center py-8">Este agente aún no tiene archivos de configuración.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'soul' && (
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">SOUL.md — Personalidad y comportamiento</div>
              <FileViewer
                archivo="SOUL.md"
                contenido={archivos['SOUL.md'] || 'Cargando...'}
                onSave={(c) => guardarArchivo('SOUL.md', c)}
                saving={saving}
              />
            </div>
          )}

          {tab === 'identity' && (
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">IDENTITY.md — Identidad del agente</div>
              <FileViewer
                archivo="IDENTITY.md"
                contenido={archivos['IDENTITY.md'] || 'Cargando...'}
                onSave={(c) => guardarArchivo('IDENTITY.md', c)}
                saving={saving}
              />
            </div>
          )}

          {tab === 'metrics' && (
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Métricas de rendimiento</div>
              {metricas ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-gray-900">{metricas.turnos || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Turnos Totales</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-gray-900">{(metricas.tokens || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Tokens Procesados</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-green-600">${(metricas.costo || 0).toFixed(4)}</div>
                    <div className="text-xs text-gray-500 mt-1">Costo Total</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-extrabold text-gray-900">{metricas.clientes || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">Clientes Atendidos</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center py-8">Sin métricas disponibles.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Platform Account Panel ──────────────────────────
function PlatformPanel({ usuario, onLogout }) {
  if (!usuario) return null
  return (
    <div className="space-y-4 max-w-lg">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Mi Cuenta</div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-extrabold text-indigo-600">
              {usuario.nombre?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-extrabold text-gray-900">{usuario.nombre}</div>
              <div className="text-sm text-gray-500">{usuario.email}</div>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rol plataforma</span>
              <span className="font-bold text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">{usuario.rol_platform}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-bold text-gray-900">{usuario.cliente?.plan || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Empresa</span>
              <span className="text-gray-700">{usuario.cliente?.nombre || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estado</span>
              <span className="text-green-600 font-semibold text-xs">● Activo</span>
            </div>
          </div>
        </div>
      </div>

      <button onClick={onLogout}
        className="w-full text-center text-sm text-gray-500 hover:text-red-600 py-3 border border-gray-200 rounded-xl hover:border-red-200 transition-all">
        Cerrar sesión
      </button>
    </div>
  )
}

// ─── Main App ───────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const [agentes, setAgentes] = useState([])
  const [metricas, setMetricas] = useState(null)
  const [agenteActual, setAgenteActual] = useState(null)
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('dashboard')
  const [error, setError] = useState('')

  const apiCall = useCallback(async (url, options = {}) => {
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
    const res = await fetch(API + url, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de API')
    return data
  }, [token])

  // Verify token on mount
  useEffect(() => {
    if (!token) return
    apiCall('/api/auth/me')
      .then(setUsuario)
      .catch(() => { localStorage.removeItem('mycompi_token'); localStorage.removeItem('mycompi_usuario'); setToken(null) })
  }, [token])

  // Load agents + metrics when logged in
  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      apiCall('/api/admin/agentes').catch(() => ({ agentes: [] })),
      apiCall('/api/admin/metrics/dashboard').catch(() => null),
    ]).then(([agData, metData]) => {
      setAgentes(agData.agentes || [])
      if (metData) setMetricas(metData)
    }).finally(() => setLoading(false))
  }, [token])

  const seleccionarAgente = (agente) => {
    setAgenteActual(agente)
  }

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    setToken(null)
    setUsuario(null)
    setAgentes([])
    setAgenteActual(null)
  }

  if (!token) return <LoginScreen onLogin={(u, t) => { setUsuario(u); setToken(t) }} />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-50 shadow-sm">
        <a href="/" className="h-9"></a>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{usuario?.nombre}</div>
            <div className="text-xs text-gray-400">{usuario?.cliente?.nombre}</div>
          </div>
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-extrabold text-indigo-600">
            {usuario?.nombre?.charAt(0) || '?'}
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'chat', label: '💬 Chat' },
          { id: 'jerarquia', label: 'Jerarquía' },
          { id: 'cola', label: '📋 Cola' },
          { id: 'actividad', label: 'Actividad' },
          { id: 'decisiones', label: 'Decisiones' },
          { id: 'plataforma', label: 'Mi cuenta' },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setVista(tab.id)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              vista === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">

        {vista === 'chat' && (
          <ChatTab />
        )}

        {vista === 'dashboard' && (
          <>
            <SpendChart metricas={metricas} />

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 mt-6">
              {/* Left col */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Agentes ({agentes.length})</div>
                <AgentList agentes={agentes} selected={agenteActual} onSelect={seleccionarAgente} loading={loading} />
              </div>

              {/* Right col */}
              <div>
                {agenteActual ? (
                  <AgentDetail agente={agenteActual} apiCall={apiCall} />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                    <div className="text-5xl mb-4">👈</div>
                    <div className="text-base font-bold text-gray-700 mb-2">Selecciona un agente</div>
                    <div className="text-sm text-gray-400">Pulsa en un agente para ver y editar sus archivos de configuración</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {vista === 'jerarquia' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <HierarchyView />
          </div>
        )}

        {vista === 'decisiones' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <DecisionesTab apiCall={apiCall} />
          </div>
        )}

        {vista === 'actividad' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ActividadTab apiCall={apiCall} />
          </div>
        )}

        {vista === 'cola' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ColaTab apiCall={apiCall} />
          </div>
        )}

        {vista === 'plataforma' && (
          <PlatformPanel usuario={usuario} onLogout={logout} />
        )}
      </div>
    </div>
  )
}
