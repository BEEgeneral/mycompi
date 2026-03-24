import { useState } from 'react'
import FilesTab from './tabs/FilesTab'
import ClientesTab from './tabs/ClientesTab'
import MetricasTab from './tabs/MetricasTab'

export default function AgentDetail({ agente, apiCall, onRecargar }) {
  const [tab, setTab] = useState('archivos')

  const tabs = [
    { id: 'archivos', label: 'Archivos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'metricas', label: 'Métricas' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-xl bg-sky-100 flex items-center justify-center text-2xl">
            {agente.inicial}
          </div>
          <div>
            <div className="font-extrabold text-lg text-primary">{agente.nombre}</div>
            <div className="text-xs text-text-muted">
              {agente.tipo === 'interno' ? 'Agente Interno' : 'Agente Operativo'}
            </div>
          </div>
        </div>
        <button
          onClick={onRecargar}
          className="border border-gray-200 text-text-main px-4 py-2 rounded-full text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
        >
          ↻ Recargar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-7 pt-4 border-b border-gray-100">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === t.id
                ? 'text-primary border-primary bg-white'
                : 'text-text-muted border-transparent hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-7">
        {tab === 'archivos' && <FilesTab agente={agente} apiCall={apiCall} />}
        {tab === 'clientes' && <ClientesTab agente={agente} apiCall={apiCall} />}
        {tab === 'metricas' && <MetricasTab agente={agente} apiCall={apiCall} />}
      </div>
    </div>
  )
}
