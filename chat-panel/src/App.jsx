import { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────
// AGENTES
// ─────────────────────────────────────────
const AGENTES = [
  { id: 'paco',    nombre: 'Paco',            emoji: '🎯', rol: 'Orquestador',     color: 'from-indigo-500 to-purple-600', desc: 'Coordinador de tu equipo' },
  { id: 'laura',   nombre: 'Laura Montes',    emoji: '💬', rol: 'Atención Cliente', color: 'from-pink-500 to-rose-600',    desc: 'Soporte y atención al cliente' },
  { id: 'enzo',    nombre: 'Enzo Herrera',    emoji: '📊', rol: 'Marketing',        color: 'from-blue-500 to-indigo-600',   desc: 'Campañas, contenido, SEO' },
  { id: 'carlos',  nombre: 'Carlos Mendoza',  emoji: '💼', rol: 'Ventas',           color: 'from-green-500 to-emerald-600', desc: 'Leads, cierre, seguimiento' },
  { id: 'elena',   nombre: 'Elena Ortega',    emoji: '⚙️', rol: 'Operaciones',      color: 'from-orange-500 to-amber-600',  desc: 'Automatizaciones y procesos' },
  { id: 'diana',   nombre: 'Diana Palau',      emoji: '📈', rol: 'Data',             color: 'from-purple-500 to-violet-600', desc: 'Métricas y análisis' },
  { id: 'marcos',  nombre: 'Marcos Fernández', emoji: '💻', rol: 'Desarrollo',       color: 'from-cyan-500 to-teal-600',    desc: 'Web y e-commerce' },
  { id: 'pelayo',  nombre: 'Pelayo',          emoji: '🤖', rol: 'Asistente',        color: 'from-gray-500 to-slate-600',   desc: 'Tu asistente personal' },
]

const API_URL = import.meta.env.VITE_API_URL || ''

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }
      localStorage.setItem('mycompi_token', data.tokens.accessToken)
      localStorage.setItem('mycompi_refresh', data.tokens.refreshToken)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))
      localStorage.setItem('mycompi_cliente', JSON.stringify(data.cliente))
      onLogin(data.usuario, data.cliente)
    } catch {
      setError('No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="text-xl font-bold text-white mb-1">MyCompi Chat</h1>
          <p className="text-sm text-gray-400">Accede a tu equipo de agentes</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            required
            className="w-full bg-[#12121a] border border-[#2a2a3a] text-white rounded-xl px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            className="w-full bg-[#12121a] border border-[#2a2a3a] text-white rounded-xl px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Conectando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function AgenteAvatar({ agente }) {
  return (
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${agente.color} flex items-center justify-center text-sm flex-shrink-0`}>
      {agente.emoji}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">🎯</div>
      <div className="bg-[#1e1e2e] border border-[#2a2a3a] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.15s]" />
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Chat principal (sin SSE — respuesta directa)
// ─────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [agente, setAgente] = useState(AGENTES[0])
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const [status, setStatus] = useState('online')
  const bottomRef = useRef(null)

  // ─────────────────────────────────────────
  // Auth
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    const u = localStorage.getItem('mycompi_usuario')
    const c = localStorage.getItem('mycompi_cliente')
    if (u) setUsuario(JSON.parse(u))
    if (c) setCliente(JSON.parse(c))
  }, [token])

  // ─────────────────────────────────────────
  // Cargar historial al iniciar
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    cargarHistorial()
  }, [token])

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historial])

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.historial?.length > 0) {
          setHistorial(data.historial)
        }
      }
    } catch (err) {
      console.error('Error cargando historial:', err)
    }
  }

  const handleLogin = (usr, cli) => {
    setUsuario(usr)
    setCliente(cli)
    setToken(localStorage.getItem('mycompi_token'))
  }

  const handleLogout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_refresh')
    localStorage.removeItem('mycompi_usuario')
    localStorage.removeItem('mycompi_cliente')
    setToken(null)
    setUsuario(null)
    setCliente(null)
    setHistorial([])
  }

  // ─────────────────────────────────────────
  // Enviar mensaje (respuesta directa)
  // ─────────────────────────────────────────
  const enviar = async (e) => {
    e?.preventDefault()
    if (!mensaje.trim() || cargando) return

    const texto = mensaje.trim()
    setMensaje('')
    setError('')
    setCargando(true)

    // Añadir mensaje del usuario
    setHistorial(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: texto,
        timestamp: new Date(),
      }
    ])

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mensaje: texto }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Sesión expirada. Recarga la página para volver a entrar.')
        } else {
          setError(data.error || 'Error al procesar mensaje')
        }
        setCargando(false)
        return
      }

      // Añadir respuesta de Paco
      if (data.respuesta) {
        setHistorial(prev => [
          ...prev,
          {
            id: `agent-${data.interaccionId || Date.now()}`,
            role: 'assistant',
            content: data.respuesta,
            timestamp: new Date(data.timestamp),
            agenteId: 'paco',
          }
        ])
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  // ─────────────────────────────────────────
  // NO AUTH
  // ─────────────────────────────────────────
  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  // ─────────────────────────────────────────
  // AUTH + CHAT
  // ─────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">

      {/* Header */}
      <header className="bg-[#12121a] border-b border-[#2a2a3a] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
            🎯
          </div>
          <div>
            <div className="font-bold text-white text-sm">
              {cliente?.nombre || 'MyCompi'}
            </div>
            <div className="text-xs text-gray-400">
              {usuario?.nombre}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status */}
          <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
               title={status === 'online' ? 'Conectado' : 'Sin conexión'} />

          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-300 transition-colors" title="Cerrar sesión">
            🚪
          </button>
        </div>
      </header>

      {/* Agente info */}
      <div className="bg-[#12121a] border-b border-[#2a2a3a] px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${agente.color} flex items-center justify-center text-xs`}>
          {agente.emoji}
        </div>
        <span className="text-xs text-gray-400">
          <span className="text-white font-medium">{agente.nombre}</span>
          {' · '}
          {agente.desc}
        </span>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

        {/* Mensaje inicial */}
        {historial.length === 0 && (
          <div className="flex gap-3">
            <AgenteAvatar agente={AGENTES[0]} />
            <div className="bg-[#1e1e2e] border border-[#2a2a3a] rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
              <p className="text-sm text-gray-300 leading-relaxed">
                ¡Hola! Soy <strong>Paco</strong>, tu orquestador en MyCompi. 👋
              </p>
              <p className="text-sm text-gray-300 leading-relaxed mt-2">
                Tengo a tu disposición a <strong>Laura</strong> (atención al cliente), <strong>Enzo</strong> (marketing), <strong>Carlos</strong> (ventas), <strong>Elena</strong> (operaciones), <strong>Diana</strong> (data), <strong>Marcos</strong> (desarrollo) y <strong>Pelayo</strong> (asistente).
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">
                ¿Qué necesitas hoy?
              </p>
            </div>
          </div>
        )}

        {/* Historial */}
        {historial.map((msg, i) => {
          const agenteMsg = msg.agenteId ? AGENTES.find(a => a.id === msg.agenteId) : AGENTES[0]

          if (cargando && i === historial.length - 1 && msg.role === 'user') {
            return (
              <div key={msg.id || i}>
                <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && <AgenteAvatar agente={agenteMsg} />}
                  <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-[#1e1e2e] border border-[#2a2a3a] text-gray-300 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
                <TypingIndicator />
              </div>
            )
          }

          return (
            <div key={msg.id || i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && <AgenteAvatar agente={agenteMsg} />}
              <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-[#1e1e2e] border border-[#2a2a3a] text-gray-300 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={enviar} className="flex-shrink-0 px-4 py-4 border-t border-[#2a2a3a]">
        <div className="flex gap-3 bg-[#12121a] border border-[#2a2a3a] rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pregúntale a ${agente.nombre}...`}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none resize-none"
            rows={1}
            disabled={cargando}
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!mensaje.trim() || cargando}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors flex-shrink-0 self-end"
          >
            Enviar
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          {status === 'online' ? '🤖 Paco conectado — respuesta en tiempo real' : '⚫ Sin conexión en tiempo real'}
        </p>
      </form>
    </div>
  )
}
