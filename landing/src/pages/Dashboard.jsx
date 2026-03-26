import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const API = ''

// ─────────────────────────────────────────
// CHATGPT-STYLE FULL SCREEN CHAT
// ─────────────────────────────────────────
function ChatPanel({ agentesActivos, token, onLogout }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [agenteActivo, setAgenteActivo] = useState('paco')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState('chat') // chat | actividad | cuenta
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const agentes = [
    { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-indigo-500 to-purple-600', rol: 'Orquestador' },
    ...agentesActivos,
  ]

  const agenteInfo = agentes.find(a => a.id === agenteActivo) || agentes[0]

  // Cargar historial
  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.historial) setMensajes(d.historial) })
      .catch(() => {})
  }, [token])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async (e) => {
    e?.preventDefault()
    if (!input.trim() || enviando) return

    setEnviando(true)
    const texto = input.trim()
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const tempId = `opt-${Date.now()}`
    setMensajes(prev => [...prev, {
      id: tempId,
      role: 'user',
      content: texto,
      timestamp: new Date().toISOString(),
      agenteId: agenteActivo,
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, agenteId: agenteActivo }),
      })
      const d = await res.json()
      if (d.ok) {
        setMensajes(prev => prev.map(m =>
          m.id === tempId ? { ...m, id: `user-${d.interaccionId}` } : m
        ))
        // Esperar respuesta real
        await esperarRespuesta(d.interaccionId)
      }
    } catch (err) {
      console.error(err)
    }

    setEnviando(false)
  }

  // Polling de la respuesta
  const esperarRespuesta = async (interaccionId) => {
    const maxIntentos = 30
    for (let i = 0; i < maxIntentos; i++) {
      await new Promise(r => setTimeout(r, 1000))
      try {
        const res = await fetch(`/api/chat/${interaccionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const d = await res.json()
        if (d.interaccion?.respuestaAgente) {
          setMensajes(prev => [...prev, {
            id: `resp-${interaccionId}`,
            role: 'assistant',
            content: d.interaccion.respuestaAgente,
            timestamp: new Date().toISOString(),
            agenteId: agenteActivo,
          }])
          return
        }
      } catch {}
    }
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

  const enviarSuggestion = (texto) => {
    setInput(texto)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <div className="flex h-full bg-[#212121] rounded-2xl overflow-hidden border border-gray-800">
      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-[#111] border-r border-gray-800 flex flex-col transition-all duration-200 overflow-hidden`}>
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tu equipo</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          <button
            onClick={() => setMensajes([])}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#333] rounded-xl text-sm text-gray-300 transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nuevo chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {agentes.map(a => (
            <button
              key={a.id}
              onClick={() => { setAgenteActivo(a.id); setTab('chat') }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 text-left transition-all ${
                agenteActivo === a.id && tab === 'chat'
                  ? 'bg-[#2a2a2a] text-white border border-gray-700'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-base flex-shrink-0`}>
                {a.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{a.nombre}</div>
                <div className="text-[11px] text-gray-600 truncate">{a.rol}</div>
              </div>
              {a.id === 'paco' && (
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-gray-800 py-2 px-2 space-y-1">
          <button
            onClick={() => setTab('actividad')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
              tab === 'actividad' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <span className="text-base">📊</span>
            <span className="text-sm">Actividad</span>
          </button>
          <button
            onClick={() => setTab('cuenta')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
              tab === 'cuenta' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <span className="text-base">⚙️</span>
            <span className="text-sm">Mi cuenta</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-gray-500 hover:text-red-400 hover:bg-[#1a1a1a] transition-colors"
          >
            <span className="text-base">🚪</span>
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors mr-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-lg flex-shrink-0`}>
            {agenteInfo.emoji}
          </div>
          <div>
            <div className="text-base font-semibold text-white">{agenteInfo.nombre}</div>
            <div className="text-xs text-gray-500">{agenteInfo.rol}</div>
          </div>
          {agenteActivo === 'paco' && (
            <div className="ml-4 px-3 py-1 bg-indigo-900/50 border border-indigo-700/50 rounded-full text-xs text-indigo-300">
              Coordina automáticamente con el mejor agente
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center -mt-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-4xl mb-8 shadow-2xl`}>
                {agenteInfo.emoji}
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">¿En qué te ayudo hoy?</h2>
              <p className="text-gray-500 max-w-lg text-base leading-relaxed mb-10">
                {agenteActivo === 'paco'
                  ? 'Soy Paco, tu orquestador. Puedo coordinarte con Laura, Enzo, Carlos, Elena, Diana o Marcos. Pregúntame lo que necesites.'
                  : `Soy ${agenteInfo.nombre}, ${agenteInfo.rol.toLowerCase()}. ¿Qué necesitas?`}
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {agenteActivo === 'paco' ? [
                  '¿Qué han hecho mis agentes hoy?',
                  'Crear una campaña de marketing',
                  'Resumen de mis leads activos',
                  'Automatizar un proceso',
                  'Revisar mi analítica',
                  'Ayuda con un cliente',
                ].map((s, i) => (
                  <button key={i} onClick={() => enviarSuggestion(s)}
                    className="text-left text-sm text-gray-400 bg-[#2a2a2a] hover:bg-[#333] border border-[#333] hover:border-gray-600 rounded-xl px-4 py-3.5 transition-all">
                    {s}
                  </button>
                )) : [
                  '¿Qué puedes hacer por mí?',
                  'Ver estado de mis tareas',
                  'Generar un informe',
                  'Consultar métricas',
                ].map((s, i) => (
                  <button key={i} onClick={() => enviarSuggestion(s)}
                    className="text-left text-sm text-gray-400 bg-[#2a2a2a] hover:bg-[#333] border border-[#333] hover:border-gray-600 rounded-xl px-4 py-3.5 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((m, i) => {
            const isUser = m.role === 'user'
            const agenteMsg = !isUser ? (m.agenteId ? agentes.find(a => a.id === m.agenteId) : agenteInfo) : null
            return (
              <div key={m.id || i} className={`flex gap-5 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agenteMsg?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-base flex-shrink-0 mt-0.5`}>
                    {agenteMsg?.emoji || '🤖'}
                  </div>
                )}
                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                    👤
                  </div>
                )}
                <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-left'
                      : 'text-gray-200'
                  }`}>
                    {m.content}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1.5">
                    {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}

          {enviando && (
            <div className="flex gap-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base">🎯</div>
              <div className="flex-1 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#2a2a2a] border border-[#333] px-5 py-3 rounded-2xl rounded-tl-sm">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.15s]" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-6">
          <form onSubmit={enviar} className="relative">
            <div className="flex items-end bg-[#2a2a2a] border border-[#383838] rounded-2xl px-5 py-4 focus-within:border-gray-600 transition-colors shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Pregúntale a ${agenteInfo.nombre}...`}
                rows={1}
                className="flex-1 bg-transparent text-white text-base placeholder:text-gray-500 focus:outline-none resize-none max-h-[200px] overflow-y-auto"
                style={{ minHeight: '24px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || enviando}
                className="ml-4 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// ACTIVIDAD TAB
// ─────────────────────────────────────────
function ActividadPanel({ token }) {
  const [loading, setLoading] = useState(true)
  const [interacciones, setInteracciones] = useState([])

  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.historial) {
          const msgs = d.historial.filter(m => m.role === 'user')
          setInteracciones(msgs.slice(-20).reverse())
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center py-20 text-gray-500">Cargando...</div>

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-white mb-6">📊 Actividad reciente</h2>
      {interacciones.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-700 rounded-2xl">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-white font-semibold">Sin actividad todavía</div>
          <div className="text-gray-500 text-sm mt-2">Tu actividad con Paco aparecerá aquí</div>
        </div>
      ) : (
        interacciones.map(m => (
          <div key={m.id} className="bg-[#2a2a2a] border border-[#333] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs text-gray-500">
                {new Date(m.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <div className="text-sm text-gray-200">{m.content}</div>
          </div>
        ))
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// CUENTA TAB
// ─────────────────────────────────────────
function CuentaPanel({ usuario, plan, onLogout }) {
  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-white">⚙️ Mi cuenta</h2>
      <div className="bg-[#2a2a2a] border border-[#333] rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Nombre</span>
          <span className="text-white font-semibold">{usuario?.nombre}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Email</span>
          <span className="text-gray-300 text-sm">{usuario?.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Plan</span>
          <span className="text-indigo-400 font-bold">{plan?.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Estado</span>
          <span className="text-green-400 text-sm font-semibold">● Activo</span>
        </div>
      </div>

      <a href="https://billing.stripe.com/p/login/test" target="_blank" rel="noreferrer"
        className="block w-full text-center bg-[#2a2a2a] border border-[#333] text-white font-semibold py-4 rounded-2xl hover:bg-[#333] transition-colors text-sm">
        Gestionar suscripción en Stripe
      </a>

      <button onClick={onLogout}
        className="w-full text-center text-red-400 hover:text-red-300 py-3 text-sm transition-colors">
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
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const [subscription, setSubscription] = useState(null)
  const [tab, setTab] = useState('chat')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/#/login'); return }
    const stored = localStorage.getItem('mycompi_usuario')
    if (stored) setUsuario(JSON.parse(stored))
    fetch('/api/stripe/subscription', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.subscription) setSubscription(d.subscription) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, navigate])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    navigate('/#/login')
  }

  const plan = subscription?.planId || 'basico'
  const agentes = (() => {
    const AGENTES = {
      BASICO: [{ id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-pink-400 to-rose-500' }],
      EQUIPO: [
        { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-pink-400 to-rose-500' },
        { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-blue-400 to-indigo-500' },
        { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-green-400 to-emerald-500' },
      ],
      DIRECCION: [
        { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-pink-400 to-rose-500' },
        { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-blue-400 to-indigo-500' },
        { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-green-400 to-emerald-500' },
        { id: 'elena', nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', color: 'from-orange-400 to-amber-500' },
        { id: 'diana', nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', color: 'from-purple-400 to-violet-500' },
        { id: 'marcos', nombre: 'Marcos Fernández', rol: 'Desarrollo Web', emoji: '💻', color: 'from-cyan-400 to-teal-500' },
      ],
    }
    return AGENTES[plan?.toUpperCase()] || AGENTES.BASICO
  })()

  return (
    <div className="min-h-screen bg-[#171717]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-8" style={{ height: 'calc(100vh - 72px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : tab === 'chat' ? (
          <ChatPanel agentesActivos={agentes} token={token} onLogout={logout} />
        ) : tab === 'actividad' ? (
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 p-8 h-full overflow-y-auto">
            <ActividadPanel token={token} />
          </div>
        ) : (
          <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 p-8">
            <CuentaPanel usuario={usuario} plan={plan} onLogout={logout} />
          </div>
        )}
      </div>
    </div>
  )
}
