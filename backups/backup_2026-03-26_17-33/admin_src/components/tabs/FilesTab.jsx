import { useState } from 'react'

const FILE_TABS = ['SOUL.md', 'IDENTITY.md', 'SKILL.md', 'MEMORY.md']

const TITULOS = {
  'SOUL.md': 'Personalidad y filosofía',
  'IDENTITY.md': 'Identidad y contexto',
  'SKILL.md': 'Capacidades y habilidades',
  'MEMORY.md': 'Aprendizaje acumulado',
}

const FILE_MAP = {
  'SOUL.md': 'soul',
  'IDENTITY.md': 'identity',
  'SKILL.md': 'skill',
  'MEMORY.md': 'memory',
}

export default function FilesTab({ agente, apiCall }) {
  const [archivo, setArchivo] = useState('SOUL.md')
  const [contenido, setContenido] = useState(agente.archivos?.[archivo] || '')
  const [original, setOriginal] = useState(agente.archivos?.[archivo] || '')
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState('')

  const handleTabChange = (file) => {
    setArchivo(file)
    setContenido(agente.archivos?.[file] || '')
    setOriginal(agente.archivos?.[file] || '')
  }

  const modificado = contenido !== original

  const guardar = async () => {
    setGuardando(true)
    try {
      await apiCall(`/api/admin/agentes/${agente.id}`, {
        method: 'PUT',
        body: JSON.stringify({ [FILE_MAP[archivo]]: contenido }),
      })
      agente.archivos[archivo] = contenido
      setOriginal(contenido)
      setToast('Guardado correctamente')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setToast('Error: ' + err.message)
      setTimeout(() => setToast(''), 3000)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      {/* File tabs */}
      <div className="flex gap-1 mb-4">
        {FILE_TABS.map(f => (
          <button
            key={f}
            onClick={() => handleTabChange(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              archivo === f ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:text-primary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold text-text-muted mb-3">{archivo} — {TITULOS[archivo]}</div>

      <textarea
        value={contenido}
        onChange={e => setContenido(e.target.value)}
        className="w-full min-h-[350px] bg-gray-50 border border-gray-200 rounded-xl text-primary px-4 py-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:border-primary"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-text-muted">
          {modificado ? 'Cambios sin guardar' : 'Guardado'}
        </span>
        <div className="flex gap-2">
          {modificado && (
            <button
              onClick={() => { setContenido(original); setToast('') }}
              className="border border-gray-200 text-text-muted px-4 py-2 rounded-full text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Descartar
            </button>
          )}
          <button
            onClick={guardar}
            disabled={!modificado || guardando}
            className="bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            {guardando ? 'Guardando...' : '💾 Guardar'}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-semibold ${
          toast.startsWith('Error') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast}
        </div>
      )}
    </div>
  )
}
