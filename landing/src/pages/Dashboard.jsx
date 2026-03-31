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
    { id: 'costes', emoji: '💰', label: 'Costes' },
    { id: 'audit', emoji: '📜', label: 'Registro' },
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

  // Cargar historial y detectar si es primera vez
  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/chat?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d.historial && d.historial.length > 0) {
          // Ya hay historial — mostrarlo
          setMensajes(d.historial)
          setStatusOnline(true)
          setErrorMsg(null)
        } else {
          // Primera vez — Pacole da la bienvenida con onboarding
          setStatusOnline(true)
          setEnviando(true)
          fetchConAuth('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: '__MYCOMPI_ONBOARDING__' }),
          })
            .then(r => r.json())
            .then(d => {
              if (d.ok && d.respuesta) {
                setMensajes([{
                  id: `agent-${d.interaccionId}`,
                  role: 'assistant',
                  content: d.respuesta,
                  timestamp: d.timestamp || new Date().toISOString(),
                  agenteId: 'paco',
                }])
              } else {
                // Fallback si el endpoint no reconoce el onboarding marker
                setMensajes([{
                  id: 'welcome-fallback',
                  role: 'assistant',
                  content: '¡Hola! 👋 Soy Paco, tu orquestador en MyCompi.\n\nTu equipo de Compis está listo para trabajar. ¿En qué te puedo ayudar hoy?',
                  timestamp: new Date().toISOString(),
                  agenteId: 'paco',
                }])
              }
            })
            .catch(() => {
              setMensajes([{
                id: 'welcome-fallback',
                role: 'assistant',
                content: '¡Hola! 👋 Soy Paco, tu orquestador en MyCompi.\n\nTu equipo de Compis está listo para trabajar. ¿En qué te puedo ayudar hoy?',
                timestamp: new Date().toISOString(),
                agenteId: 'paco',
              }])
            })
            .finally(() => setEnviando(false))
        }
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
// MI EQUIPO TAB - Jerarquía visual + SEO de Paco
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// MI EQUIPO TAB — Jerarquía visual: CEO → Paco → 7 Compis
// ─────────────────────────────────────────
function JerarquiaCard({ agente, onClick, expanded }) {
  return (
    <div
      onClick={() => onClick(agente.id)}
      className={`relative flex flex-col items-center cursor-pointer group transition-all duration-200 ${
        expanded ? '' : 'hover:scale-105'
      }`}
    >
      <div className={`relative bg-gradient-to-br ${agente.color} rounded-2xl p-4 text-white shadow-lg transition-all ${
        expanded ? 'ring-4 ring-brand-yellow ring-offset-2' : 'group-hover:shadow-xl'
      }`}
        style={{ minWidth: 130 }}
      >
        <div className="text-3xl mb-1">{agente.emoji}</div>
        <div className="font-bold text-sm text-center leading-tight">{agente.nombre}</div>
        <div className="text-[10px] text-white/70 text-center mt-0.5">{agente.rol}</div>
        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
        {agente.jobsActivos > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-brand-yellow text-brand-dark text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {agente.jobsActivos}
          </div>
        )}
      </div>
      {agente.hijos && <div className="w-0.5 h-5 bg-[#e0d8cf]" />}
    </div>
  )
}

function AgenteJobsPanel({ agente, jobs, onClose }) {
  if (!agente) return null
  const prioridadColor = {
    CRITICA: 'bg-red-100 text-red-700 border-red-200',
    ALTA: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIA: 'bg-blue-100 text-blue-700 border-blue-200',
    BAJA: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <div className="border-t-2 border-brand-pastel pt-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agente.color} flex items-center justify-center text-lg shadow`}>
            {agente.emoji}
          </div>
          <div>
            <div className="font-bold text-brand-dark">{agente.nombre}</div>
            <div className="text-xs text-brand-secondary">{agente.rol}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-brand-muted hover:text-brand-dark transition-colors text-sm px-3 py-1.5 rounded-xl hover:bg-brand-pastel/30"
        >
          ✕ Cerrar
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-brand-pastel rounded-xl">
          <div className="text-3xl mb-2">{agente.emoji}</div>
          <div className="text-sm text-brand-secondary font-medium">{agente.nombre} no tiene tareas activas ahora mismo</div>
          <div className="text-xs text-brand-muted mt-1">Las tareas aparecerán cuando Paco le asigne trabajo</div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">
            {jobs.length} tarea{jobs.length !== 1 ? 's' : ''} activa{jobs.length !== 1 ? 's' : ''}
          </div>
          {jobs.map((job, i) => (
            <div key={job.id || i} className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
              prioridadColor[job.prioridad] || prioridadColor.MEDIA
            }`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                job.estado === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                job.estado === 'TODO' ? 'bg-gray-400' :
                job.estado === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-snug">{job.titulo}</div>
                {job.descripcion && (
                  <div className="text-xs mt-1 opacity-75 leading-relaxed line-clamp-2">
                    {job.descripcion.substring(0, 120)}{job.descripcion.length > 120 ? '…' : ''}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase">{job.estado.replace('_', ' ')}</span>
                  <span className="text-[10px] opacity-60">·</span>
                  <span className="text-[10px] opacity-60">{job.prioridad}</span>
                  {job.tags?.filter(t => t.startsWith('semana')).length > 0 && (
                    <>
                      <span className="text-[10px] opacity-60">·</span>
                      <span className="text-[10px] opacity-60">{job.tags.filter(t => t.startsWith('semana')).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EquipoPanel({ agentes, usuario }) {
  const [expandedAgente, setExpandedAgente] = useState(null)
  const [jobsActivos, setJobsActivos] = useState({})
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('mycompi_token'))

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem('mycompi_token'))
    window.addEventListener('mycompi_auth_change', sync)
    return () => window.removeEventListener('mycompi_auth_change', sync)
  }, [])

  // Jerarquía completa
  const jerarquia = [
    { id: 'ceo', nombre: usuario?.nombre || 'Tú', rol: 'CEO / Titular', emoji: '👑', color: 'from-[#FFD054] to-[#f59e0b]', hijos: true, nivel: 'ceo' },
    { id: 'paco', nombre: 'Paco', rol: 'Orquestador', emoji: '🎯', color: 'from-[#2D3261] to-[#4a5090]', hijos: true, nivel: 'orquestador' },
    ...TODOS_LOS_AGENTES.map(a => ({ ...a, hijos: false, nivel: 'agente' })),
  ]

  const loadJobs = async (agenteId) => {
    if (!token || jobsActivos[agenteId]) return
    setLoadingJobs(true)
    try {
      const res = await fetchConAuth(`/api/trabajos?estado=TODO&estado=IN_PROGRESS&agente_id=${agenteId}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setJobsActivos(prev => ({ ...prev, [agenteId]: data.trabajos || data || [] }))
      }
    } catch {}
    setLoadingJobs(false)
  }

  const handleClick = (agenteId) => {
    if (expandedAgente === agenteId) {
      setExpandedAgente(null)
    } else {
      setExpandedAgente(agenteId)
      loadJobs(agenteId)
    }
  }

  const isCeo = (id) => id === 'ceo'
  const isPaco = (id) => id === 'paco'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-brand-dark mb-1">🎯 Tu equipo de Compis</h2>
        <p className="text-sm text-brand-secondary">7 Compis especializados trabajando 24/7. Pulsa sobre cualquier miembro para ver sus tareas activas.</p>
      </div>

      {/* ── CEO ── */}
      {usuario && jerarquia.find(j => j.id === 'ceo') && (() => {
        const ceo = jerarquia.find(j => j.id === 'ceo')
        const expanded = expandedAgente === 'ceo'
        return (
          <div>
            {/* CEO Card */}
            <div className="flex items-center gap-4 bg-brand-yellow/10 border-2 border-brand-yellow/40 rounded-2xl p-5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD054] to-[#f59e0b] flex items-center justify-center text-3xl shadow-lg flex-shrink-0">
                👑
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-extrabold text-brand-dark">{ceo.nombre}</span>
                  <span className="text-[10px] font-bold bg-brand-yellow/40 text-brand-dark px-2 py-0.5 rounded-full uppercase tracking-wider">CEO / Titular</span>
                </div>
                <p className="text-sm text-brand-secondary leading-relaxed">
                  руководитель. Tienes a Paco y 7 Compis trabajando para ti.
                  {!expandedAgente && ' Pulsa sobre cualquier miembro del equipo para ver qué están haciendo.'}
                </p>
              </div>
              <button
                onClick={() => handleClick('ceo')}
                className="flex-shrink-0 text-xs font-semibold bg-brand-yellow/30 hover:bg-brand-yellow/50 text-brand-dark px-4 py-2 rounded-xl transition-colors"
              >
                {expanded ? '▲ Ocultar' : '▼ Tu info'}
              </button>
            </div>

            {/* Info expandida del CEO */}
            {expanded && (
              <div className="bg-white border-2 border-brand-yellow/30 rounded-2xl p-5 mb-4">
                <div className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Tu información</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nombre', value: usuario?.nombre || '—' },
                    { label: 'Email', value: usuario?.email || '—' },
                    { label: 'Miembro desde', value: usuario?.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-ES') : '—' },
                    { label: 'Tu equipo', value: 'Paco + 7 Compis' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-brand-cream rounded-xl px-4 py-3">
                      <div className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider">{stat.label}</div>
                      <div className="text-sm font-bold text-brand-dark mt-0.5">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* ── PACO — SEO completo ── */}
      {(() => {
        const paco = jerarquia.find(j => j.id === 'paco')
        const pacoJobs = jobsActivos['paco'] || []
        const expanded = expandedAgente === 'paco'
        return (
          <div className="bg-gradient-to-br from-[#2D3261] to-[#4a5090] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-lg font-extrabold">Paco</span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Orquestador</span>
                  <span className="text-[10px] bg-green-400/80 text-[#2D3261] px-2 py-0.5 rounded-full font-bold">● Activo</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">
                  Soy Paco, tu director de equipo. Coordino a todos los Compis para que tu negocio avance automáticamente.
                  Cada mañana te cuento qué se hace y superviso que todo salga bien.
                  {pacoJobs.length > 0 ? ` Ahora mismo tengo <strong>${pacoJobs.length} tarea${pacoJobs.length !== 1 ? 's' : ''} activas</strong>.` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Equipo', value: '7 Compis' },
                { label: 'Tareas activas', value: pacoJobs.length > 0 ? `${pacoJobs.length} ahora` : '—' },
                { label: 'Coordinando', value: jerarquia.length - 2 + ' miembros' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
                  <div className="text-xs text-white/60">{stat.label}</div>
                  <div className="text-sm font-bold mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleClick('paco')}
              className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-xl py-2.5 text-sm font-semibold"
            >
              {expanded ? '▲ Ocultar tareas' : '▼ Ver tareas de Paco'}
              {loadingJobs && expanded && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </button>

            {expanded && (
              <AgenteJobsPanel agente={paco} jobs={pacoJobs} onClose={() => setExpandedAgente(null)} />
            )}
          </div>
        )
      })()}

      {/* ── LOS 7 COMPIS ── */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">
          🤖 Compis especializados
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {TODOS_LOS_AGENTES.map(a => {
            const expanded = expandedAgente === a.id
            const agenteMeta = jerarquia.find(j => j.id === a.id)
            return (
              <div key={a.id} className="flex flex-col items-center">
                <JerarquiaCard
                  agente={{ ...a, ...agenteMeta, jobsActivos: (jobsActivos[a.id] || []).length }}
                  onClick={handleClick}
                  expanded={expanded}
                />
              </div>
            )
          })}
        </div>

        {expandedAgente && expandedAgente !== 'ceo' && expandedAgente !== 'paco' && (
          <AgenteJobsPanel
            agente={jerarquia.find(j => j.id === expandedAgente)}
            jobs={jobsActivos[expandedAgente] || []}
            onClose={() => setExpandedAgente(null)}
          />
        )}
      </div>
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
// COSTES PANEL — Budget agentes + token usage (FASE 2)
// ─────────────────────────────────────────
function CostesPanel({ token }) {
  const [loading, setLoading] = useState(true)
  const [uso, setUso] = useState([])
  const [agentes, setAgentes] = useState([])
  const [presupuesto, setPresupuesto] = useState({})
  const [tabVer, setTabVer] = useState('resumen')

  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/agentes')
      .then(r => r.json())
      .then(d => {
        const ags = Array.isArray(d) ? d : (d.agentes || [])
        setAgentes(ags)
        // Calcular totales
        const total = ags.reduce((sum, a) => {
          const used = a.tokensUsadosMes || 0
          const budget = a.budgetTokensMes || 1000000
          return { used: sum.used + used, budget: sum.budget + budget }
        }, { used: 0, budget: 0 })
        setPresupuesto(total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  // Obtener usage real desde audit/tokens
  useEffect(() => {
    if (!token) return
    fetchConAuth('/api/audit/tokens')
      .then(r => r.json())
      .then(d => { if (d.usage) setUso(d.usage) })
      .catch(() => {})
  }, [token])

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="text-[#b0a898]">Cargando costes...</div>
    </div>
  )

  const pct = presupuesto.budget > 0
    ? Math.round((presupuesto.used / presupuesto.budget * 100))
    : 0

  const pctColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-orange-400' : 'bg-green-400'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-brand-dark mb-1">💰 Costes del equipo</h2>
        <p className="text-sm text-brand-secondary">Presupuesto mensual de tokens por agente y uso acumulado</p>
      </div>

      {/* Barra global */}
      <div className="bg-white border-2 border-brand-pastel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-brand-dark">Uso total tokens este mes</span>
          <span className="text-sm font-bold" style={{ color: pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#16a34a' }}>
            {pct}% usado
          </span>
        </div>
        <div className="w-full bg-brand-pastel rounded-full h-3 overflow-hidden">
          <div className={`${pctColor} h-full rounded-full transition-all duration-500`} style={{ width: Math.min(pct, 100) + '%' }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-brand-muted">
          <span>{(presupuesto.used / 1000).toFixed(0)}k tokens usados</span>
          <span>{(presupuesto.budget / 1000000).toFixed(0)}M presupuesto</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['resumen', 'detalle'].map(t => (
          <button key={t}
            onClick={() => setTabVer(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tabVer === t ? 'bg-brand-dark text-white' : 'bg-brand-pastel/50 text-brand-secondary hover:bg-brand-pastel'}`}
          >
            {t === 'resumen' ? '📊 Por agente' : '📋 Detalle completo'}
          </button>
        ))}
      </div>

      {/* Por agente */}
      {tabVer === 'resumen' && (
        <div className="space-y-2">
          {agentes.map(ag => {
            const agUso = uso.find(u => u.agenteId === ag.id)
            const used = ag.tokensUsadosMes || 0
            const budget = ag.budgetTokensMes || 1000000
            const pctAg = budget > 0 ? Math.round(used / budget * 100) : 0
            const alertPct = ag.alertaPorcentaje || 80
            const isAlert = pctAg >= alertPct
            const agColor = isAlert ? 'bg-red-50 border-red-200'
              : pctAg > 70 ? 'bg-orange-50 border-orange-100'
              : 'bg-white border-brand-pastel'
            const barColor = isAlert ? 'bg-red-500'
              : pctAg > 70 ? 'bg-orange-400'
              : 'bg-green-500'
            return (
              <div key={ag.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 ${agColor}`}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ag.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-base flex-shrink-0`}>
                  {ag.emoji || '🤖'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-brand-dark">{ag.nombre}</div>
                  <div className="text-xs text-brand-secondary">{ag.rol || ag.tipo}</div>
                  <div className="mt-1.5 w-full bg-brand-pastel/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`${barColor} h-full rounded-full`} style={{ width: pctAg + '%' }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: isAlert ? '#dc2626' : '#333' }}>
                    {pctAg}%
                  </div>
                  <div className="text-xs text-brand-muted">
                    {(used / 1000).toFixed(0)}k / {(budget / 1000).toFixed(0)}k
                  </div>
                  {isAlert && <div className="text-xs font-bold text-red-500 mt-0.5">⚠️ Alerta</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detalle */}
      {tabVer === 'detalle' && (
        <div className="bg-white border border-brand-pastel rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-pastel bg-brand-cream">
                <th className="text-left px-4 py-3 text-xs font-bold text-brand-muted">Agente</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-brand-muted">Usado / Budget</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-brand-muted">%</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-brand-muted">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((ag, i) => {
                const used = ag.tokensUsadosMes || 0
                const budget = ag.budgetTokensMes || 1000000
                const pct = budget > 0 ? Math.round(used / budget * 100) : 0
                const alertPct = ag.alertaPorcentaje || 80
                const isAlert = pct >= alertPct
                return (
                  <tr key={ag.id} className={`border-b border-brand-pastel/40 ${isAlert ? 'bg-red-50/50' : i % 2 === 0 ? 'bg-white' : 'bg-brand-cream/30'}`}>
                    <td className="px-4 py-3 font-medium text-brand-dark">{ag.nombre}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {(used / 1000).toFixed(0)}k / {(budget / 1000).toFixed(0)}k
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${isAlert ? 'text-red-500' : pct > 70 ? 'text-orange-500' : 'text-green-600'}`}>
                      {pct}%
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {isAlert ? <span className="text-red-500 font-bold">⚠️ {pct >= 100 ? 'SIN PRESUPUESTO' : 'Alerta ' + alertPct + '%'} </span> : <span className="text-brand-muted">Normal</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota */}
      <div className="text-xs text-brand-muted bg-brand-cream/50 rounded-xl p-3">
        💡 Los presupuestos se reinician el día 1 de cada mes automáticamente. Contacta con soporte para ajustar budgets.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// AUDIT PANEL — Timeline de acciones (FASE 2)
// ─────────────────────────────────────────
function AuditPanel({ token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('all')

  useEffect(() => {
    if (!token) return
    const path = filtro === 'all' ? '/api/audit?limit=50' : `/api/audit?accion=${filtro}&limit=50`
    fetchConAuth(path)
      .then(r => r.json())
      .then(d => { if (d.logs) setLogs(d.logs) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, filtro])

  const ACCIONES = {
    all: { label: 'Todas', emoji: '📋' },
    JOB_CREADO: { label: 'Tareas creadas', emoji: '🆕' },
    JOB_APROBADO: { label: 'Aprobaciones', emoji: '✅' },
    JOB_RECHAZADO: { label: 'Rechazadas', emoji: '❌' },
    TOKEN_ALERTA_80: { label: 'Alertas budget', emoji: '⚠️' },
    COMPLETADO: { label: 'Completadas', emoji: '🎉' },
    FAILED: { label: 'Errores', emoji: '🚨' },
  }

  const accionLabel = (acc) => ACCIONES[acc]?.emoji + ' ' + ACCIONES[acc]?.label || '📌 ' + acc

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="text-[#b0a898]">Cargando historial...</div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-brand-dark">📜 Registro de actividad</h2>
          <p className="text-sm text-brand-secondary mt-0.5">Todas las acciones de tus agentes — sin edits, solo lectura</p>
        </div>
        <div className="px-3 py-1.5 bg-brand-cream rounded-full text-xs text-brand-muted font-medium">
          {logs.length} entradas
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(ACCIONES).map(([key, val]) => (
          <button key={key}
            onClick={() => setFiltro(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtro === key
                ? 'bg-brand-dark text-white'
                : 'bg-brand-pastel/50 text-brand-secondary hover:bg-brand-pastel'
            }`}
          >
            {val.emoji} {val.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-brand-pastel rounded-2xl">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-brand-dark font-bold">Sin actividad registrada</div>
          <div className="text-brand-muted text-sm mt-1">Las acciones de tus Compis aparecerán aquí</div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={log.id || i}
              className="flex gap-3 p-4 bg-white border border-brand-pastel/40 rounded-xl hover:border-brand-dark/30 transition-colors">
              {/* Emoji según acción */}
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-cream flex items-center justify-center text-base">
                {log.accion === 'JOB_APROBADO' ? '✅'
                  : log.accion === 'JOB_RECHAZADO' ? '❌'
                  : log.accion === 'JOB_CREADO' ? '🆕'
                  : log.accion === 'TOKEN_ALERTA_80' ? '⚠️'
                  : log.accion === 'COMPLETADO' ? '🎉'
                  : '📌'}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-brand-dark leading-snug">
                      {log.accion === 'JOB_APROBADO' && '✅ Trabajo aprobado'}
                      {log.accion === 'JOB_RECHAZADO' && '❌ Trabajo rechazado'}
                      {log.accion === 'JOB_CREADO' && '🆕 Nueva tarea creada'}
                      {log.accion === 'TOKEN_ALERTA_80' && '⚠️ Alerta de presupuesto'}
                      {log.accion === 'COMPLETADO' && '🎉 Tarea completada'}
                      {!['JOB_APROBADO', 'JOB_RECHAZADO', 'JOB_CREADO', 'TOKEN_ALERTA_80', 'COMPLETADO'].includes(log.accion)
                        && log.accion}
                    </div>
                    {log.detalle && typeof log.detalle === 'object' && (
                      <div className="text-xs text-brand-secondary mt-0.5">
                        {log.detalle.trabajo && <span>📋 {log.detalle.trabajo}</span>}
                        {log.detalle.costeTokens && <span> · 💰 {log.detalle.costeTokens} tokens</span>}
                        {log.detalle.aprobadoPor && <span> · Por {log.detalle.aprobadoPor}</span>}
                      </div>
                    )}
                  </div>
                  {/* Hora */}
                  <div className="flex-shrink-0 text-xs text-brand-muted text-right">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
              {tab === 'costes' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm overflow-y-auto">
                  <CostesPanel token={token} />
                </div>
              )}
              {tab === 'audit' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm overflow-y-auto">
                  <AuditPanel token={token} />
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
