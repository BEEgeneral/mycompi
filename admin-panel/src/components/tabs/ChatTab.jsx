import { useState, useEffect, useRef } from 'react'

const AGENTES = [
  { id: 'paco', nombre: 'Paco', emoji: '🎯', color: 'from-indigo-500 to-purple-600', desc: 'Tu orquestador' },
]

const API = ''

export default function ChatTab() {
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState(localStorage.getItem('mycompi_token'))
  const bottomRef = useRef(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historial])

  // Mensaje inicial de Paco
  useEffect(() => {
    if (!token) return
    // Solo añadir el mensaje de bienvenida si no hay historial
    setHistorial([{
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! 👋 Soy **Paco**, tu orquestador en MyCompi.\n\nTengo a tu disposición a **Laura** (atención al cliente), **Enzo** (marketing), **Carlos** (ventas), **Elena** (operaciones), **Diana** (data), **Marcos** (desarrollo) y **Pelayo** (asistente).\n\n¿Qué necesitas hoy?`,
      timestamp: new Date(),
      agenteId: 'paco',
    }])
  }, [])

  const enviar = async (e) => {
    e?.preventDefault()
    if (!mensaje.trim() || cargando || !token) return

    const texto = mensaje.trim()
    setMensaje('')
    setError('')
    setCargando(true)

    const tempUserId = `user-${Date.now()}`

    // Agregar mensaje del usuario
    setHistorial(prev => [...prev, {
      id: tempUserId,
      role: 'user',
      content: texto,
      timestamp: new Date(),
    }])

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensaje: texto }),
      })

      if (res.status === 401) {
        setError('Sesión expirada. Recarga la página.')
        setHistorial(prev => prev.filter(m => m.id !== tempUserId))
        setCargando(false)
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al procesar mensaje')
        setHistorial(prev => prev.filter(m => m.id !== tempUserId))
        setCargando(false)
        return
      }

      // Agregar respuesta de Paco
      setHistorial(prev => [...prev, {
        id: `agent-${data.interaccionId || Date.now()}`,
        role: 'assistant',
        content: data.respuesta || '¡Hola! ¿En qué puedo ayudarte?',
        timestamp: new Date(data.timestamp || Date.now()),
        agenteId: 'paco',
      }])

    } catch {
      setError('No se pudo conectar con el servidor')
      setHistorial(prev => prev.filter(m => m.id !== tempUserId))
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

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Header del chat */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">🎯</div>
        <div>
          <div className="font-bold text-gray-900 text-sm">Paco — Orquestador</div>
          <div className="text-xs text-gray-400">Respuesta en tiempo real</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-600 font-medium">Online</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4">
        {historial.map((msg) => {
          const agente = msg.agenteId ? AGENTES.find(a => a.id === msg.agenteId) : AGENTES[0]
          return (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agente?.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xs flex-shrink-0`}>
                  {agente?.emoji || '🎯'}
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
              }`}>
                {/* Soporte básico markdown: **bold**, saltos de línea */}
                {msg.content.split('\n').map((line, i) => (
                  <div key={i}>{line.startsWith('- ') ? <span>• {line.slice(2)}</span> : line}</div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Loading indicator */}
        {cargando && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs flex-shrink-0">🎯</div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={enviar} className="flex gap-3">
        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntale a Paco..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none"
            rows={1}
            disabled={cargando}
            style={{ maxHeight: '120px' }}
          />
        </div>
        <button
          type="submit"
          disabled={!mensaje.trim() || cargando}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all flex-shrink-0"
        >
          {cargando ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
