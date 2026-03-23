import { useState, useEffect, useRef } from 'react'

const AGENTES = [
  { id: 'laura', nombre: 'Laura Montes', emoji: '💬', rol: 'Atención al Cliente' },
  { id: 'enzo', nombre: 'Enzo Herrera', emoji: '📊', rol: 'Marketing' },
  { id: 'carlos', nombre: 'Carlos Mendoza', emoji: '💼', rol: 'Ventas' },
  { id: 'elena', nombre: 'Elena Ortega', emoji: '⚙️', rol: 'Operaciones' },
  { id: 'diana', nombre: 'Diana Palau', emoji: '📈', rol: 'Data Growth' },
]

const API = ''

export default function App() {
  const [agente, setAgente] = useState(AGENTES[0])
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [espera, setEspera] = useState(null)
  const bottomRef = useRef(null)

  // Demo client id
  const clientId = localStorage.getItem('mycompi_client_id') || 'demo'

  useEffect(() => {
    if (!localStorage.getItem('mycompi_client_id')) {
      localStorage.setItem('mycompi_client_id', 'demo-' + Math.random().toString(36).slice(2, 8))
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historial])

  const enviar = async (e) => {
    e.preventDefault()
    if (!mensaje.trim() || cargando) return

    const texto = mensaje.trim()
    setMensaje('')
    setError('')
    setEspera(null)

    // Añadir mensaje del usuario
    setHistorial(prev => [...prev, { role: 'user', content: texto }])

    setCargando(true)
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-mode': 'true',
          'x-client-id': clientId,
        },
        body: JSON.stringify({
          agente: 'laura',
          mensaje: texto,
          complejidad: 'media',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'TEMPORALMENTE_NO_DISPONIBLE') {
          setEspera({ razon: data.mensaje, esperarMs: data.esperarMs })
          // Quitar el mensaje de usuario que añadímos si no hay respuesta
          setHistorial(prev => prev.slice(0, -1))
        } else {
          setError(data.error || 'Error al procesar mensaje')
          setHistorial(prev => prev.slice(0, -1))
        }
        return
      }

      // Añadir respuesta del agente
      setHistorial(prev => [...prev, { role: 'assistant', content: data.respuesta }])

    } catch (err) {
      setError('No se pudo conectar con el servidor')
      setHistorial(prev => prev.slice(0, -1))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-chat-bg">

      {/* Header */}
      <header className="bg-chat-surface border-b border-chat-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-chat-accent flex items-center justify-center text-xl">
            {agente.emoji}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{agente.nombre}</div>
            <div className="text-xs text-chat-muted">{agente.rol}</div>
          </div>
        </div>

        {/* Selector de agente */}
        <select
          value={agente.id}
          onChange={e => setAgente(AGENTES.find(a => a.id === e.target.value))}
          className="bg-chat-card border border-chat-border text-chat-secondary text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-chat-accent"
        >
          {AGENTES.map(a => (
            <option key={a.id} value={a.id}>{a.emoji} {a.nombre}</option>
          ))}
        </select>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

        {/* Mensaje inicial */}
        {historial.length === 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-chat-accent flex items-center justify-center text-sm flex-shrink-0">
              {agente.emoji}
            </div>
            <div className="bg-chat-card border border-chat-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
              <p className="text-sm text-chat-secondary leading-relaxed">
                ¡Hola! Soy {agente.nombre}, {agente.rol.toLowerCase()} de MyCompi. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          </div>
        )}

        {/* Historial */}
        {historial.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-chat-accent flex items-center justify-center text-sm flex-shrink-0">
                {agente.emoji}
              </div>
            )}
            <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-chat-accent text-white rounded-tr-sm'
                : 'bg-chat-card border border-chat-border text-chat-secondary rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading */}
        {cargando && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-chat-accent flex items-center justify-center text-sm flex-shrink-0">
              {agente.emoji}
            </div>
            <div className="bg-chat-card border border-chat-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-chat-muted rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-chat-muted rounded-full animate-bounce [animation-delay:.15s]" />
                <div className="w-1.5 h-1.5 bg-chat-muted rounded-full animate-bounce [animation-delay:.3s]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-chat-error flex items-center justify-center text-sm flex-shrink-0">⚠</div>
            <div className="bg-red-900/30 border border-red-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Esperando budget */}
        {espera && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-chat-warning flex items-center justify-center text-sm flex-shrink-0">⏳</div>
            <div className="bg-amber-900/30 border border-amber-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-amber-400">
              {espera.razon}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={enviar} className="flex-shrink-0 px-6 py-4 border-t border-chat-border">
        <div className="flex gap-3 bg-chat-surface border border-chat-border rounded-2xl px-4 py-3">
          <input
            type="text"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-chat-muted focus:outline-none"
            disabled={cargando}
          />
          <button
            type="submit"
            disabled={!mensaje.trim() || cargando}
            className="bg-chat-accent hover:bg-chat-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors flex-shrink-0"
          >
            Enviar
          </button>
        </div>
        <p className="text-center text-xs text-chat-muted mt-2">Modo demo — las conversaciones no se guardan</p>
      </form>
    </div>
  )
}
