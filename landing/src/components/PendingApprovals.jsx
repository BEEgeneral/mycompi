/**
 * PendingApprovals — Muestra jobs pendientes de approval (CRITICA)
 * y permite al cliente aprobar/rechazar desde el dashboard.
 */
import { useState, useEffect } from 'react'

function fetchConAuth(url, options = {}) {
  const token = localStorage.getItem('mycompi_token')
  return fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

export default function PendingApprovals() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState({}) // id -> 'approving'|'rejecting'
  const [filter, setFilter] = useState('pending') // 'pending' | 'approved' | 'rejected'
  const [nota, setNota] = useState({}) // id -> text
  const [showNota, setShowNota] = useState({}) // id -> bool

  useEffect(() => {
    const estado = filter === 'pending' ? 'TODO' : filter === 'approved' ? 'DONE' : 'BLOCKED'
    fetchConAuth(`/api/trabajos?estado=TODO&limit=20`)
      .then(r => r.json())
      .then(d => {
        const all = d.trabajos || []
        // Split por si ya aprobado
        const filtered = all.filter(j => {
          if (filter === 'pending') return j.requiereAprobacion && !j.aprobadoAt
          if (filter === 'approved') return j.aprobadoAt && j.estado !== 'BLOCKED'
          if (filter === 'rejected') return j.estado === 'BLOCKED' && j.aprobadoAt
          return true
        })
        setJobs(filtered)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const handleAction = async (jobId, action) => {
    setActioning(prev => ({ ...prev, [jobId]: action }))
    const body = nota[jobId] ? { nota: nota[jobId] } : {}
    try {
      const endpoint = action === 'approve' ? `/api/trabajos/${jobId}/aprobar` : `/api/trabajos/${jobId}/rechazar`
      const r = await fetchConAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (d.ok || d.error?.includes('ya fue')) {
        setJobs(prev => prev.filter(j => j.id !== jobId))
      }
    } catch {}
    setActioning(prev => ({ ...prev, [jobId]: null }))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-brand-muted">Cargando...</div>
    </div>
  )

  const PRIORITY_COLOR = {
    CRITICA: 'bg-red-50 border-red-200',
    ALTA: 'bg-orange-50 border-orange-100',
    MEDIA: 'bg-yellow-50 border-yellow-100',
    BAJA: 'bg-brand-cream/40 border-brand-pastel/40',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-brand-dark">⚠️ Pendientes de aprobación</h2>
        <p className="text-sm text-brand-secondary mt-0.5">
          Los trabajos marcados como Críticos requieren tu confirmación antes de ejecutarse
        </p>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {[
          { id: 'pending', label: '⏳ Pendientes', count: jobs.length },
          { id: 'approved', label: '✅ Aprobadas', count: null },
          { id: 'rejected', label: '❌ Rechazadas', count: null },
        ].map(f => (
          <button key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === f.id
                ? 'bg-brand-dark text-white'
                : 'bg-brand-pastel/40 text-brand-secondary hover:bg-brand-pastel'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-brand-pastel rounded-2xl">
          <div className="text-4xl mb-3">{filter === 'pending' ? '🎉' : filter === 'approved' ? '✅' : '❌'}</div>
          <div className="text-brand-dark font-bold">
            {filter === 'pending' ? 'No hay trabajos pendientes' : filter === 'approved' ? 'Sin aprobaciones recientes' : 'Sin rechazos'}
          </div>
          <div className="text-brand-muted text-sm mt-1">
            {filter === 'pending' ? 'Tu equipo puede ejecutarse sin approval previo' : '—'}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id}
              className={`rounded-2xl border-2 p-5 ${PRIORITY_COLOR[job.prioridad] || 'bg-white border-brand-pastel'}`}
            >
              {/* Título + prioridad */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      job.prioridad === 'CRITICA' ? 'bg-red-100 text-red-600'
                        : job.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-600'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.prioridad}
                    </span>
                    {job.requiereAprobacion && !job.aprobadoAt && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        🔒 Requiere approval
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-brand-dark leading-snug">{job.titulo}</div>
                  {job.descripcion && (
                    <div className="text-sm text-brand-secondary mt-1 line-clamp-2">{job.descripcion}</div>
                  )}
                </div>

                {/* Badge de estado */}
                {job.aprobadoAt && (
                  <div className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                    job.estado === 'BLOCKED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {job.estado === 'BLOCKED' ? '❌ Rechazado' : '✅ Aprobado'}
                  </div>
                )}
              </div>

              {/* Nota de approval */}
              {job.notaAprobacion && (
                <div className="mt-3 text-sm text-brand-muted italic bg-white/50 rounded-xl p-3">
                  💬 "{job.notaAprobacion}"
                </div>
              )}

              {/* Acciones — solo pendientes */}
              {job.requiereAprobacion && !job.aprobadoAt && (
                <div className="mt-4 pt-4 border-t border-black/5">
                  {/* Toggle nota */}
                  <button onClick={() => setShowNota(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                    className="text-xs text-brand-muted hover:text-brand-dark mb-2">
                    {showNota[job.id] ? '▲ Ocultar nota' : '＋ Añadir nota opcional'}
                  </button>

                  {showNota[job.id] && (
                    <textarea
                      value={nota[job.id] || ''}
                      onChange={e => setNota(prev => ({ ...prev, [job.id]: e.target.value }))}
                      placeholder="Nota para el agente (opcional)..."
                      rows={2}
                      className="w-full text-sm border border-brand-pastel rounded-xl p-3 mb-3 focus:outline-none focus:border-brand-dark/50"
                    />
                  )}

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(job.id, 'approve')}
                      disabled={actioning[job.id]}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      {actioning[job.id] === 'approve' ? '⏳...' : '✅'} Aprobar y ejecutar
                    </button>
                    <button
                      onClick={() => handleAction(job.id, 'reject')}
                      disabled={actioning[job.id]}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:bg-red-30 text-red-600 font-bold py-3 rounded-xl text-sm border border-red-200 transition-colors"
                    >
                      {actioning[job.id] === 'reject' ? '⏳...' : '❌'} Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
