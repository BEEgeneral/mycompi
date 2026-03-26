import { useState } from 'react'

const equipo = [
  {
    id: 'director',
    nombre: 'Alberto Gala',
    emoji: '🎯',
    rol: 'Director',
    color: 'from-brand-dark to-brand-dark/80',
    foto: 'https://ui-avatars.com/api/?name=Alberto+Gala&background=2D3261&color=FFD154&size=160&font-size=0.35&bold=true',
    funciones: [
      'Coordina todo tu equipo de profesionales',
      'Toma decisiones estratégicas contigo',
      'Supervisa que cada profesional cumpla sus objetivos',
      'Te reporta el progreso semanal',
    ],
    tareaEjemplo: 'Cada lunes te envía un resumen de lo que hizo cada profesional durante la semana.',
  },
  {
    id: 'marketing',
    nombre: 'Enzo Herrera',
    emoji: '📊',
    rol: 'Marketing',
    color: 'from-blue-500 to-blue-600',
    foto: 'https://ui-avatars.com/api/?name=Enzo+Herrera&background=2563eb&color=fff&size=160&font-size=0.35&bold=true',
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
    foto: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=059669&color=fff&size=160&font-size=0.35&bold=true',
    funciones: [
      'Captura y qualifica leads nuevos',
      'Hace seguimiento automático de prospects',
      'Cierra deals y gestiona objeciones',
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
    foto: 'https://ui-avatars.com/api/?name=Laura+Montes&background=db2777&color=fff&size=160&font-size=0.35&bold=true',
    funciones: [
      'Responde dudas de tus clientes al instante',
      'Gestiona quejas y escala cuando es necesario',
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
    foto: 'https://ui-avatars.com/api/?name=Elena+Ortega&background=ea580c&color=fff&size=160&font-size=0.35&bold=true',
    funciones: [
      'Automatiza procesos repetitivos de tu negocio',
      'Conecta herramientas que no hablan entre sí',
      'Detecta cuellos de botella y propone soluciones',
      'Genera informes operativos',
    ],
    tareaEjemplo: 'Cada viernes te envía un excel con el resumen de ventas, stock y métricas de la semana.',
  },
  {
    id: 'data',
    nombre: 'Diana Palau',
    emoji: '📈',
    rol: 'Data & Growth',
    color: 'from-purple-500 to-violet-600',
    foto: 'https://ui-avatars.com/api/?name=Diana+Palau&background=7c3aed&color=fff&size=160&font-size=0.35&bold=true',
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
      className={`relative bg-white border-2 rounded-[2rem] p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        expanded ? `border-brand-yellow shadow-xl` : 'border-brand-pastel'
      }`}
    >
      {/* Avatar circular centrado — por encima de la tarjeta */}
      <div className="flex justify-center -mt-14 mb-4">
        {agent.foto ? (
          <img
            src={agent.foto}
            alt={agent.nombre}
            className={`w-20 h-20 rounded-full object-cover shadow-xl ring-4 ring-white ${
              expanded ? 'ring-brand-yellow' : 'ring-brand-pastel'
            }`}
          />
        ) : (
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl shadow-xl ring-4 ring-white`}>
            {agent.emoji}
          </div>
        )}
      </div>

      {/* Nombre y rol centrados */}
      <div className="text-center mb-4">
        <div className="font-bold text-base text-brand-dark">{agent.nombre}</div>
        <div className="text-xs font-semibold text-brand-secondary uppercase tracking-wide mt-0.5">{agent.rol}</div>
      </div>

      {/* Preview funciones */}
      <div className="space-y-1.5">
        {agent.funciones.slice(0, expanded ? undefined : 2).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-brand-yellow text-xs flex-shrink-0 mt-0.5">•</span>
            <span className="text-xs text-brand-secondary leading-relaxed">{f}</span>
          </div>
        ))}
        {!expanded && agent.funciones.length > 2 && (
          <div className="text-xs text-brand-muted font-medium pt-1">+{agent.funciones.length - 2} más</div>
        )}
      </div>

      {/* Expandido: tarea ejemplo */}
      {expanded && (
        <div className={`mt-5 p-4 bg-gradient-to-br ${agent.color} rounded-[1.5rem]`}>
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
    <section id="equipo" className="py-16 md:py-[100px] px-6 bg-brand-cream border-t border-brand-pastel">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3 block">Tu equipo de profesionales</span>
          <h2 className="text-[28px] md:text-[clamp(28px,4vw,44px)] font-extrabold text-brand-dark tracking-tight mb-4">
            No trabajan para ti. Trabajan contigo.
          </h2>
          <p className="text-sm md:text-base text-brand-secondary max-w-[560px] mx-auto leading-relaxed">
            Cada profesional tiene un rol claro. Coordinados por un director, ejecutan las tareas para que tú puedas concentrate en lo que importa.
          </p>
        </div>

        {/* Director banner */}
        <div className="mb-10">
          <div className="relative overflow-hidden bg-brand-dark rounded-[2rem] p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative flex items-center gap-6">
              <img
                src={equipo[0].foto}
                alt={equipo[0].nombre}
                className="w-20 h-20 rounded-full object-cover shadow-2xl flex-shrink-0 ring-4 ring-brand-yellow/30"
              />
              <div className="flex-1">
                <div className="text-lg font-extrabold text-white">{equipo[0].nombre}</div>
                <div className="text-xs font-semibold text-brand-yellow uppercase tracking-wider mt-0.5">{equipo[0].rol}</div>
                <div className="text-sm text-white/70 mt-2 leading-relaxed">{equipo[0].funciones[0]}</div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex -space-x-3">
                  {equipo.slice(1).map(a => (
                    a.foto ? (
                      <img key={a.id} src={a.foto} alt={a.nombre} className="w-10 h-10 rounded-full object-cover border-2 border-brand-dark shadow-lg" title={a.nombre} />
                    ) : (
                      <div key={a.id} className="w-10 h-10 rounded-full bg-gradient-to-br border-2 border-brand-dark flex items-center justify-center text-lg shadow-lg" title={a.nombre}>
                        {a.emoji}
                      </div>
                    )
                  ))}
                </div>
                <div className="text-xs text-white/50 max-w-[120px]">Coordina a {equipo.length - 1} profesionales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de profesionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="text-sm text-brand-secondary mb-4">
            Cada plan incluye un equipo completo. Sin contratos, sin compromisos.
          </p>
          <a href="/#/checkout" className="inline-flex items-center gap-2 bg-brand-yellow text-brand-dark font-bold px-8 py-3.5 rounded-pill hover:bg-brand-dark-yellow transition-all shadow-lg shadow-brand-yellow/20">
            Contratar mi equipo
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
