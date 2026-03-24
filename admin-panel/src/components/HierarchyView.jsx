import { useState } from 'react'

const JERARQUIA = {
  nombre: 'Alberto Gala',
  emoji: '🎯',
  rol: 'Director de Equipo',
  color: 'from-gray-800 to-gray-900',
  colorText: 'text-white',
  hijos: [
    {
      nombre: 'Laura Montes',
      emoji: '💬',
      rol: 'Atención al Cliente',
      color: 'from-pink-500 to-rose-600',
      colorText: 'text-white',
    },
    {
      nombre: 'Enzo Herrera',
      emoji: '📊',
      rol: 'Marketing',
      color: 'from-blue-500 to-indigo-600',
      colorText: 'text-white',
    },
    {
      nombre: 'Carlos Mendoza',
      emoji: '💼',
      rol: 'Ventas',
      color: 'from-green-500 to-emerald-600',
      colorText: 'text-white',
    },
    {
      nombre: 'Elena Ortega',
      emoji: '⚙️',
      rol: 'Operaciones',
      color: 'from-orange-500 to-amber-600',
      colorText: 'text-white',
    },
    {
      nombre: 'Diana Palau',
      emoji: '📈',
      rol: 'Data & Growth',
      color: 'from-purple-500 to-violet-600',
      colorText: 'text-white',
    },
  ]
}

function AgentNode({ agent, isRoot = false }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`relative bg-gradient-to-br ${agent.color} ${agent.colorText} rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform ${isRoot ? 'min-w-[200px]' : 'min-w-[160px]'}`}
      >
        {agent.hijos && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs text-gray-400">
            {expanded ? '▲' : '▼'}
          </div>
        )}
        <div className="text-3xl mb-2">{agent.inicial}</div>
        <div className="font-bold text-sm">{agent.nombre}</div>
        <div className="text-[10px] opacity-80 mt-0.5">{agent.rol}</div>
      </div>

      {/* Children */}
      {agent.hijos && expanded && (
        <div className="relative mt-6">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-200" />
          {/* Horizontal line if multiple children */}
          {agent.hijos.length > 1 && (
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
          )}
          <div className={`flex gap-4 pt-4 ${agent.hijos.length > 3 ? 'flex-wrap justify-center' : ''}`}>
            {agent.hijos.map((hijo, i) => (
              <div key={i} className="relative flex flex-col items-center">
                {/* Vertical line from horizontal */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-200" style={{ top: '-16px' }} />
                <AgentNode agent={hijo} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HierarchyView() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Jerarquía de Agentes</h2>
        <p className="text-xs text-gray-500 mt-1">Estructura de tu equipo agéntico y relaciones de reporte</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex justify-center min-w-[600px] pt-8">
          <AgentNode agent={JERARQUIA} isRoot />
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {[
          { color: 'bg-pink-500', label: 'Atención al Cliente' },
          { color: 'bg-blue-500', label: 'Marketing' },
          { color: 'bg-green-500', label: 'Ventas' },
          { color: 'bg-orange-500', label: 'Operaciones' },
          { color: 'bg-purple-500', label: 'Data & Growth' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
