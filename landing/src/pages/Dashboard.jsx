import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// ─────────────────────────────────────────
// CHAT PANEL — Colors: blanco cálido, azul marino
// ─────────────────────────────────────────
function ChatPanel({ token, onLogout }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [agenteActivo, setAgenteActivo] = useState('paco')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState('chat')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const agenteInfo = { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-[#333863] to-[#4a5090]', rol: 'Orquestador' }

  // Cargar historial
  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.historial) setMensajes(d.historial)
      })
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

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
        body: JSON.stringify({ mensaje: texto }),
      })
      const d = await res.json()
      if (d.ok) {
        // Reemplazar optimistic con respuesta real
        setMensajes(prev => prev.map(m =>
          m.id === tempId
            ? { ...m, id: `user-${d.interaccionId}`, content: texto }
            : m
        ))
        // Añadir respuesta de Paco
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

  const enviarSuggestion = (texto) => {
    setInput(texto)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <div className="flex h-full bg-[#FDF8F3] rounded-2xl overflow-hidden border border-[#e0d8cf] shadow-sm">
      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 bg-white border-r border-[#e8e0d5] flex flex-col transition-all duration-200 overflow-hidden`}>
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
          <button
            onClick={() => setMensajes([])}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#333863] hover:bg-[#3d4080] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Nuevo chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <p className="text-[10px] font-bold text-[#b0a898] uppercase tracking-widest px-2 mb-3">Chat</p>
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all bg-[#F0EDFB] border border-[#D1E0F7]`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#333863] to-[#4a5090] flex items-center justify-center text-base flex-shrink-0 shadow-sm">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#333863]">Paco</div>
              <div className="text-[11px] text-[#b0a898]">Orquestador</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
          </button>
        </div>

        <div className="border-t border-[#f0e8df] py-2 px-3 space-y-1">
          <button onClick={() => setTab('actividad')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${tab === 'actividad' ? 'bg-[#F0EDFB] text-[#333863]' : 'text-[#6b6560] hover:bg-[#faf6f0]'}`}>
            <span className="text-base">📊</span><span className="text-sm font-medium">Actividad</span>
          </button>
          <button onClick={() => setTab('decisiones')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${tab === 'decisiones' ? 'bg-[#F0EDFB] text-[#333863]' : 'text-[#6b6560] hover:bg-[#faf6f0]'}`}>
            <span className="text-base">📋</span><span className="text-sm font-medium">Decisiones</span>
          </button>
          <button onClick={() => setTab('cuenta')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${tab === 'cuenta' ? 'bg-[#F0EDFB] text-[#333863]' : 'text-[#6b6560] hover:bg-[#faf6f0]'}`}>
            <span className="text-base">⚙️</span><span className="text-sm font-medium">Mi cuenta</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-[#b0a090] hover:text-red-500 hover:bg-red-50 transition-colors">
            <span className="text-base">🚪</span><span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* ── Main chat ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3]">
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
          {agenteActivo === 'paco' && (
            <div className="ml-3 px-3 py-1 bg-[#FFF9E6] border border-[#FFD54F]/40 rounded-full text-xs text-[#333863] font-medium">
              ✨ Coordina automáticamente con el mejor agente
            </div>
          )}
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
                  <button key={i} onClick={() => enviarSuggestion(s)}
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
                    isUser
                      ? 'bg-[#333863] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-left'
                      : 'text-[#3d3d3d]'
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
                placeholder={`Pregúntale a ${agenteInfo.nombre}...`}
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
          <p className="text-center text-[11px] text-[#b0a898] mt-2.5">
            Paco coordina automáticamente con el agente más adecuado
          </p>
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
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!token) return
    fetch('/api/chat?limit=30', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.historial) setItems(d.historial.filter(m => m.role === 'user').reverse())
      })
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
  const [data, setData] = useState({ standups: [], decisiones: [], prioridades: [], toughLove: [] })
  const [tab, setTab] = useState('standups')

  useEffect(() => {
    if (!token) return
    fetch('/api/clientes/decisiones', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center py-20 text-[#b0a898]">Cargando...</div>

  const { standups = [], decisiones = [], prioridades = [], toughLove = [] } = data

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Standups', count: standups.length, color: 'bg-[#F0EDFB] border-[#D1E0F7]', text: 'text-[#333863]' },
          { label: 'Decisiones', count: decisiones.length, color: 'bg-[#FFF9E6] border-[#FFD54F]/40', text: 'text-[#333863]' },
          { label: 'Prioridades', count: prioridades.length, color: 'bg-[#F0FDF4] border-[#86efac]/40', text: 'text-[#333863]' },
          { label: 'Alertas', count: toughLove.length, color: 'bg-[#FEF2F2] border-[#fca5a5]/40', text: 'text-[#333863]' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} border rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-extrabold ${s.text}`}>{s.count}</div>
            <div className="text-[11px] text-[#b0a898] font-semibold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-white border border-[#e8e0d5] rounded-xl p-1 shadow-sm">
        {[
          { id: 'standups', label: '📋 Standups', count: standups.length },
          { id: 'decisiones', label: '✅ Decisiones', count: decisiones.length },
          { id: 'prioridades', label: '🎯 Prioridades', count: prioridades.length },
          { id: 'tough', label: '💪 Alerts', count: toughLove.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === t.id ? 'bg-[#333863] text-white shadow-sm' : 'text-[#6b6560] hover:bg-[#faf6f0]'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-[#f0e8df] text-[#6b6560]'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'standups' && standups.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">📋</div><div className="text-[#333863] font-bold">Sin standups todavía</div>
          <div className="text-[#b0a898] text-sm mt-1">Tu Paco escribe su primer standup cada noche</div>
        </div>
      )}
      {tab === 'decisiones' && decisiones.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">✅</div><div className="text-[#333863] font-bold">Sin decisiones aún</div>
        </div>
      )}
      {tab === 'prioridades' && prioridades.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">🎯</div><div className="text-[#333863] font-bold">Sin prioridades</div>
        </div>
      )}
      {tab === 'tough' && toughLove.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-[#e0d8cf] rounded-2xl">
          <div className="text-4xl mb-3">💪</div><div className="text-[#333863] font-bold">Todo bajo control</div>
        </div>
      )}

      {tab === 'standups' && standups.map((s, i) => (
        <div key={i} className="bg-white border border-[#e8e0d5] rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[#F0EDFB] border-b border-[#e8e0d5] flex items-center justify-between">
            <span className="text-sm font-bold text-[#333863]">📅 {s.fecha}</span>
          </div>
          <pre className="text-xs text-[#6b6560] whitespace-pre-wrap font-sans p-4 bg-white leading-relaxed">{s.contenido}</pre>
        </div>
      ))}

      {tab === 'decisiones' && decisiones.map((d, i) => (
        <div key={i} className="flex gap-3 p-4 bg-white border border-[#e8e0d5] rounded-xl shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD54F] mt-1.5 flex-shrink-0" />
          <div>
            <div className="text-sm text-[#3d3d3d] font-medium">{d.texto}</div>
            <div className="text-[10px] text-[#b0a898] mt-1">{d.fecha}</div>
          </div>
        </div>
      ))}

      {tab === 'prioridades' && prioridades.map((p, i) => (
        <div key={i} className="flex gap-3 p-4 bg-white border border-[#e8e0d5] rounded-xl shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
          <div>
            <div className="text-sm text-[#3d3d3d] font-medium">{p.texto}</div>
            <div className="text-[10px] text-[#b0a898] mt-1">{p.fecha}</div>
          </div>
        </div>
      ))}

      {tab === 'tough' && toughLove.map((t, i) => (
        <div key={i} className="flex gap-3 p-4 bg-[#FEF2F2] border border-[#fca5a5]/30 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
          <div>
            <div className="text-sm text-[#3d3d3d] font-medium">{t.texto}</div>
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
      <h2 className="text-xl font-extrabold text-[#333863]">⚙️ Mi cuenta</h2>
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
      <button onClick={onLogout}
        className="w-full text-center text-red-400 hover:text-red-600 py-3 text-sm transition-colors">
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
    const A = {
      BASICO: [{ id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]' }],
      EQUIPO: [
        { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]' },
        { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-[#60a5fa] to-[#4f46e5]' },
        { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-[#4ade80] to-[#059669]' },
      ],
      DIRECCION: [
        { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-[#f472b6] to-[#e11d48]' },
        { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-[#60a5fa] to-[#4f46e5]' },
        { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-[#4ade80] to-[#059669]' },
        { id: 'elena', nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', color: 'from-[#fb923c] to-[#ea580c]' },
        { id: 'diana', nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', color: 'from-[#a78bfa] to-[#7c3aed]' },
        { id: 'marcos', nombre: 'Marcos Fernández', rol: 'Desarrollo Web', emoji: '💻', color: 'from-[#22d3ee] to-[#0891b2]' },
      ],
    }
    return A[plan?.toUpperCase()] || A.BASICO
  })()

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-8" style={{ height: 'calc(100vh - 72px)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[#b0a898]">Cargando...</div>
          </div>
        ) : (
          <div className="h-full">
            {tab === 'chat' && <ChatPanel token={token} onLogout={logout} />}
            {tab === 'actividad' && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full overflow-y-auto shadow-sm">
                <ActividadPanel token={token} />
              </div>
            )}
            {tab === 'decisiones' && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full overflow-y-auto shadow-sm">
                <DecisionesPanel token={token} />
              </div>
            )}
            {tab === 'cuenta' && (
              <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 h-full overflow-y-auto shadow-sm">
                <CuentaPanel usuario={usuario} plan={plan} onLogout={logout} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
