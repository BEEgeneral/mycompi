export default function Sidebar({ agentes, agenteActual, onSelect, loading, connected }) {
  if (!connected) {
    return (
      <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-[96px]">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Agentes Instalados</h2>
        </div>
        <div className="p-3">
          <div className="text-sm text-text-muted text-center py-8">Introduce el Owner Key y pulsa Conectar.</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-[96px]">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">Agentes Instalados</h2>
      </div>
      <div className="p-3 max-h-[500px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-3 text-sm text-text-muted">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            Conectando...
          </div>
        )}
        {!loading && agentes.length === 0 && (
          <div className="text-sm text-text-muted text-center py-8">No hay agentes registrados.</div>
        )}
        {agentes.map(a => (
          <div
            key={a.id}
            onClick={() => onSelect(a)}
            className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all mb-1.5 border-2 ${
              agenteActual?.id === a.id
                ? 'bg-sky-50 border-primary'
                : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-primary truncate">{a.nombre}</div>
              <div className="text-xs text-text-muted truncate">
                {a.tipo === 'interno' ? 'Agente Interno' : 'Agente Operativo'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.activo ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        ))}
      </div>
    </aside>
  )
}
