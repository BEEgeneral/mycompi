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

function ChatWidget({ usuario, token }) {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/chat/interacciones?limit=20', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.interacciones) setMensajes(d.interacciones.reverse()) })
      .catch(() => {})
  }, [token])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes])

  const enviar = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    setLoading(true)
    const texto = input.trim()
    setInput('')

    // Optimistic update
    setMensajes(prev => [...prev, {
      tipoPeticion: 'CONSULTAR_INFO',
      mensajeOriginal: texto,
      createdAt: new Date().toISOString(),
    }])

    try {
      const res = await fetch('/api/chat/interaccion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoPeticion: 'CONSULTAR_INFO', mensajeOriginal: texto }),
      })
      const d = await res.json()
      if (d.ok && d.interaccion) {
        // Replace optimistic with real
        setMensajes(prev => prev.map((m, i) => i === prev.length - 1 && m.mensajeOriginal === texto ? d.interaccion : m))
      }
    } catch {}

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">🎯</div>
        <div>
          <div className="font-bold text-sm text-gray-900">Orquestador</div>
          <div className="text-xs text-gray-400">Tu asistente de equipo</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {mensajes.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            <div className="text-3xl mb-2">🎯</div>
            <div>Sin mensajes aún. ¡Escríbele al Orquestador!</div>
          </div>
        )}
        {mensajes.map((m, i) => {
          const isUser = !m.agenteId || m.agenteId === 'cliente'
          return (
            <div key={m.id || i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                isUser
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <div>{m.mensajeOriginal || m.respuestaAgente}</div>
                <div className={`text-[10px] mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
                  {new Date(m.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={enviar} className="border-t border-gray-100 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escríbele al Orquestador..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
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
                  <div className="text-xs text-gray-400 mt-1">Tu Orquestador escribe su primer standup esta noche</div>
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
        Sin actividad todavía. Tu Orquestador te mantendrá informado.
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
      fetch('/api/chat/interacciones?limit=20', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({})),
    ]).then(([subData, chatData]) => {
      if (subData.subscription) setSubscription(subData.subscription)
      if (chatData.interacciones) setInteracciones(chatData.interacciones)
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
        <div className="flex gap-2 mb-6">
          {[
            { id: 'equipo', label: 'Mi equipo' },
            { id: 'decisiones', label: 'Decisiones' },
            { id: 'actividad', label: 'Actividad' },
            { id: 'cuenta', label: 'Mi cuenta' },
          ].map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>
        ) : (
          <>
            {/* TAB: EQUIPO */}
            {tab === 'equipo' && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                <div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Tu equipo agéntico</h2>
                    <p className="text-xs text-gray-400 mb-5">Profesionales trabajando 24/7 para tu negocio</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {agentes.map(a => (
                        <AgentCard key={a.id} agent={{ ...a, status: 'activo' }} />
                      ))}
                    </div>
                  </div>

                  {/* Chat con Orquestador */}
                  <ChatWidget usuario={usuario} token={token} />
                </div>

                {/* Sidebar derecha */}
                <div className="space-y-4">
                  {/* Métricas rápidas */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Resumen</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-extrabold text-gray-900">{interacciones.length}</div>
                        <div className="text-[10px] text-gray-400">Interacciones</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-extrabold text-gray-900">{agentes.length}</div>
                        <div className="text-[10px] text-gray-400">Agentes</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-extrabold text-green-600">{interacciones.filter(i => i.clienteAcepta).length}</div>
                        <div className="text-[10px] text-gray-400">Aceptadas</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xl font-extrabold text-indigo-600">{plan?.toUpperCase()}</div>
                        <div className="text-[10px] text-gray-400">Plan</div>
                      </div>
                    </div>
                  </div>

                  {/* Últimas interacciones */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Última actividad</h3>
                    <InteraccionesList interacciones={interacciones.slice(0, 5)} />
                  </div>
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
