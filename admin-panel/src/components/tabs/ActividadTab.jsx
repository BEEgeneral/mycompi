import { useState, useEffect } from 'react'

const AGENTE_EMOJIS = {
  paco: '🎯', laura: '💬', enzo: '📊', carlos: '💼',
  elena: '⚙️', diana: '📈', marcos: '💻', pelayo: '🤖'
}

function TiempoRelativo({ fecha }) {
  const ahora = Date.now()
  const diff = ahora - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'justo ahora'
  if (mins < 60) return `hace ${mins}m`
  const horas = Math.floor(mins / 60)
  if (horas < 24) return `hace ${horas}h`
  return `hace ${Math.floor(horas / 24)}d`
}

export default function ActividadTab({ apiCall }) {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('actividad')

  const cargarActividad = async () => {
    setLoading(true)
    try {
      // Notificaciones del admin (todas las notificaciones de todos los clientes)
      const data = await apiCall('/api/admin/notificaciones?limit=50')
      setNotificaciones(data.notificaciones || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'actividad') cargarActividad()
  }, [tab])

  const marcarLeida = async (id) => {
    try {
      await apiCall(`/api/admin/notificaciones/${id}/leida`, { method: 'PATCH' })
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    } catch (e) { console.error(e) }
  }

  const marcarTodas = async () => {
    try {
      await apiCall('/api/admin/notificaciones/marcar-todas-leidas', { method: 'POST' })
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {['actividad', 'agentes'].map(t => (
            <button key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t === 'actividad' ? '📋 Actividad' : '🤖 Agentes'}
            </button>
          ))}
        </div>
        {tab === 'actividad' && notificaciones.some(n => !n.leida) && (
          <button onClick={marcarTodas}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
            Marcar todas como leídas
          </button>
        )}
      </div>

      {tab === 'actividad' && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-sm text-gray-400">Cargando...</div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-sm font-semibold text-gray-600">Sin actividad reciente</div>
              <div className="text-xs text-gray-400 mt-1">Los agentes aún no han generado notificaciones</div>
            </div>
          ) : (
            notificaciones.map(n => (
              <div key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  n.leida ? 'bg-white border-gray-200 opacity-70' : 'bg-indigo-50 border-indigo-200'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                  n.tipo === 'ALERTA' ? 'bg-red-100 text-red-600' :
                  n.tipo === 'ACCION_REQUERIDA' ? 'bg-orange-100 text-orange-600' :
                  n.tipo === 'COMPLETADO' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {n.tipo === 'ALERTA' ? '⚠️' :
                   n.tipo === 'ACCION_REQUERIDA' ? '👉' :
                   n.tipo === 'COMPLETADO' ? '✅' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-700">{AGENTE_EMOJIS[n.agenteId] || '🤖'} {n.agenteId}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400"><TiempoRelativo fecha={n.createdAt} /></span>
                    {!n.leida && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                  </div>
                  <div className="text-xs font-semibold text-gray-800 mb-0.5">{n.titulo}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{n.contenido}</div>
                </div>
                {!n.leida && (
                  <button onClick={() => marcarLeida(n.id)}
                    className="text-[10px] text-indigo-500 hover:text-indigo-700 font-semibold flex-shrink-0">
                    ✓ Leer
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'agentes' && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🤖</div>
          <div className="text-sm font-semibold text-gray-600">Estado de agentes</div>
          <div className="text-xs text-gray-400 mt-1">Heartbeats activos: Laura, Enzo, Carlos</div>
          <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-xl p-4 inline-block">
            Los agentes despiertan según su schedule configurado en HEARTBEAT.md
          </div>
        </div>
      )}
    </div>
  )
}
