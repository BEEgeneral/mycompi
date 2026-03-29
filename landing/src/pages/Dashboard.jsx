import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// FETCH CON AUTO-REFRESH DE TOKEN
// ─────────────────────────────────────────
async function fetchConAuth(url, options = {}) {
  let token = localStorage.getItem('mycompi_token')
  if (!token) throw new Error('No hay token')

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  // Si 401, intentar refresh
  if (res.status === 401) {
    const refreshToken = localStorage.getItem('mycompi_refresh_token')
    if (refreshToken) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (refreshRes.ok) {
        const tokens = await refreshRes.json()
        localStorage.setItem('mycompi_token', tokens.accessToken)
        localStorage.setItem('mycompi_refresh_token', tokens.refreshToken)
        // Reintentar con nuevo token
        res = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        })
      }
    }
  }

  return res
}

// ─────────────────────────────────────────
// AGENTES DATA
// ─────────────────────────────────────────
const TODOS_LOS_AGENTES = [
  { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]', nivel: 'agente' },
  { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-[#60a5fa] to-[#4f46e5]', nivel: 'agente' },
  { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-[#4ade80] to-[#059669]', nivel: 'agente' },
  { id: 'elena', nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', color: 'from-[#fb923c] to-[#ea580c]', nivel: 'agente' },
  { id: 'diana', nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', color: 'from-[#a78bfa] to-[#7c3aed]', nivel: 'agente' },
  { id: 'marcos', nombre: 'Marcos Fernández', rol: 'Desarrollo Web', emoji: '💻', color: 'from-[#22d3ee] to-[#0891b2]', nivel: 'agente' },
]

const AGENTES_POR_PLAN = {
  BASICO: TODOS_LOS_AGENTES.slice(0, 1),
  EQUIPO: TODOS_LOS_AGENTES.slice(0, 3),
  DIRECCION: TODOS_LOS_AGENTES,
}

// ─────────────────────────────────────────
// SIDEBAR - está en Dashboard, no dentro de ChatPanel
// ─────────────────────────────────────────
function Sidebar({ tab, onTabChange, agentes, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'chat', emoji: '🎯', label: 'Chat con Paco' },
    { id: 'equipo', emoji: '🤖', label: 'Mi equipo' },
    { id: 'actividad', emoji: '📊', label: 'Actividad' },
    { id: 'documentos', emoji: '📄', label: 'Mis documentos' },
    { id: 'decisiones', emoji: '📋', label: 'Decisiones' },
    { id: 'cuenta', emoji: '⚙️', label: 'Mi cuenta' },
  ]

  return (
    <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-white border-r border-[#e8e0d5] flex flex-col transition-all duration-200 overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-5 border-b border-[#f0e8df]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#333863] to-[#5a62a8] flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="text-sm font-bold text-[#333863]">MyCompi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#b0a898] hover:text-[#333863] text-sm">✕</button>
        </div>

      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
              tab === item.id
                ? 'bg-[#F0EDFB] border border-[#D1E0F7] text-[#333863]'
                : 'text-[#6b6560] hover:bg-[#faf6f0] hover:text-[#333863]'
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm font-medium">{item.label}</span>
            {tab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#333863]" />
            )}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-[#f0e8df] py-2 px-3">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-[#b0a090] hover:text-red-500 hover:bg-red-50 transition-colors">
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// CHAT PANEL — solo Paco (rediseñado)
// ─────────────────────────────────────────
function ChatPanel() {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statusOnline, setStatusOnline] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mycompi_token'))
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Sincronizar token desde localStorage
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem('mycompi_token'))
    window.addEventListener('mycompi_auth_change', sync)
    return () => window.removeEventListener('mycompi_auth_change', sync)
  }, [])

  const agenteInfo = { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-[#2D3261] to-[#4a5090]', rol: 'Orquestador' }

  // Cargar historial al montar
  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/chat?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d.historial) setMensajes(d.historial)
        setStatusOnline(true)
        setErrorMsg(null)
      })
      .catch(() => {
        setStatusOnline(false)
      })
  }, [token])

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Enviar mensaje
  const enviar = async (e) => {
    e?.preventDefault()
    if (!input.trim() || enviando) return

    setEnviando(true)
    setErrorMsg(null)
    const texto = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const tempId = `opt-${Date.now()}`
    const ahora = new Date().toISOString()

    // Mensaje del usuario aparece INMEDIATAMENTE
    setMensajes(prev => [...prev, {
      id: tempId,
      role: 'user',
      content: texto,
      timestamp: ahora,
      agenteId: 'paco',
    }])

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetchConAuth('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) throw new Error('HTTP ' + res.status)

      const d = await res.json()

      if (d.ok) {
        // Actualizar ID del mensaje de usuario
        setMensajes(prev => prev.map(m =>
          m.id === tempId ? { ...m, id: `user-${d.interaccionId}` } : m
        ))
        // Añadir respuesta de Paco
        if (d.respuesta) {
          setMensajes(prev => [...prev, {
            id: `agent-${d.interaccionId}`,
            role: 'assistant',
            content: d.respuesta,
            timestamp: d.timestamp || ahora,
            agenteId: 'paco',
          }])
        }
      } else {
        throw new Error('Respuesta sin ok')
      }
    } catch (err) {
      console.error('Error chat:', err)
      // Mensaje específico según el error
      let msgError = 'No he podido procesar tu mensaje. ¿Puedes intentarlo de nuevo?'
      let bannerError = 'Error de conexión.'

      if (err.message?.includes('HTTP 401')) {
        msgError = 'Tu sesión ha expirado. Recarga la página para continuar.'
        bannerError = 'Sesión expirada. Recarga la página.'
      } else if (err.message?.includes('HTTP 4')) {
        msgError = 'Error del servidor. Inténtalo de nuevo en un momento.'
        bannerError = 'Error del servidor.'
      } else if (err.name === 'AbortError') {
        msgError = 'La petición ha tardado demasiado. Inténtalo de nuevo.'
        bannerError = 'Tiempo de espera agotado.'
      }

      setMensajes(prev => prev.map(m =>
        m.id === tempId
          ? { ...m, id: `error-${tempId}`, content: msgError }
          : m
      ))
      setErrorMsg(bannerError)
      setTimeout(() => setErrorMsg(null), 5000)
    }

    setEnviando(false)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="flex h-full bg-brand-cream rounded-2xl overflow-hidden border-2 border-brand-pastel shadow-sm">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-brand-pastel bg-white shadow-sm">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-brand-secondary hover:text-brand-dark transition-colors p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}

          {/* Avatar con indicador online */}
          <div className="relative flex-shrink-0">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-lg shadow-md`}>
              {agenteInfo.emoji}
            </div>
            {/* Puntito verde - online */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${statusOnline ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-brand-dark">{agenteInfo.nombre}</div>
            <div className="flex items-center gap-1.5">
              <div className={`text-[10px] font-medium ${statusOnline ? 'text-green-500' : 'text-red-400'}`}>
                {statusOnline ? 'En línea' : 'Reconectando...'}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-pastel/50 rounded-full">
            <span className="text-brand-yellow text-sm">🎯</span>
            <span className="text-[11px] font-medium text-brand-dark">Coordina con tu equipo</span>
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            {errorMsg}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center -mt-4">
              <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-4xl mb-6 shadow-lg mb-8`} style={{ width: 72, height: 72 }}>
                {agenteInfo.emoji}
              </div>
              <h2 className="text-xl font-extrabold text-brand-dark mb-2">¿En qué te ayudo hoy?</h2>
              <p className="text-brand-secondary text-sm max-w-sm leading-relaxed mb-8">
                Soy Paco, tu orquestador. Coordino automáticamente con tu equipo. Pregúntame lo que necesites.
              </p>
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
                {[
                  '¿Qué ha hecho mi equipo hoy?',
                  'Crear una campaña de marketing',
                  'Resumen de mis leads activos',
                  'Automatizar un proceso',
                  'Revisar mi analítica',
                  'Ayuda con un cliente',
                ].map((s, i) => (
                  <button key={i}
                    onClick={() => { setInput(s); setTimeout(() => textareaRef.current?.focus(), 50) }}
                    className="text-left text-xs text-brand-secondary bg-white hover:bg-brand-pastel/30 border border-brand-pastel rounded-xl px-3 py-2.5 transition-all hover:text-brand-dark">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((m, i) => {
            const isUser = m.role === 'user'
            const isError = m.id?.startsWith('error-')
            return (
              <div key={m.id || i} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-dark to-brand-dark/80 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-sm">
                    🎯
                  </div>
                )}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">👤</span>
                  </div>
                )}
                <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block text-sm leading-relaxed ${
                    isUser
                      ? isError
                        ? 'bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl rounded-tr-sm'
                        : 'bg-brand-dark text-white px-4 py-2.5 rounded-2xl rounded-tr-sm'
                      : 'text-brand-secondary'
                  }`}>
                    {m.content}
                  </div>
                  <div className="text-[10px] text-brand-muted mt-1 ${isUser ? 'text-right' : ''}" style={{ textAlign: isUser ? 'right' : 'left' }}>
                    {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Indicador "Paco está escribiendo..." */}
          {enviando && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-dark to-brand-dark/80 flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                🎯
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="inline-flex items-center gap-1.5 bg-white border-2 border-brand-pastel px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce [animation-delay:.15s]" />
                  <div className="w-1.5 h-1.5 bg-brand-dark/40 rounded-full animate-bounce [animation-delay:.3s]" />
                </div>
                <div className="text-[10px] text-brand-muted mt-1 ml-1">Paco está escribiendo...</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <form onSubmit={enviar} className="relative">
            <div className="flex items-end bg-white border-2 border-brand-pastel focus-within:border-brand-dark rounded-2xl px-4 py-3 transition-colors shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntale a Paco..."
                rows={1}
                className="flex-1 bg-transparent text-brand-dark text-sm placeholder:text-brand-muted focus:outline-none resize-none max-h-[200px] overflow-y-auto"
                style={{ minHeight: '22px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || enviando}
                className="ml-3 w-8 h-8 bg-brand-dark hover:bg-brand-dark/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
              >
                {enviando ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-brand-muted mt-1.5">Paco coordina con tu equipo automáticamente</p>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────
// MI EQUIPO TAB - todos los Compis operativos
// ─────────────────────────────────────────
function EquipoPanel({ agentes, usuario }) {
  // Siempre usamos TODOS_LOS_AGENTES (7 Compis)
  const todosLosAgentes = TODOS_LOS_AGENTES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-brand-dark mb-2">Tu equipo de Compis</h2>
        <p className="text-sm text-brand-secondary">7 Compis especializados trabajando 24/7 para tu negocio</p>
      </div>

      {/* Director / Orquestador - Paco */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-widest">
          🎯 Director / Orquestador
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-4 bg-white border-2 border-brand-dark rounded-2xl p-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D3261] to-[#4a5090] flex items-center justify-center text-xl shadow-md">🎯</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-brand-dark">Paco</div>
              <div className="text-xs text-brand-secondary">Orquestador · Coordina el equipo</div>
            </div>
            <div className="px-2.5 py-1 bg-brand-dark/10 rounded-full text-[10px] font-bold text-brand-dark">DIRECTOR</div>
          </div>
        </div>
      </div>

      {/* Los 6 Compis especializados */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-widest">
          🤖 Compis especializados
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todosLosAgentes.map(a => (
            <div key={a.id} className="flex items-center gap-4 bg-white border-2 border-brand-pastel rounded-2xl p-4 shadow-sm hover:border-brand-yellow transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-base shadow-md`}>
                {a.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-brand-dark">{a.nombre}</div>
                <div className="text-xs text-brand-secondary">{a.rol}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Operativo" />
            </div>
          ))}
        </div>
      </div>

      {/* CEO / Titular */}
      {usuario && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-widest">
            👑 Tú
          </div>
          <div className="flex items-center gap-4 bg-white border-2 border-brand-yellow rounded-2xl p-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD054] to-[#f59e0b] flex items-center justify-center text-xl shadow-md">👑</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-brand-dark">{usuario.nombre || 'Tú'}</div>
              <div className="text-xs text-brand-secondary">CEO / Titular</div>
            </div>
            <div className="px-2.5 py-1 bg-brand-yellow/20 rounded-full text-[10px] font-bold text-brand-dark">TÚ</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// ACTIVIDAD TAB
// ─────────────────────────────────────────
function ActividadPanel() {
  const [loading, setLoading] = useState(true)
  const [notificaciones, setNotificaciones] = useState([])
  const [token, setToken] = useState(() => localStorage.getItem('mycompi_token'))

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem('mycompi_token'))
    window.addEventListener('mycompi_auth_change', sync)
    return () => window.removeEventListener('mycompi_auth_change', sync)
  }, [])

  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/notificaciones')
      .then(r => r.json())
      .then(d => { if (d.data) setNotificaciones(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center py-20 text-[#b0a898]">Cargando...</div>

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-extrabold text-[#333863] mb-6">📊 Actividad de tu equipo</h2>
      {notificaciones.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-[#333863] font-bold text-lg">Sin notificaciones</div>
          <div className="text-[#b0a898] text-sm mt-2">Los Compis te notificarán cuando hagan algo importante</div>
        </div>
      ) : notificaciones.map(n => (
        <div key={n.id} className="bg-white border border-[#e8e0d5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${n.leida ? 'bg-[#d0c8be]' : 'bg-[#333863]'}`} />
            <span className="text-xs text-[#b0a898]">
              {new Date(n.createdAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
            </span>
            {n.agenteId && <span className="text-xs text-[#333863] font-medium ml-1">{n.agenteId}</span>}
          </div>
          <div className="text-sm font-semibold text-[#333863] mb-1">{n.titulo}</div>
          <div className="text-sm text-[#3d3d3d] leading-relaxed">{n.contenido}</div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// DECISIONES TAB
// ─────────────────────────────────────────
function DecisionesPanel() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ decisiones: [], prioridades: [], toughLove: [] })
  const [tab, setTab] = useState('decisiones')
  const [token, setToken] = useState(() => localStorage.getItem('mycompi_token'))

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem('mycompi_token'))
    window.addEventListener('mycompi_auth_change', sync)
    return () => window.removeEventListener('mycompi_auth_change', sync)
  }, [])

  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/clientes/decisiones')
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center py-20 text-[#b0a898]">Cargando...</div>

  const { decisiones = [], prioridades = [], toughLove = [] } = data

  const tabs = [
    { id: 'decisiones', label: 'Decisiones', count: decisiones.length },
    { id: 'prioridades', label: 'Prioridades', count: prioridades.length },
    { id: 'alertas', label: 'Alertas', count: toughLove.length },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-[#333863] mb-2">📋 Decisiones</h2>
        <p className="text-sm text-[#8b8075]">Próximas acciones y decisiones tomadas por tu equipo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl p-4 text-center border transition-all ${
              tab === t.id
                ? 'bg-[#333863] text-white border-[#333863]'
                : 'bg-white border-[#e8e0d5] hover:border-[#333863]'
            }`}>
            <div className={`text-2xl font-extrabold ${tab === t.id ? 'text-white' : 'text-[#333863]'}`}>{t.count}</div>
            <div className={`text-[11px] font-semibold mt-1 ${tab === t.id ? 'text-white/70' : 'text-[#b0a898]'}`}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Empty states */}
      {tab === 'decisiones' && decisiones.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-[#333863] font-bold">Sin decisiones aún</div>
          <div className="text-[#b0a898] text-sm mt-1">Tu equipo de agentes propondrá decisiones aquí</div>
        </div>
      )}
      {tab === 'prioridades' && prioridades.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-[#333863] font-bold">Sin prioridades</div>
          <div className="text-[#b0a898] text-sm mt-1">Las prioridades de tu equipo aparecerán aquí</div>
        </div>
      )}
      {tab === 'alertas' && toughLove.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">💪</div>
          <div className="text-[#333863] font-bold">Todo bajo control</div>
          <div className="text-[#b0a898] text-sm mt-1">No hay alertas pendientes</div>
        </div>
      )}

      {tab === 'decisiones' && decisiones.map((d, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-[#e8e0d5] rounded-xl shadow-sm">
          <div className="w-3 h-3 rounded-full bg-[#FFD54F] mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-[#3d3d3d] font-medium leading-relaxed">{d.texto}</div>
            <div className="text-[10px] text-[#b0a898] mt-1">{d.fecha}</div>
          </div>
        </div>
      ))}

      {tab === 'prioridades' && prioridades.map((p, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white border border-[#e8e0d5] rounded-xl shadow-sm">
          <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-[#3d3d3d] font-medium leading-relaxed">{p.texto}</div>
            <div className="text-[10px] text-[#b0a898] mt-1">{p.fecha}</div>
          </div>
        </div>
      ))}

      {tab === 'alertas' && toughLove.map((t, i) => (
        <div key={i} className="flex gap-4 p-4 bg-[#FEF2F2] border border-[#fca5a5]/30 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-[#3d3d3d] font-medium leading-relaxed">{t.texto}</div>
            <div className="text-[10px] text-[#b0a898] mt-1">{t.fecha}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// DOCUMENTOS TAB — Mis documentos clave
// ─────────────────────────────────────────
function DocumentosPanel({ token }) {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchDocumentos()
  }, [])

  const fetchDocumentos = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clientes/documentos', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Error cargando documentos')
      const data = await res.json()
      setDocumentos(data.documentos || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tipoLabel = {
    MISION: { emoji: '🎯', color: '#333863' },
    PRODUCTO: { emoji: '💼', color: '#2D7DD2' },
    BRAND_VOICE: { emoji: '✍️', color: '#E84545' },
    USER_RESEARCH: { emoji: '🔍', color: '#45B69C' },
    TECNICO: { emoji: '⚙️', color: '#8B5CF6' },
    MEMORIA_AGENTE: { emoji: '🧠', color: '#F59E0B' },
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-[#b0a898]">
        <div className="text-4xl mb-3">⏳</div>
        <div>Cargando documentos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <div className="text-4xl mb-3">❌</div>
        <div>{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-[#333863]">📄 Mis documentos</h2>
          <p className="text-sm text-[#8b8075] mt-1">Documentos clave de tu equipo. Cada Compi los lee para trabajar mejor.</p>
        </div>
        <div className="text-2xl">🗂</div>
      </div>

      {documentos.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-[#333863] font-bold">Sin documentos aún</div>
          <div className="text-[#b0a898] text-sm mt-1">Los documentos de tu equipo aparecerán aquí</div>
        </div>
      )}

      <div className="space-y-3">
        {documentos.map(doc => {
          const info = tipoLabel[doc.tipo] || { emoji: '📄', color: '#333863' }
          const isOpen = expandedId === doc.id
          return (
            <div key={doc.id} className="bg-white border border-[#e8e0d5] rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : doc.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#faf6f0] transition-colors"
              >
                <span className="text-2xl">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#333863]">{doc.titulo}</div>
                  <div className="text-xs text-[#b0a898]">{doc.tipo}</div>
                </div>
                <span className="text-[#b0a898] text-sm">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-[#f0e8df] pt-4">
                  <pre className="text-sm text-[#555] whitespace-pre-wrap font-sans leading-relaxed"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {doc.contenido}
                  </pre>
                  <div className="text-xs text-[#b0a898] mt-3">
                    Actualizado: {new Date(doc.updatedAt).toLocaleDateString('es-ES')}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// CUENTA TAB
// ─────────────────────────────────────────
function CuentaPanel({ usuario, plan, token, onLogout }) {
  const [portalLoading, setPortalLoading] = useState(false)

  const abrirPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert('No se pudo abrir el portal. Inténtalo de nuevo.')
      }
    } catch {
      alert('No se pudo conectar con el servidor.')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h2 className="text-xl font-extrabold text-[#333863] mb-2">⚙️ Mi cuenta</h2>
        <p className="text-sm text-[#8b8075]">Gestiona tu suscripción y datos</p>
      </div>
      <div className="bg-white border border-[#e8e0d5] rounded-2xl p-6 space-y-4 shadow-sm">
        {[
          { label: 'Nombre', value: usuario?.nombre },
          { label: 'Email', value: usuario?.email },
          { label: 'Plan', value: plan?.toUpperCase(), highlight: true },
        ].map((row, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-[#f0e8df] last:border-0">
            <span className="text-[#b0a898] text-sm">{row.label}</span>
            <span className={`text-sm font-semibold ${row.highlight ? 'text-[#333863]' : 'text-[#3d3d3d]'}`}>{row.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-2">
          <span className="text-[#b0a898] text-sm">Estado</span>
          <span className="text-green-600 text-sm font-semibold">● Activo</span>
        </div>
      </div>
      <button onClick={abrirPortal} disabled={portalLoading}
        className="block w-full text-center bg-[#333863] text-white font-bold py-4 rounded-2xl hover:bg-[#4a5090] transition-colors shadow-md text-sm disabled:opacity-60 cursor-pointer">
        {portalLoading ? 'Abriendo portal...' : 'Gestionar suscripción en Stripe →'}
      </button>
      <button onClick={onLogout} className="w-full text-center text-red-400 hover:text-red-600 py-3 text-sm transition-colors">
        Cerrar sesión
      </button>
    </div>
  )
}

// ─────────────────────────────────────────
// DASHBOARD PRINCIPAL
// ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('mycompi_token'))
  const [subscription, setSubscription] = useState(null)
  const [tab, setTab] = useState('chat')
  const [loading, setLoading] = useState(true)

  // Cargar datos iniciales con refresh automático
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('mycompi_token')
    if (!tokenGuardado || tokenGuardado === 'undefined') {
      navigate('/#/login')
      return
    }

    const stored = localStorage.getItem('mycompi_usuario')
    if (stored) setUsuario(JSON.parse(stored))

    fetchConAuth('/api/stripe/subscription')
      .then(r => r.json())
      .then(d => { if (d.subscription) setSubscription(d.subscription) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [navigate])

  // Sincronizar estado de token
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem('mycompi_token'))
    window.addEventListener('mycompi_auth_change', syncToken)
    return () => window.removeEventListener('mycompi_auth_change', syncToken)
  }, [])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_refresh_token')
    localStorage.removeItem('mycompi_usuario')
    window.dispatchEvent(new Event('mycompi_auth_change'))
    navigate('/#/login')
  }

  const plan = subscription?.planId || 'basico'
  const agentes = AGENTES_POR_PLAN[plan?.toUpperCase()] || AGENTES_POR_PLAN.BASICO

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* No renderizamos el Navbar de la landing - el Dashboard tiene su propio Sidebar */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-8" style={{ height: 'calc(100vh - 72px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#b0a898]">Cargando...</div>
          </div>
        ) : (
          <div className="flex gap-4 h-full overflow-hidden">
            {/* Sidebar - ahora en Dashboard, fuera de ChatPanel */}
            <Sidebar
              tab={tab}
              onTabChange={setTab}
              agentes={agentes}
              onLogout={logout}
            />

            {/* Content area */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              {tab === 'chat' && (
                <ChatPanel />
              )}
              {tab === 'equipo' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <EquipoPanel agentes={agentes} usuario={usuario} />
                </div>
              )}
              {tab === 'actividad' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <ActividadPanel />
                </div>
              )}
              {tab === 'documentos' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <DocumentosPanel token={token} />
                </div>
              )}
              {tab === 'decisiones' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <DecisionesPanel />
                </div>
              )}
              {tab === 'cuenta' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <CuentaPanel usuario={usuario} plan={plan} token={token} onLogout={logout} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
