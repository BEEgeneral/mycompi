import { useState } from 'react'

const equipo = [
  {
    id: 'director',
    nombre: 'Alberto Gala',
    emoji: '🎯',
    rol: 'Director de Equipo',
    color: 'from-gray-800 to-gray-900',
    borde: 'border-gray-900',
    jefe: null,
    funciones: [
      'Coordina todo tu equipo agéntico',
      'Toma decisiones estratégicas contigo',
      'Supervisa que cada agente cumpla sus objetivos',
      'Te reporta el progreso semanal',
    ],
    tareaEjemplo: 'Cada lunes te envía un resumen de lo que hizo cada agente durante la semana.',
  },
  {
    id: 'marketing',
    nombre: 'Enzo Herrera',
    emoji: '📊',
    rol: 'Marketing',
    color: 'from-blue-500 to-indigo-600',
    borde: 'border-blue-400',
    jefe: 'Alberto Gala',
    funciones: [
      'Crea contenido para redes sociales y blog',
      'Gestiona campañas de publicidad (Meta, Google Ads)',
      'Optimiza SEO de tu web para atraer tráfico',
      'Analiza métricas y propone mejoras',
    ],
    tareaEjemplo: 'Te prepara 30 posts para el mes y los publica automáticamente.',
  },
  {
    id: 'ventas',
    nombre: 'Carlos Mendoza',
    emoji: '💼',
    rol: 'Ventas',
    color: 'from-green-500 to-emerald-600',
    borde: 'border-green-400',
    jefe: 'Alberto Gala',
    funciones: [
      'Captura y qualification leads nuevos',
      'Hace seguimiento automático de prospects',
      'Cierra deals y gestiona objectioness',
      'Te alerta cuando hay una oportunidad caliente',
    ],
    tareaEjemplo: 'Te ha contactado alguien por Instagram. Carlos le manda un mensaje personalizado y agenda una llamada contigo.',
  },
  {
    id: 'atencion',
    nombre: 'Laura Montes',
    emoji: '💬',
    rol: 'Atención al Cliente',
    color: 'from-pink-500 to-rose-600',
    borde: 'border-pink-400',
    jefe: 'Alberto Gala',
    funciones: [
      'Responde dudas de tus clientes al instante',
      'Gestiona quejas y escal cuando es necesario',
      'Recoge feedback y lo sintetiza para ti',
      'Disponible 24/7 — no descansa ni en festivos',
    ],
    tareaEjemplo: 'Un cliente te pregunta a las 11pm si hacéis envíos a Andorra. Laura responde al momento.',
  },
  {
    id: 'operaciones',
    nombre: 'Elena Ortega',
    emoji: '⚙️',
    rol: 'Operaciones',
    color: 'from-orange-500 to-amber-600',
    borde: 'border-orange-400',
    jefe: 'Alberto Gala',
    funciones: [
      'Automatiza procesos repetitivos de tu negocio',
      'Conecta herramientas que no hablan entre sí',
      'Detecta cuellos de botella y propone soluciones',
      'Genera informes operativos',
    ],
    tareaEjemplo: 'Cada viernes te envía un excel con el resumen de ventas, stock y métricas del semana.',
  },
  {
    id: 'data',
    nombre: 'Diana Palau',
    emoji: '📈',
    rol: 'Data & Growth',
    color: 'from-purple-500 to-violet-600',
    borde: 'border-purple-400',
    jefe: 'Alberto Gala',
    funciones: [
      'Analiza datos de tu negocio para encontrar oportunidades',
      'Identifica patrones de comportamiento de clientes',
      'Te ayuda a entender qué funciona y qué no',
      'Construye dashboards con métricas clave',
    ],
    tareaEjemplo: 'Descubre que los clientes que compran los martes tienen un ticket 40% mayor. Te lo comunica y propone una acción.',
  },
]

function AgentCard({ agent, expanded, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${expanded ? `border-brand-yellow shadow-xl ${agent.borde}` : 'border-gray-100'}`}
    >
      {/* Glow cuando expandido */}
      {expanded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} rounded-2xl opacity-5 -z-10`} />
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
          {agent.inicial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-gray-900">{agent.nombre}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{agent.rol}</div>
          {agent.jefe && (
            <div className="text-xs text-gray-400 mt-1">Reporta a: {agent.jefe}</div>
          )}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 ${expanded ? `border-brand-yellow bg-brand-yellow/10` : 'border-gray-200'} flex items-center justify-center flex-shrink-0 transition-colors`}>
          {expanded && <span className="text-brand-yellow text-xs font-bold">✓</span>}
        </div>
      </div>

      {/* Preview funciones */}
      <div className="space-y-1.5">
        {agent.funciones.slice(0, expanded ? undefined : 2).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-brand-yellow text-xs flex-shrink-0 mt-0.5">•</span>
            <span className="text-xs text-gray-600 leading-relaxed">{f}</span>
          </div>
        ))}
        {!expanded && agent.funciones.length > 2 && (
          <div className="text-xs text-gray-400 font-medium pt-1">+{agent.funciones.length - 2} más</div>
        )}
      </div>

      {/* Expandido: tarea ejemplo */}
      {expanded && (
        <div className={`mt-5 p-4 bg-gradient-to-br ${agent.color} rounded-xl`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">Ejemplo de tarea</div>
          <div className="text-sm text-white font-medium leading-relaxed">{agent.tareaEjemplo}</div>
        </div>
      )}
    </div>
  )
}

export default function TeamPresentation() {
  const [activeId, setActiveId] = useState(null)

  const toggle = (id) => setActiveId(a => a === id ? null : id)

  return (
    <section id="equipo" className="py-16 md:py-[100px] px-6 bg-white border-t border-gray-100">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3 block">Tu equipo agéntico</span>
          <h2 className="text-[28px] md:text-[clamp(28px,4vw,44px)] font-extrabold text-gray-900 tracking-tight mb-4">
            No trabajan para ti. Trabajan contigo.
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-[560px] mx-auto leading-relaxed">
            Cada agente tiene un rol claro.-reportan a un director que los coordina. Tú delegas, ellos ejecutan.
          </p>
        </div>

        {/* Director banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-yellow/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl shadow-2xl flex-shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <div className="text-lg font-extrabold text-white">{equipo[0].nombre}</div>
                <div className="text-xs font-semibold text-brand-yellow uppercase tracking-wider mt-0.5">{equipo[0].rol}</div>
                <div className="text-sm text-gray-400 mt-2 leading-relaxed">{equipo[0].funciones[0]}</div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex -space-x-2">
                  {equipo.slice(1).map(a => (
                    <div key={a.id} className="w-10 h-10 rounded-full bg-gradient-to-br border-2 border-gray-800 flex items-center justify-center text-lg shadow-lg" title={a.nombre}>
                      {a.inicial}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 max-w-[120px]">Coordina a {equipo.length - 1} специалистов</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de agentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipo.slice(1).map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              expanded={activeId === agent.id}
              onClick={() => toggle(agent.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 mb-4">
            Cada plan incluye un equipo completo. Sin contratos, sin compromisos.
          </p>
          <a href="/checkout" className="inline-block bg-brand-yellow text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all">
            Contratar mi equipo →
          </a>
        </div>
      </div>
    </section>
  )
}
