export default function WelcomeState({ connected, loading }) {
  if (!connected) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-10">
        <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="#32386A" strokeWidth="2" className="w-10 h-10">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-primary mb-2">Selecciona un agente</h2>
        <p className="text-sm text-text-muted max-w-[320px]">
          Introduce tu Owner Key y pulsa Conectar para gestionar los agentes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-10">
      <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="#32386A" strokeWidth="2" className="w-10 h-10">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 className="text-xl font-extrabold text-primary mb-2">Dashboard de Agentes</h2>
      <p className="text-sm text-text-muted max-w-[320px]">
        Selecciona un agente del panel izquierdo para ver y editar sus archivos de configuración.
      </p>
    </div>
  )
}
