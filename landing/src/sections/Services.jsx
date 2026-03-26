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
    desc: 'Marcos crea y mantiene tu presencia online. Páginas, e-commerce, integraciones — sin llamadas.',
    stat: 'Desde 1 día',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-brand-cream py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">Lo que hacen por ti</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark mb-3">
            Cada profesional es un experto en su área
          </h2>
          <p className="text-sm text-brand-secondary max-w-[480px] mx-auto">
            No son herramientas. Son profesionales con nombre, memoria y objetivos. Encajan en tu equipo.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {servicios.map(s => (
            <div
              key={s.title}
              className="bg-white border border-brand-pastel rounded-[2rem] p-7 md:p-8 hover:shadow-xl hover:border-brand-yellow transition-all duration-300 group"
            >
              {/* Icono en cuadrado amarillo redondeado */}
              <div className="w-14 h-14 bg-brand-yellow rounded-[1rem] flex items-center justify-center text-2xl mb-5 shadow-md shadow-brand-yellow/20 group-hover:scale-105 transition-transform">
                {s.icon}
              </div>

              {/* Stat badge */}
              <span className="inline-block text-[11px] font-bold text-brand-dark bg-brand-pastel px-3 py-1 rounded-pill mb-4">
                {s.stat}
              </span>

              <h3 className="text-base md:text-lg font-bold text-brand-dark mb-2">{s.title}</h3>
              <p className="text-[13px] md:text-sm text-brand-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
