import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Agent definitions (from DB)
const AGENTS = [
  { id: 'laura', nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', color: 'from-pink-400 to-rose-500' },
  { id: 'enzo', nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', color: 'from-blue-400 to-indigo-500' },
  { id: 'carlos', nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', color: 'from-green-400 to-emerald-500' },
  { id: 'elena', nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', color: 'from-orange-400 to-amber-500' },
  { id: 'diana', nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', color: 'from-purple-400 to-violet-500' },
  { id: 'alberto', nombre: 'Alberto Gala', rol: 'Desarrollo', emoji: '💻', color: 'from-cyan-400 to-teal-500' },
]

const STATUS_CONFIG = {
  activo: { label: 'Activo', dot: 'bg-green-400', glow: 'shadow-green-400/50', text: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  descansando: { label: 'Descansando', dot: 'bg-yellow-400', glow: 'shadow-yellow-400/50', text: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  offline: { label: 'Offline', dot: 'bg-gray-400', glow: '', text: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
}

// Demo activity feed
const DEMO_ACTIVITY = [
  { agent: 'laura', text: 'Respondió 12 conversaciones', time: 'Hace 5 min', emoji: '💬' },
  { agent: 'enzo', text: 'Generó informe semanal de marketing', time: 'Hace 2h', emoji: '📊' },
  { agent: 'diana', text: 'Procesó 34 leads nuevos', time: 'Hace 5h', emoji: '📈' },
  { agent: 'carlos', text: 'Cerró 3 deals por €2.400', time: 'Ayer', emoji: '💼' },
  { agent: 'elena', text: 'Automatizó 8 procesos internos', time: 'Ayer', emoji: '⚙️' },
]

// Demo metrics
const DEMO_METRICS = {
  agentesActivos: 5,
  conversaciones: 142,
  tokensUsados: '28.4K',
  costoMensual: '€23.40',
}

function AgentCard({ agent, status = 'activo', messages = 0 }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  return (
    <div className="relative group">
      {/* Glow effect when active */}
      {status === 'activo' && (
        <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      )}
      <div className="relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-lg transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-lg`}>
            {agent.emoji}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${s.dot} ${s.glow ? `shadow-md ${s.glow}` : ''}`} />
            <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mb-3">
          <div className="font-bold text-sm text-gray-900">{agent.nombre}</div>
          <div className="text-xs text-gray-500 mt-0.5">{agent.rol}</div>
        </div>

        {/* Stats */}
        {status === 'activo' && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">💬 {messages}</span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="flex items-center gap-1">⚡ Online</span>
          </div>
        )}

        {/* Action */}
        <Link
          to="/chat"
          className={`mt-4 block text-center text-xs font-bold py-2 rounded-lg transition-all ${
            status === 'activo'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {status === 'activo' ? 'Chatear' : 'Offline'}
        </Link>
      </div>
    </div>
  )
}

function ActivityFeed({ activities }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-sm text-gray-900">Actividad reciente</h3>
        <span className="text-xs text-gray-400">Live</span>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((a, i) => {
          const agent = AGENTS.find(g => g.id === a.agent)
          return (
            <div key={i} className="px-6 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm flex-shrink-0">
                {agent?.emoji || '🤖'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 font-medium">{a.text}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{a.time}</div>
              </div>
              <div className="text-sm flex-shrink-0">{a.emoji}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MetricCard({ icon, value, label, trend }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trend.up ? '↑' : '↓'} {trend.val}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function StatusOverview({ active, resting, offline }) {
  const total = active + resting + offline
  const activePct = Math.round((active / total) * 100)
  const restingPct = Math.round((resting / total) * 100)
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-gray-900">Estado del equipo</h3>
        <span className="text-xs text-gray-400">{total} agentes</span>
      </div>

      {/* Bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex mb-4">
        {active > 0 && (
          <div className="bg-green-400 h-full" style={{ width: `${activePct}%` }} title={`Activos: ${active}`} />
        )}
        {resting > 0 && (
          <div className="bg-yellow-400 h-full" style={{ width: `${restingPct}%` }} title={`Descansando: ${resting}`} />
        )}
        {offline > 0 && (
          <div className="bg-gray-300 h-full flex-1" title={`Offline: ${offline}`} />
        )}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {[
          { key: 'activo', label: 'Activos', count: active, color: 'bg-green-400', text: 'text-green-600' },
          { key: 'descansando', label: 'Descansando', count: resting, color: 'bg-yellow-400', text: 'text-yellow-600' },
          { key: 'offline', label: 'Offline', count: offline, color: 'bg-gray-300', text: 'text-gray-500' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
            <span className={`text-xs font-bold ${item.text}`}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | activo | descansando | offline

  useEffect(() => {
    const token = localStorage.getItem('mycompi_token')
    const saved = localStorage.getItem('mycompi_usuario')
    if (!token) {
      navigate('/login')
      return
    }
    if (saved) {
      setUsuario(JSON.parse(saved))
    }
    setLoading(false)
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    navigate('/login')
  }

  if (loading) return null

  // Simulated agent statuses (in prod this comes from API)
  const agentStatuses = {
    laura: 'activo',
    enzo: 'activo',
    carlos: 'descansando',
    elena: 'offline',
    diana: 'activo',
    alberto: 'activo',
  }

  const agentMessages = {
    laura: 14,
    enzo: 6,
    carlos: 0,
    elena: 0,
    diana: 9,
    alberto: 3,
  }

  const filteredAgents = AGENTS.filter(a => {
    if (filter === 'all') return true
    return agentStatuses[a.id] === filter
  })

  const activeCount = Object.values(agentStatuses).filter(s => s === 'activo').length
  const restingCount = Object.values(agentStatuses).filter(s => s === 'descansando').length
  const offlineCount = Object.values(agentStatuses).filter(s => s === 'offline').length

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 pt-[88px] pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Hola, {usuario?.nombre?.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Aquí tienes el estado de tu equipo agéntico
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-xl transition-colors self-start"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Plan banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Tu plan</div>
              <div className="text-xl font-extrabold text-white">
                {(usuario?.cliente?.plan || 'EQUIPO')} —{' '}
                <span className="text-brand-yellow">€49/mes</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {activeCount}/{AGENTS.length} agentes activos · Renovación en 14 días
              </div>
            </div>
            <a
              href="#"
              className="bg-brand-yellow text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-all self-start"
            >
              Gestionar plan
            </a>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon="🤖" value={activeCount} label="Agentes activos" trend={{ up: true, val: '100%' }} />
          <MetricCard icon="💬" value={DEMO_METRICS.conversaciones} label="Conversaciones" trend={{ up: true, val: '+12%' }} />
          <MetricCard icon="⚡" value={DEMO_METRICS.tokensUsados} label="Tokens usados" trend={{ up: true, val: '+8%' }} />
          <MetricCard icon="💰" value={DEMO_METRICS.costoMensual} label="Costo del mes" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Agent grid */}
          <div className="lg:col-span-2">
            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-4">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'activo', label: 'Activos' },
                { key: 'descansando', label: 'Descansando' },
                { key: 'offline', label: 'Offline' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                    filter === tab.key
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Agent cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAgents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  status={agentStatuses[agent.id]}
                  messages={agentMessages[agent.id]}
                />
              ))}
            </div>
          </div>

          {/* Right: Status + Activity */}
          <div className="space-y-6">
            <StatusOverview active={activeCount} resting={restingCount} offline={offlineCount} />
            <ActivityFeed activities={DEMO_ACTIVITY} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Añadir agente', icon: '➕', desc: 'Expandir equipo' },
            { label: 'Ver chats', icon: '💬', desc: 'Historial completo' },
            { label: 'Reportes', icon: '📊', desc: 'Informes semanales' },
            { label: 'Configurar', icon: '⚙️', desc: 'Ajustes del plan' },
          ].map(action => (
            <button
              key={action.label}
              className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 hover:shadow-md transition-all"
            >
              <div className="text-xl mb-2">{action.icon}</div>
              <div className="font-bold text-sm text-gray-900">{action.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
