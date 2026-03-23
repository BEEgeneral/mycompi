import { useState } from 'react'

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n || 0)
}

function Bar({ label, value, max, color = 'bg-brand-yellow', onClick }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex flex-col gap-1" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-600 truncate max-w-[120px]">{label}</span>
        <span className="text-xs font-bold text-gray-800 tabular-nums">${value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MetricasTab({ agente, apiCall }) {
  const [loading, setLoading] = useState(false)
  const [dash, setDash] = useState(null)
  const [estado, setEstado] = useState(null)
  const [selectedAgente, setSelectedAgente] = useState(null)

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

  const maxCosto = dash?.agentes?.reduce?.((m, a) => Math.max(m, a.costo), 0) || 1

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-800">Dashboard de Costos</h3>
        <button onClick={cargar} disabled={loading} className="border border-gray-200 text-gray-500 px-4 py-1.5 rounded-full text-xs font-semibold hover:border-gray-400 transition-colors disabled:opacity-40">
          {loading ? '⏳' : '↻'} Actualizar
        </button>
      </div>

      {!dash && !loading && (
        <div className="text-center py-16 text-sm text-gray-400">Pulsa Actualizar para cargar métricas.</div>
      )}

      {loading && (
        <div className="text-center py-16 text-sm text-gray-400">Cargando...</div>
      )}

      {dash && (
        <>
          {/* Bucket global */}
          {estado?.starter && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-gray-700 mb-3">🪣 Bucket Global Starter</h4>
              <div className="bg-white h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${estado.starter.consumidos / estado.starter.maximos > 0.8 ? 'bg-red-500' : estado.starter.consumidos / estado.starter.maximos > 0.5 ? 'bg-amber-400' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (estado.starter.consumidos / estado.starter.maximos) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{estado.starter.consumidos} / {estado.starter.maximos} requests</span>
                <span>Reset en {Math.ceil((estado.starter.resetEnMs || 0) / 60000)} min</span>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tokens Total</div>
              <div className="text-xl font-extrabold text-gray-800 tabular-nums">{formatNum(dash.resumen.tokensTotal)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">histórico</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Sesiones</div>
              <div className="text-xl font-extrabold text-gray-800 tabular-nums">{formatNum(dash.resumen.sessionsTotales)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">totales</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Gasto Est.</div>
              <div className="text-xl font-extrabold text-green-600 tabular-nums">${dash.resumen.gastoTotal.toFixed(4)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">total</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Activas</div>
              <div className="text-xl font-extrabold text-gray-800 tabular-nums">{estado?.sesionesActivas ?? 0}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">ahora</div>
            </div>
          </div>

          {/* Gasto por Agente */}
          {dash.agentes?.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Gasto por Agente</div>
              <div className="space-y-3">
                {dash.agentes.map(a => (
                  <Bar
                    key={a.agenteId}
                    label={a.agenteId}
                    value={a.costo}
                    max={dash.agentes[0]?.costo || 1}
                    color="bg-indigo-500"
                    onClick={() => setSelectedAgente(selectedAgente === a.agenteId ? null : a.agenteId)}
                  />
                ))}
              </div>
            </div>
          )}

          {dash.agentes?.length === 0 && !loading && (
            <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
              Sin datos aún. Cuando un agente procese requests, aparecerán aquí.
            </div>
          )}

          {/* Drill-down: agente → clientes */}
          {selectedAgente && dash.agentes && (
            <div className="mt-4 bg-gray-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <div className="text-xs font-bold text-indigo-700 mb-3">📊 {selectedAgente} — gasto por cliente</div>
              {(() => {
                const ag = dash.agentes.find(a => a.agenteId === selectedAgente)
                if (!ag?.clientes) return <div className="text-xs text-gray-400">Sin datos por cliente</div>
                return (
                  <div className="space-y-2">
                    {Object.entries(ag.clientes)
                      .sort((a, b) => b[1].costo - a[1].costo)
                      .map(([clienteId, data]) => (
                        <div key={clienteId} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate max-w-[120px]">  👤 {clienteId}</span>
                          <span className="text-gray-800 font-bold tabular-nums">${data.costo.toFixed(4)}</span>
                        </div>
                      ))}
                  </div>
                )
              })()}
              <button onClick={() => setSelectedAgente(null)} className="mt-3 text-[10px] text-indigo-500 hover:underline">Cerrar</button>
            </div>
          )}

          {/* Top Clientes */}
          {dash.topClientes?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Top Clientes</div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                {dash.topClientes.slice(0, 8).map(c => (
                  <div key={c.clienteId} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-gray-700">👤 {c.clienteId}</div>
                      <div className="text-[10px] text-gray-400">{formatNum(c.tokens)} tokens · {c.turnos} turnos</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-800 tabular-nums">${c.costo.toFixed(4)}</div>
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
