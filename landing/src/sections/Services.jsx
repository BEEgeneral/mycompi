const servicios = [
  { icon: '🎯', title: 'Especialización total', desc: 'Cada agente domina su área: Marketing, Ventas, Atención al Cliente, Operaciones y Data. Resultados medibles desde el día uno.' },
  { icon: '🤝', title: 'Trabajo en equipo', desc: 'Los agentes colaboran entre sí, comparten información y coordinan tareas complejas para conseguir tus objetivos.' },
  { icon: '🚀', title: 'Sin despidos', desc: 'Tus empleados se liberan de tareas repetitivas para enfocarse en lo estratégico. Tecnología que potencia, no reemplaza.' },
  { icon: '⚡', title: 'Activo 24/7', desc: 'Tus agentes trabajan sin descanso, respondiendo clientes, generando reportes y procesando datos a cualquier hora.' },
  { icon: '🔗', title: 'Integración total', desc: 'Conectamos los agentes con tus herramientas, APIs y fuentes de datos para una operación fluida y sin fricciones.' },
  { icon: '🌍', title: 'Escala global', desc: 'Infraestructura de alta disponibilidad que crece contigo. De startup a empresa internacional, sin cambios de herramienta.' },
]

export default function Services() {
  return (
    <section id="servicios" className="bg-brand-bg py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-yellow mb-2 md:mb-3">Nuestra Especialidad</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text mb-2 md:mb-3">Ahorra 80% en costes operativos</h2>
          <p className="text-sm text-brand-secondary max-w-[560px] mx-auto px-4">El mejor equipo de agentes IA para tu negocio, sin los costes de contratar 5 personas.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {servicios.map(s => (
            <div key={s.title} className="bg-brand-bg-section border border-brand-border rounded-xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 md:w-[52px] md:h-[52px] bg-brand-yellow rounded-xl flex items-center justify-center text-xl md:text-2xl mb-4 md:mb-5">{s.icon}</div>
              <h3 className="text-base md:text-lg font-bold text-brand-text mb-2">{s.title}</h3>
              <p className="text-[13px] md:text-sm text-brand-secondary leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
