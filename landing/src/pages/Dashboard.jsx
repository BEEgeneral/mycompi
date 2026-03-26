import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// AGENTES DATA
// ─────────────────────────────────────────
const AGENTES_POR_PLAN = {
  BASICO: [
    { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]', nivel: 'agente' },
  ],
  EQUIPO: [
    { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]', nivel: 'agente' },
    { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-[#60a5fa] to-[#4f46e5]', nivel: 'agente' },
    { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-[#4ade80] to-[#059669]', nivel: 'agente' },
  ],
  DIRECCION: [
    { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]', nivel: 'agente' },
    { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-[#60a5fa] to-[#4f46e5]', nivel: 'agente' },
    { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-[#4ade80] to-[#059669]', nivel: 'agente' },
    { id: 'elena', nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', color: 'from-[#fb923c] to-[#ea580c]', nivel: 'agente' },
    { id: 'diana', nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', color: 'from-[#a78bfa] to-[#7c3aed]', nivel: 'agente' },
    { id: 'marcos', nombre: 'Marcos Fernández', rol: 'Desarrollo Web', emoji: '💻', color: 'from-[#22d3ee] to-[#0891b2]', nivel: 'agente' },
  ],
}

// ─────────────────────────────────────────
// SIDEBAR — está en Dashboard, no dentro de ChatPanel
// ─────────────────────────────────────────
function Sidebar({ tab, onTabChange, agentes, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'chat', emoji: '🎯', label: 'Chat con Paco' },
    { id: 'equipo', emoji: '🤖', label: 'Mi equipo' },
    { id: 'actividad', emoji: '📊', label: 'Actividad' },
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
        {sidebarOpen && (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#333863] hover:bg-[#3d4080] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nuevo chat
          </button>
        )}
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
// CHAT PANEL — solo Paco
// ─────────────────────────────────────────
function ChatPanel({ token }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const agenteInfo = { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-[#333863] to-[#4a5090]', rol: 'Orquestador' }

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const tempId = `opt-${Date.now()}`
    setMensajes(prev => [...prev, {
      id: tempId,
      role: 'user',
      content: texto,
      timestamp: new Date().toISOString(),
      agenteId: 'paco',
    }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
      })
      const d = await res.json()
      if (d.ok) {
        setMensajes(prev => prev.map(m =>
          m.id === tempId ? { ...m, id: `user-${d.interaccionId}`, content: texto } : m
        ))
        if (d.respuesta) {
          setMensajes(prev => [...prev, {
            id: `agent-${d.interaccionId}`,
            role: 'assistant',
            content: d.respuesta,
            timestamp: d.timestamp || new Date().toISOString(),
            agenteId: 'paco',
          }])
        }
      }
    } catch (err) {
      console.error(err)
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
    <div className="flex h-full bg-[#FDF8F3] rounded-2xl overflow-hidden border border-[#e0d8cf] shadow-sm">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#ede5da] bg-white shadow-sm">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-[#6b6560] hover:text-[#333863] transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-lg shadow-md`}>
            {agenteInfo.emoji}
          </div>
          <div>
            <div className="text-base font-bold text-[#333863]">{agenteInfo.nombre}</div>
            <div className="text-xs text-[#b0a898]">{agenteInfo.rol}</div>
          </div>
          <div className="ml-3 px-3 py-1 bg-[#FFF9E6] border border-[#FFD54F]/40 rounded-full text-xs text-[#333863] font-medium">
            ✨ Coordina automáticamente con el mejor agente
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center -mt-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agenteInfo.color} flex items-center justify-center text-4xl mb-8 shadow-lg`}>
                {agenteInfo.emoji}
              </div>
              <h2 className="text-2xl font-extrabold text-[#333863] mb-3">¿En qué te ayudo hoy?</h2>
              <p className="text-[#8b8075] max-w-lg text-base leading-relaxed mb-10">
                Soy Paco, tu orquestador. Coordino automáticamente con Laura, Enzo, Carlos, Elena, Diana o Marcos. Pregúntame lo que necesites.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {[
                  '¿Qué han hecho mis agentes hoy?',
                  'Crear una campaña de marketing',
                  'Resumen de mis leads activos',
                  'Automatizar un proceso',
                  'Revisar mi analítica',
                  'Ayuda con un cliente',
                ].map((s, i) => (
                  <button key={i}
                    onClick={() => { setInput(s); setTimeout(() => textareaRef.current?.focus(), 50) }}
                    className="text-left text-sm text-[#6b6560] bg-white hover:bg-[#F0EDFB] border border-[#e8e0d5] hover:border-[#D1E0F7] rounded-xl px-4 py-3.5 transition-all shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensajes.map((m, i) => {
            const isUser = m.role === 'user'
            return (
              <div key={m.id || i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#333863] to-[#5a62a8] flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-sm">
                    🎯
                  </div>
                )}
                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-[#333863] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">👤</span>
                  </div>
                )}
                <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block text-sm leading-relaxed ${
                    isUser ? 'bg-[#333863] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-left' : 'text-[#3d3d3d]'
                  }`}>
                    {m.content}
                  </div>
                  <div className="text-[10px] text-[#b0a898] mt-1.5">
                    {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}

          {enviando && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#333863] to-[#5a62a8] flex items-center justify-center text-sm">🎯</div>
              <div className="flex-1 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white border border-[#e8e0d5] px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#b0a898] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#b0a898] rounded-full animate-bounce [animation-delay:.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#b0a898] rounded-full animate-bounce [animation-delay:.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-6">
          <form onSubmit={enviar} className="relative">
            <div className="flex items-end bg-white border-2 border-[#e0d8cf] focus-within:border-[#333863] rounded-2xl px-5 py-4 transition-colors shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Pregúntale a Paco..."
                rows={1}
                className="flex-1 bg-transparent text-[#333863] text-base placeholder:text-[#b0a898] focus:outline-none resize-none max-h-[200px] overflow-y-auto"
                style={{ minHeight: '24px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || enviando}
                className="ml-4 w-9 h-9 bg-[#333863] hover:bg-[#4a5090] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-center text-[11px] text-[#b0a898] mt-2.5">Paco coordina automáticamente con el agente más adecuado</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// MI EQUIPO TAB — jerarquía visual
// ─────────────────────────────────────────
function EquipoPanel({ agentes }) {
  const jerarquia = {
    DIRECTOR: { label: 'Director', emoji: '🎯', color: 'from-[#FFD54F] to-[#f59e0b]', agents: [] },
    MANAGER: { label: 'Manager', emoji: '👔', color: 'from-[#60a5fa] to-[#4f46e5]', agents: [] },
    AGENTE: { label: 'Agente', emoji: '💬', color: 'from-[#4ade80] to-[#059669]', agents: [] },
  }

  // Asignar agentes a niveles
  jerarquia.DIRECTOR.agents = [{ id: 'paco', nombre: 'Paco', rol: 'Orquestador', emoji: '🎯', color: 'from-[#333863] to-[#4a5090]' }]
  jerarquia.MANAGER.agents = agentes.slice(0, 2) // Laura y Enzo en plan EQUIPO+
  jerarquia.AGENTE.agents = agentes.slice(2)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#333863] mb-2">Tu equipo agéntico</h2>
        <p className="text-sm text-[#8b8075]">La jerarquía de agentes que trabaja para tu negocio</p>
      </div>

      {/* Director / Paco */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#b0a898] uppercase tracking-widest">
          <span>🎯</span> Director / Orquestador
        </div>
        <div className="grid grid-cols-1 gap-3">
          {jerarquia.DIRECTOR.agents.map(a => (
            <div key={a.id} className="flex items-center gap-4 bg-white border-2 border-[#333863] rounded-xl p-4 shadow-sm">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-md`}>
                {a.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#333863]">{a.nombre}</div>
                <div className="text-xs text-[#b0a898]">{a.rol}</div>
              </div>
              <div className="px-2 py-1 bg-[#333863]/10 rounded-full text-[10px] font-bold text-[#333863]">DIRECTOR</div>
            </div>
          ))}
        </div>
      </div>

      {/* Managers */}
      {jerarquia.MANAGER.agents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#b0a898] uppercase tracking-widest">
            <span>👔</span> Managers
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jerarquia.MANAGER.agents.map(a => (
              <div key={a.id} className="flex items-center gap-4 bg-white border border-[#e8e0d5] rounded-xl p-4 shadow-sm">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-lg shadow-md`}>
                  {a.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#333863]">{a.nombre}</div>
                  <div className="text-xs text-[#b0a898]">{a.rol}</div>
                </div>
                <div className="px-2 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-blue-600">MANAGER</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agentes */}
      {jerarquia.AGENTE.agents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#b0a898] uppercase tracking-widest">
            <span>💬</span> Agentes especializados
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jerarquia.AGENTE.agents.map(a => (
              <div key={a.id} className="flex items-center gap-4 bg-white border border-[#e8e0d5] rounded-xl p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-base shadow-md`}>
                  {a.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#333863]">{a.nombre}</div>
                  <div className="text-xs text-[#b0a898]">{a.rol}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// ACTIVIDAD TAB
// ─────────────────────────────────────────
function ActividadPanel({ token }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=30', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.historial) setItems(d.historial.filter(m => m.role === 'user').reverse()) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center py-20 text-[#b0a898]">Cargando...</div>

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-extrabold text-[#333863] mb-6">📊 Actividad reciente</h2>
      {items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-[#333863] font-bold text-lg">Sin actividad todavía</div>
          <div className="text-[#b0a898] text-sm mt-2">Tu actividad con Paco aparecerá aquí</div>
        </div>
      ) : items.map(m => (
        <div key={m.id} className="bg-white border border-[#e8e0d5] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#333863]" />
            <span className="text-xs text-[#b0a898]">
              {new Date(m.timestamp).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
            </span>
          </div>
          <div className="text-sm text-[#3d3d3d] leading-relaxed">{m.content}</div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// DECISIONES TAB
// ─────────────────────────────────────────
function DecisionesPanel({ token }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ decisiones: [], prioridades: [], toughLove: [] })
  const [tab, setTab] = useState('decisiones')

  useEffect(() => {
    if (!token) return
    fetch('/api/clientes/decisiones', { headers: { Authorization: `Bearer ${token}` } })
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
// CUENTA TAB
// ─────────────────────────────────────────
function CuentaPanel({ usuario, plan, onLogout }) {
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
      <a href="https://billing.stripe.com/p/login/test" target="_blank" rel="noreferrer"
        className="block w-full text-center bg-[#333863] text-white font-bold py-4 rounded-2xl hover:bg-[#4a5090] transition-colors shadow-md text-sm">
        Gestionar suscripción en Stripe →
      </a>
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
  const agentes = AGENTES_POR_PLAN[plan?.toUpperCase()] || AGENTES_POR_PLAN.BASICO

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* No renderizamos el Navbar de la landing — el Dashboard tiene su propio Sidebar */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-8" style={{ height: 'calc(100vh - 72px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#b0a898]">Cargando...</div>
          </div>
        ) : (
          <div className="flex gap-4 h-full overflow-hidden">
            {/* Sidebar — ahora en Dashboard, fuera de ChatPanel */}
            <Sidebar
              tab={tab}
              onTabChange={setTab}
              agentes={agentes}
              onLogout={logout}
            />

            {/* Content area */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              {tab === 'chat' && (
                <ChatPanel token={token} />
              )}
              {tab === 'equipo' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <EquipoPanel agentes={agentes} />
                </div>
              )}
              {tab === 'actividad' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <ActividadPanel token={token} />
                </div>
              )}
              {tab === 'decisiones' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <DecisionesPanel token={token} />
                </div>
              )}
              {tab === 'cuenta' && (
                <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full shadow-sm">
                  <CuentaPanel usuario={usuario} plan={plan} onLogout={logout} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
