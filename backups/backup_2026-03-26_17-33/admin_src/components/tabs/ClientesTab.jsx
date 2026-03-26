import { useState, useEffect } from 'react'

export default function ClientesTab({ agente, apiCall }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiCall(`/api/admin/agentes/${agente.id}/clientes`)
      .then(data => setClientes(data.clientes || []))
      .catch(() => setClientes([]))
      .finally(() => setLoading(false))
  }, [agente.id])

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3 text-sm text-text-muted">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          Cargando...
        </div>
      )}
      {!loading && clientes.length === 0 && (
        <div className="text-center py-12 text-sm text-text-muted">
          Este agente aún no tiene clientes. Cuando un cliente lo contrate, aparecerá aquí.
        </div>
      )}
      {!loading && clientes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {clientes.map(c => (
            <div key={c} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-bold text-sm text-primary mb-1">👤 {c}</h4>
              <p className="text-xs text-text-muted">Overlay activo — click para ver</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
