import { useState } from 'react'

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export default function MetricasTab({ agente, apiCall }) {
  const [loading, setLoading] = useState(false)
  const [dash, setDash] = useState(null)
  const [estado, setEstado] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const [d, e] = await Promise.all([
        apiCall('/api/admin/metrics/dashboard'),
        apiCall('/api/admin/metrics/estado'),
      ])
      setDash(d)
      setEstado(e)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-primary">Dashboard de Costos</h3>
        <button
          onClick={cargar}
          className="border border-gray-200 text-text-muted px-4 py-1.5 rounded-full text-xs font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          ↻ Actualizar
        </button>
      </div>

      {!dash && !loading && (
        <div className="text-center py-12 text-sm text-text-muted">
          Pulsa "Actualizar" para cargar métricas.
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-sm text-text-muted">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          Cargando métricas...
        </div>
      )}

      {dash && estado && (
        <>
          {/* Bucket bar */}
          {estado.starter && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-primary mb-3">🪣 Bucket Global Starter</h4>
              <div className="bg-white h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    estado.starter.consumidos / estado.starter.maximos > 0.8
                      ? 'bg-red-500'
                      : estado.starter.consumidos / estado.starter.maximos > 0.5
                      ? 'bg-amber-400'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, (estado.starter.consumidos / estado.starter.maximos) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted">
                <span>{estado.starter.consumidos} / {estado.starter.maximos} requests</span>
                <span>Reset en {Math.ceil((estado.starter.resetEnMs || 0) / 60000)} min</span>
              </div>
            </div>
          )}

          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Tokens Totales</div>
              <div className="text-2xl font-extrabold tracking-tight text-primary leading-none">{formatNum(dash.resumen?.tokensTotal || 0)}</div>
              <div className="text-xs text-text-muted mt-1">histórico</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Sesiones</div>
              <div className="text-2xl font-extrabold tracking-tight text-primary leading-none">{formatNum(dash.resumen?.sessionsTotales || 0)}</div>
              <div className="text-xs text-text-muted mt-1">totales</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Gasto Est.</div>
              <div className="text-2xl font-extrabold tracking-tight text-green-600 leading-none">${(dash.resumen?.gastoTotal || 0).toFixed(4)}</div>
              <div className="text-xs text-text-muted mt-1">total estimado</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Sesiones Activas</div>
              <div className="text-2xl font-extrabold tracking-tight text-primary leading-none">{estado.sesionesActivas || 0}</div>
              <div className="text-xs text-text-muted mt-1">ahora</div>
            </div>
          </div>

          {/* Por plan */}
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Por Plan</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(estado.planes || {}).map(([plan, data]) => (
                <div key={plan} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">{plan}</span>
                  <span className="text-xs text-text-muted">{data.consumidos} / {data.limite} req/h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top clientes */}
          {dash.topClientes?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Top Clientes</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {dash.topClientes.slice(0, 8).map(c => (
                  <div key={c.clienteId} className="flex justify-between items-center px-4 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-semibold text-primary">👤 {c.clienteId}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">${c.costo.toFixed(4)}</div>
                      <div className="text-xs text-text-muted">{formatNum(c.tokens)} tokens · {c.turnos} turnos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
