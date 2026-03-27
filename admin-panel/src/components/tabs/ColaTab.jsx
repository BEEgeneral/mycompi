import { useState, useEffect } from 'react'

const ESTADO_COLORS = {
  TODO: 'bg-gray-100 text-gray-600 border-gray-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-600 border-green-200',
  FAILED: 'bg-red-50 text-red-600 border-red-200',
  BLOCKED: 'bg-orange-50 text-orange-600 border-orange-200',
}

const PRIO_COLORS = {
  CRITICA: 'bg-red-100 text-red-700',
  ALTA: 'bg-orange-100 text-orange-700',
  MEDIA: 'bg-yellow-100 text-yellow-700',
  BAJA: 'bg-gray-100 text-gray-500',
}

function TiempoRelativo({ fecha }) {
  if (!fecha) return '—'
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'justo ahora'
  if (mins < 60) return `hace ${mins}m`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  return `hace ${Math.floor(horas / 24)}d`
}

function ResumenCards({ stats }) {
  if (!stats) return null
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-extrabold text-gray-900">{stats.pending}</div>
        <div className="text-xs text-gray-400 mt-0.5">Pendientes</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-extrabold text-blue-600">{stats.inProgress}</div>
        <div className="text-xs text-gray-400 mt-0.5">En progreso</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-extrabold text-green-600">{stats.recentlyCompleted}</div>
        <div className="text-xs text-gray-400 mt-0.5">Completadas (7d)</div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-2xl font-extrabold text-red-500">{stats.failed}</div>
        <div className="text-xs text-gray-400 mt-0.5">Fallidas</div>
      </div>
    </div>
  )
}

export default function ColaTab({ apiCall }) {
  const [tareas, setTareas] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODO')
  const [filtroAgente, setFiltroAgente] = useState('')
  const [tareaExpandida, setTareaExpandida] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado) params.set('estado', filtroEstado)
      if (filtroAgente) params.set('agenteId', filtroAgente)

      const [tareasData, statsData] = await Promise.all([
        apiCall(`/api/admin/cola?${params.toString()}`),
        apiCall('/api/admin/cola/resumen').catch(() => null),
      ])

      setTareas(tareasData.tareas || [])
      if (statsData) setStats(statsData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [filtroEstado, filtroAgente])

  const completarTarea = async (id) => {
    try {
      await apiCall(`/api/admin/cola/${id}/complete`, { method: 'POST' })
      setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: 'COMPLETED' } : t))
    } catch (e) { console.error(e) }
  }

  const fallarTarea = async (id) => {
    try {
      await apiCall(`/api/admin/cola/${id}/fail`, {
        method: 'POST',
        body: JSON.stringify({ errorMsg: 'Marcada como fallida por admin' })
      })
      setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: 'FAILED' } : t))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['TODO', 'IN_PROGRESS', 'COMPLETED', 'FAILED'].map(est => (
            <button key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filtroEstado === est
                  ? est === 'TODO' ? 'bg-gray-900 text-white border-gray-900' :
                    est === 'IN_PROGRESS' ? 'bg-blue-600 text-white border-blue-600' :
                    est === 'COMPLETED' ? 'bg-green-600 text-white border-green-600' :
                    'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}>
              {est === 'TODO' ? '📋 Pendientes' :
               est === 'IN_PROGRESS' ? '🔄 En curso' :
               est === 'COMPLETED' ? '✅ Completadas' : '❌ Fallidas'}
            </button>
          ))}
        </div>
        <select value={filtroAgente} onChange={e => setFiltroAgente(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
          <option value="">Todos los agentes</option>
          <option value="laura">💬 Laura</option>
          <option value="enzo">📊 Enzo</option>
          <option value="carlos">💼 Carlos</option>
          <option value="elena">⚙️ Elena</option>
          <option value="diana">📈 Diana</option>
          <option value="marcos">💻 Marcos</option>
          <option value="paco">🎯 Paco</option>
        </select>
      </div>

      <ResumenCards stats={stats} />

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Cargando tareas...</div>
      ) : tareas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm font-semibold text-gray-600">Sin tareas</div>
          <div className="text-xs text-gray-400 mt-1">No hay tareas en este estado</div>
        </div>
      ) : (
        <div className="space-y-2">
          {tareas.map(tarea => (
            <div key={tarea.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all">
              <div className="flex items-start gap-3">
                {/* PRIO */}
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${PRIO_COLORS[tarea.prioridad] || PRIO_COLORS.MEDIA}`}>
                  {tarea.prioridad}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${ESTADO_COLORS[tarea.estado] || ESTADO_COLORS.TODO}`}>
                      {tarea.estado}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 font-medium">{tarea.agenteId}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400"><TiempoRelativo fecha={tarea.createdAt} /></span>
                    {tarea.cliente && (
                      <>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">{tarea.cliente.nombre}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{tarea.titulo}</div>
                  {tarea.descripcion && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{tarea.descripcion}</div>
                  )}
                  {tarea.errorMsg && (
                    <div className="text-xs text-red-500 mt-1 bg-red-50 rounded-lg px-2 py-1">{tarea.errorMsg}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {tarea.estado === 'TODO' && (
                    <button onClick={() => completarTarea(tarea.id)}
                      className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200 font-semibold">
                      ✓ Completar
                    </button>
                  )}
                  {tarea.estado !== 'COMPLETED' && tarea.estado !== 'FAILED' && (
                    <button onClick={() => fallarTarea(tarea.id)}
                      className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-200 font-semibold">
                      ✗ Fallar
                    </button>
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
