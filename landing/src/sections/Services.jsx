const servicios = [
  {
    icon: '💬',
    title: 'Atención al cliente 24/7',
    desc: 'Un cliente pregunta a las 11pm. Laura responde al momento. Cero esperas, cero frustraciones.',
    stat: 'Respuestas instantáneas',
  },
  {
    icon: '📊',
    title: 'Marketing que genera ventas',
    desc: 'Enzo no hace contenido por hacer. Crea campañas que attract leads reales y convierten.',
    stat: '+25% leads en 30 días',
  },
  {
    icon: '💼',
    title: 'Ventas sin perder oportunidades',
    desc: 'Carlos hace follow-up de cada lead automáticamente. Se acabaron los "les escribo mañana".',
    stat: '3x más cierres',
  },
  {
    icon: '⚙️',
    title: 'Automatiza lo repetitivo',
    desc: 'Elena conecta tus herramientas y elimina las tareas manuales. Lo que tardabas 4h, ella lo hace en 4 minutos.',
    stat: '80% tiempo ahorrado',
  },
  {
    icon: '📈',
    title: 'Datos que importan',
    desc: 'Diana te dice qué funciona y qué no. Decisiones basadas en datos, no en intuición.',
    stat: 'Reports semanales',
  },
  {
    icon: '💻',
    title: 'Tu web siempre actualizada',
    desc: 'Marcos crea y mantiene tu presencia online. Páginas, e-commerce, integrations — sin机房.',
    stat: 'Desde 1 día',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-gray-50 py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Lo que hacen por ti</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-gray-900 mb-3">
            Cada agente es un especialista que trabaja 24/7
          </h2>
          <p className="text-sm text-gray-500 max-w-[480px] mx-auto">
            No son herramientas. Son profesionales con nombre, memoria y objetivos. Encajan en tu equipo.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {servicios.map(s => (
            <div
              key={s.title}
              className="bg-white border border-gray-200 rounded-xl p-6 md:p-7 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
                  {s.icon}
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {s.stat}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
