import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const API = ''

// Agentes disponibles por plan
const AGENTES_POR_PLAN = {
  BASICO: [
    { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-pink-400 to-rose-500' },
  ],
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

const TIPO_LABELS = {
  CREAR_CONTENIDO: 'Crear contenido',
  CONSULTAR_INFO: 'Consultar',
  MODIFICAR_SOLICITUD: 'Modificar',
  QUEJA: 'Queja',
  ALERTA: 'Alerta',
  OTRO: 'Otro',
}

function AgentCard({ agent, expanded, onToggle }) {
  return (
    <div className="relative group">
      {agent.status === 'activo' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} rounded-2xl blur-xl opacity-20`} />
      )}
      <div className="relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-xl shadow-lg`}>
            {agent.inicial}
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">{agent.nombre}</div>
            <div className="text-xs text-gray-400">{agent.rol}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${agent.status === 'activo' ? 'bg-green-400' : agent.status === 'descansando' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500 capitalize">{agent.status || 'offline'}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// CHATGPT-STYLE CHAT PANEL
// ─────────────────────────────────────────
function ChatPanel({ agentesActivos, token }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [agenteActivo, setAgenteActivo] = useState('paco')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Agentes para el sidebar
  const agentes = [
    { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-indigo-500 to-purple-600', rol: 'Orquestador' },
    ...agentesActivos,
  ]

  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.historial) setMensajes(d.historial) })
      .catch(() => {})
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async (e) => {
    e?.preventDefault()
    if (!input.trim() || enviando) return

    setEnviando(true)
    const texto = input.trim()
    setInput('')
    textareaRef.current?.style.removeProperty('height')
    textareaRef.current?.focus()

    // Optimistic
    setMensajes(prev => [...prev, {
      id: `opt-${Date.now()}`,
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
        setMensajes(prev => prev.map((m, i) =>
          m.id?.startsWith('opt-') && i === prev.length - 1
            ? { ...m, id: `user-${d.interaccionId}` }
            : m
        ))
      }
    } catch {}

    setEnviando(false)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const agenteInfo = agentes.find(a => a.id === agenteActivo) || agentes[0]

  return (
    <div className="flex h-full bg-[#202020] rounded-2xl overflow-hidden border border-gray-700">
      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-[#111] border-r border-gray-800 flex flex-col transition-all duration-200 overflow-hidden`}>
        {/* Header sidebar */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Agentes</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          <button
            onClick={() => setMensajes([])}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-xs text-gray-300 transition-colors"
          >
            <span>＋</span> Nuevo chat
          </button>
        </div>

        {/* Lista de agentes */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          <p className="text-[10px] font-bold text-gray-600 uppercase px-2 mb-2">Tu equipo</p>
          {agentes.map(a => (
            <button
              key={a.id}
              onClick={() => setAgenteActivo(a.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-colors ${
                agenteActivo === a.id
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-xs flex-shrink-0`}>
                {a.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{a.nombre}</div>
                <div className="text-[10px] text-gray-600 truncate">{a.rol}</div>
              </div>
              {a.id === 'paco' && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer sidebar */}
        <div className="px-3 py-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs">👤</div>
            <div className="text-xs text-gray-400 truncate">Mi cuenta</div>
          </div>
        </div>
      </div>

      {/* ── Área de chat ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#333] bg-[#1a1a1a]">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-colors mr-2"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-sm flex-shrink-0`}>
            {agenteInfo.emoji}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{agenteInfo.nombre}</div>
            <div className="text-xs text-gray-500">{agenteInfo.rol}</div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-3xl mb-6`}>
                {agenteInfo.emoji}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¿En qué te ayudo hoy?</h2>
              <p className="text-sm text-gray-500 max-w-md">
                Soy {agenteInfo.nombre}, {agenteInfo.rol.toLowerCase()} de tu equipo. Puedo ayudarte con cualquier consulta o tarea.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-8 w-full max-w-md">
                {[
                  '¿Qué han hecho mis agentes hoy?',
                  'Crear una campaña de marketing',
                  'Resumen de mis leads activos',
                  'Automatizar un proceso',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); textareaRef.current?.focus() }}
                    className="text-left text-xs text-gray-400 bg-[#2a2a2a] hover:bg-[#333] border border-[#333] hover:border-gray-600 rounded-xl px-4 py-3 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((m, i) => {
            const isUser = m.role === 'user'
            const agenteMsg = m.agenteId ? agentes.find(a => a.id === m.agenteId) : agentes[0]
            return (
              <div key={m.id || i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agenteMsg?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-sm flex-shrink-0 mt-1`}>
                    {agenteMsg?.emoji || '🤖'}
                  </div>
                )}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                    👤
                  </div>
                )}
                <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm'
                      : 'text-gray-200'
                  }`}>
                    {m.content}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}

          {enviando && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">🎯</div>
              <div className="flex-1 max-w-2xl">
                <div className="inline-block bg-[#2a2a2a] border border-[#333] text-gray-300 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.15s]" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input — estilo ChatGPT */}
        <div className="px-4 pb-4">
          <form onSubmit={enviar} className="relative">
            <div className="flex items-end bg-[#2a2a2a] border border-[#333] rounded-2xl px-4 py-3 focus-within:border-gray-600 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder={`Pregúntale a ${agenteInfo.nombre}...`}
                rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none resize-none max-h-[200px] overflow-y-auto"
                style={{ minHeight: '24px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || enviando}
                className="ml-3 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-2">
              {agenteInfo.id === 'paco'
                ? 'Paco coordina automáticamente con el agente más adecuado'
                : `Chat directo con ${agenteInfo.nombre}`}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function StandupCard({ standup }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left" onClick={() => setExpanded(!expanded)}>
        <span className="text-sm font-bold text-gray-700">📅 {standup.fecha}</span>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 mt-2">{standup.contenido}</pre>
        </div>
      )}
    </div>
  )
}

function DecisionesPanel({ token }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('standups')

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clientes/decisiones', { headers: { Authorization: `Bearer ${token}` } })
      const d = await res.json()
      if (d.ok) setData(d)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const { standups = [], decisiones = [], prioridades = [], toughLove = [] } = data || {}

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{standups.length}</div>
          <div className="text-[10px] text-blue-600 font-semibold">Standups</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{prioridades.length}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Prioridades</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-red-700">{toughLove.length}</div>
          <div className="text-[10px] text-red-600 font-semibold">Alertas</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'standups', label: '📋 Standups', count: standups.length },
          { id: 'decisiones', label: '✅ Decisiones', count: decisiones.length },
          { id: 'tough', label: '💪 Recomendaciones', count: toughLove.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Cargando...</div>
      ) : (
        <>
          {tab === 'standups' && (
            <div className="space-y-2">
              {standups.length === 0 && (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                  <div className="text-4xl mb-3">📋</div>
                  <div className="text-sm font-bold text-gray-600">Sin standups todavía</div>
                  <div className="text-xs text-gray-400 mt-1">Tu Paco escribe su primer standup esta noche</div>
                </div>
              )}
              {standups.map(s => <StandupCard key={s.fecha} standup={s} />)}
            </div>
          )}

          {tab === 'decisiones' && (
            <div className="space-y-2">
              {decisiones.length === 0 && (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="text-sm font-bold text-gray-600">Sin decisiones aún</div>
                </div>
              )}
              {decisiones.map((d, i) => (
                <div key={i} className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-blue-800 font-semibold">{d.texto}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{d.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'tough' && (
            <div className="space-y-2">
              {toughLove.length === 0 && (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                  <div className="text-4xl mb-3">💪</div>
                  <div className="text-sm font-bold text-gray-600">Todo bajo control</div>
                </div>
              )}
              {toughLove.map((t, i) => (
                <div key={i} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-red-800 font-semibold">{t.texto}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{t.fecha}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InteraccionesList({ interacciones }) {
  if (!interacciones?.length) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        Sin actividad todavía. Tu Paco te mantendrá informado.
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {interacciones.map(m => (
        <div key={m.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm flex-shrink-0">
            {m.clienteAcepta === true ? '✅' : m.clienteAcepta === false ? '❌' : '⏳'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                {TIPO_LABELS[m.tipoPeticion] || m.tipoPeticion}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(m.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="text-sm text-gray-700 truncate">{m.mensajeOriginal}</div>
            {m.respuestaAgente && (
              <div className="text-xs text-gray-500 mt-1 truncate">→ {m.respuestaAgente}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const [subscription, setSubscription] = useState(null)
  const [interacciones, setInteracciones] = useState([])
  const [tab, setTab] = useState('equipo') // equipo | actividad | cuenta
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/#/login'); return }

    const stored = localStorage.getItem('mycompi_usuario')
    if (stored) setUsuario(JSON.parse(stored))

    Promise.all([
      fetch('/api/stripe/subscription', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
      fetch('/api/chat?limit=20', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([subData, chatData]) => {
      if (subData.subscription) setSubscription(subData.subscription)
      if (chatData.historial) {
        // Convertir historial a formato interacciones para las stats
        const interaccionesFormateadas = chatData.historial
          .filter(m => m.role === 'user')
          .map(m => ({
            id: m.id,
            mensajeOriginal: m.content,
            createdAt: m.timestamp,
            respuestaAgente: chatData.historial.find(a => a.role === 'assistant' && a.timestamp === m.timestamp)?.content || null,
            tipoPeticion: 'CONSULTAR_INFO',
            clienteAcepta: null,
          }))
        setInteracciones(interaccionesFormateadas)
      }
    }).finally(() => setLoading(false))
  }, [token, navigate])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    navigate('/#/login')
  }

  const plan = subscription?.planId || 'basico'
  const agentes = AGENTES_POR_PLAN[plan?.toUpperCase()] || AGENTES_POR_PLAN.BASICO

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              ¡Hola, {usuario?.nombre?.split(' ')[0] || 'Cliente'}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Plan <span className="font-bold text-indigo-600">{plan?.toUpperCase()}</span>
              {subscription?.status === 'active' && (
                <span className="ml-2 text-green-600 text-xs font-semibold">● Suscrito</span>
              )}
            </p>
          </div>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
            Cerrar sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'equipo', label: '💬 Chat con Paco', highlight: true },
            { id: 'actividad', label: '📊 Actividad' },
            { id: 'decisiones', label: '📋 Decisiones' },
            { id: 'cuenta', label: '⚙️ Mi cuenta' },
          ].map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? t.highlight ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>
        ) : (
          <>
            {/* TAB: EQUIPO — Chat protagonista */}
            {tab === 'equipo' && (
              <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
                {/* Chat central — ocupa todo el espacio */}
                <div className="flex-1 min-h-0">
                  <ChatPanel agentesActivos={agentes} token={token} />
                </div>
              </div>
            )}

            {/* TAB: DECISIONES */}
            {tab === 'decisiones' && (
              <DecisionesPanel token={token} />
            )}

            {/* TAB: ACTIVIDAD */}
            {tab === 'actividad' && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Historial de actividad</h2>
                <InteraccionesList interacciones={interacciones} />
              </div>
            )}

            {/* TAB: CUENTA */}
            {tab === 'cuenta' && (
              <div className="max-w-lg space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Datos de cuenta</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nombre</span>
                      <span className="font-semibold text-gray-900">{usuario?.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email</span>
                      <span className="text-gray-700">{usuario?.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-bold text-indigo-600">{plan?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estado</span>
                      <span className="text-green-600 font-semibold text-xs">● Activo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">Gestionar suscripción</h3>
                  <a href="https://billing.stripe.com/p/login/test" target="_blank" rel="noreferrer"
                    className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm">
                    Abrir portal de Stripe
                  </a>
                </div>

                <button onClick={logout}
                  className="w-full text-center text-sm text-red-500 hover:text-red-700 py-3 border border-red-200 rounded-xl hover:border-red-300 transition-colors">
                  Cerrar sesión
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
