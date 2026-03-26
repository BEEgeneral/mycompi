import { useState, useEffect } from 'react'

function Badge({ children, color = 'gray' }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  )
}

function Seccion({ titulo, icono, children, color = 'gray' }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className={`px-4 py-3 bg-${color}-50 border-b border-${color}-100 flex items-center gap-2`}>
        <span className="text-sm">{icono}</span>
        <span className="text-xs font-bold text-gray-700">{titulo}</span>
      </div>
      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
  )
}

function Item({ fecha, texto, tipo }) {
  const colors = {
    decision: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-800' },
    prioridad: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', text: 'text-amber-800' },
    tough: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', text: 'text-red-800' },
  }
  const c = colors[tipo] || colors.decision

  return (
    <div className={`flex gap-3 p-3 rounded-lg ${c.bg} border ${c.border}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold ${c.text}`}>{texto}</div>
        <div className="text-[10px] text-gray-400 mt-1">{fecha}</div>
      </div>
    </div>
  )
}

function StandupCard({ standup }) {
  const [expanded, setExpanded] = useState(false)

  // Parsear secciones del standup
  const secciones = {}
  let seccionActual = null
  let contenidoActual = []

  standup.contenido.split('\n').forEach(line => {
    if (line.startsWith('### ')) {
      if (seccionActual) secciones[seccionActual] = contenidoActual.join('\n').trim()
      seccionActual = line.replace('### ', '').trim()
      contenidoActual = []
    } else {
      contenidoActual.push(line)
    }
  })
  if (seccionActual) secciones[seccionActual] = contenidoActual.join('\n').trim()

  const seccionKeys = Object.keys(secciones)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">
            📅 {standup.fecha}
          </span>
          {seccionKeys.length > 0 && (
            <div className="flex gap-1.5">
              {seccionKeys.map(k => (
                <Badge key={k} color={
                  k.toLowerCase().includes('decisión') ? 'blue' :
                  k.toLowerCase().includes('prioridad') ? 'yellow' :
                  k.toLowerCase().includes('tough') ? 'red' : 'gray'
                }>
                  {k}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {seccionKeys.map(key => (
            <div key={key} className="mt-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{key}</div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 font-sans">
                {secciones[key]}
              </pre>
            </div>
          ))}
          {!seccionKeys.length && (
            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans mt-3">{standup.contenido}</pre>
          )}
        </div>
      )}
    </div>
  )
}

export default function DecisionesTab({ apiCall }) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [aprendizajes, setAprendizajes] = useState('')
  const [tab, setTab] = useState('standups')

  const cargar = async () => {
    setLoading(true)
    try {
      const [d, a] = await Promise.all([
        apiCall('/api/admin/decisiones'),
        apiCall('/api/admin/aprendizajes'),
      ])
      setData(d)
      setAprendizajes(a.aprendizajes || '')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const { standups = [], decisiones = [], prioridades = [], toughLove = [] } = data || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Decisiones del Paco</h3>
          <p className="text-xs text-gray-400 mt-0.5">Lo que el equipo ha decidido y por qué</p>
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="border border-gray-200 text-gray-500 px-4 py-1.5 rounded-full text-xs font-semibold hover:border-gray-400 transition-colors disabled:opacity-40"
        >
          {loading ? '⏳' : '↻'} Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'standups', label: '📋 Standups', count: standups.length },
          { id: 'decisiones', label: '✅ Decisiones', count: decisiones.length },
          { id: 'prioridades', label: '🎯 Prioridades', count: prioridades.length },
          { id: 'tough', label: '💪 Tough Love', count: toughLove.length },
          { id: 'aprendizajes', label: '📚 Aprendizajes', count: null },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-sm text-gray-400">Cargando...</div>
      )}

      {!loading && tab === 'standups' && (
        <div className="space-y-3">
          {standups.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm font-bold text-gray-600 mb-1">Sin standups todavía</div>
              <div className="text-xs text-gray-400">El Paco escribe su primer standup mañana a las 2AM</div>
            </div>
          )}
          {standups.map(s => (
            <StandupCard key={s.fecha} standup={s} />
          ))}
        </div>
      )}

      {!loading && tab === 'decisiones' && (
        <div className="space-y-2">
          {decisiones.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-sm font-bold text-gray-600">Sin decisiones registradas</div>
            </div>
          )}
          {decisiones.map((d, i) => (
            <Item key={i} {...d} tipo="decision" />
          ))}
        </div>
      )}

      {!loading && tab === 'prioridades' && (
        <div className="space-y-2">
          {prioridades.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-sm font-bold text-gray-600">Sin prioridades registradas</div>
            </div>
          )}
          {prioridades.map((p, i) => (
            <Item key={i} {...p} tipo="prioridad" />
          ))}
        </div>
      )}

      {!loading && tab === 'tough' && (
        <div className="space-y-2">
          {toughLove.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">💪</div>
              <div className="text-sm font-bold text-gray-600">Sin Tough Love todavía</div>
              <div className="text-xs text-gray-400 mt-1">El Paco dirá "no" cuando las prioridades estén mal</div>
            </div>
          )}
          {toughLove.map((t, i) => (
            <Item key={i} {...t} tipo="tough" />
          ))}
        </div>
      )}

      {!loading && tab === 'aprendizajes' && (
        <div>
          {aprendizajes ? (
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-5 font-sans leading-relaxed">
              {aprendizajes}
            </pre>
          ) : (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-sm font-bold text-gray-600">Sin aprendizajes compartidos</div>
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      {!loading && data && (decisiones.length + prioridades.length + toughLove.length) > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-blue-700">{decisiones.length}</div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Decisiones</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-700">{prioridades.length}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Prioridades</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-red-700">{toughLove.length}</div>
            <div className="text-[10px] text-red-600 font-semibold mt-0.5">Tough Love</div>
          </div>
        </div>
      )}
    </div>
  )
}
