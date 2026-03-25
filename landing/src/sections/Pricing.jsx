const planes = [
  {
    name: 'Profesional Agéntico',
    desc: 'Para empezar a automatizar con un agente especializado',
    price: '10',
    popular: false,
    features: [
      '1 Profesional Agéntico especializado',
      'Automatización de tareas esenciales',
      'Soporte por email',
      '3 meses de soporte incluido',
      'Reportes mensuales básicos',
    ],
  },
  {
    name: 'Equipo Agéntico',
    desc: 'Un equipo completo con manager y 5 subagentes',
    price: '49',
    popular: true,
    features: [
      '1 Manager Agéntico',
      '5 Profesionales Agénticos especializados',
      'Coordinación y supervisión incluido',
      'Soporte prioritario',
      '6 meses de soporte incluido',
      'Reportes semanales y análisis',
    ],
  },
  {
    name: 'Equipos con Dirección',
    desc: 'Varios equipos agénticos con equipo de dirección',
    price: '147',
    popular: false,
    features: [
      '1 Director + 5 Managers + 25 agentes',
      'Equipo de dirección incluido',
      'Automatización total del negocio',
      'Soporte dedicado 24/7',
      '12 meses de soporte incluido',
      'Reportes avanzados y consultoría',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="precios" className="bg-brand-bg py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-yellow mb-2 md:mb-3">Planes</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text mb-2 md:mb-3">Elige tu plan</h2>
          <p className="text-sm text-brand-secondary max-w-[560px] mx-auto px-4">Sin costes de contratación. Sin compromisos a largo plazo. Cancela cuando quieras.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
          {planes.map(p => (
            <div
              key={p.name}
              className={`rounded-xl p-6 md:p-9 transition-all duration-300 ${
                p.popular
                  ? 'bg-brand-bg border-2 border-brand-yellow shadow-lg'
                  : 'bg-brand-bg border border-brand-border'
              }`}
            >
              {p.popular && (
                <span className="inline-block bg-brand-yellow text-brand-text text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 md:mb-4">Popular</span>
              )}
              <div className="text-lg md:text-xl font-bold text-brand-text mb-1 md:mb-2">{p.name}</div>
              <div className="text-[12px] md:text-sm text-brand-secondary mb-4 md:mb-5 min-h-[36px]">{p.desc}</div>
              <div className="text-[32px] md:text-[44px] font-extrabold tracking-tight text-brand-text leading-none">
                <sup className="text-[16px] md:text-[22px] align-top">€</sup>{p.price}
              </div>
              <div className="text-[12px] md:text-sm text-brand-muted mt-1 mb-5 md:mb-6">por mes</div>
              <ul className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                {p.features.map(f => (
                  <li key={f} className="text-[12px] md:text-sm text-brand-secondary pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-brand-text before:font-bold before:text-[13px]">
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={`block text-center font-bold text-[13px] md:text-sm px-4 py-3 rounded-xl transition-all ${
                  p.popular
                    ? 'bg-brand-yellow text-brand-text hover:bg-brand-yellow-dark'
                    : 'bg-brand-bg-section border border-brand-border text-brand-text hover:border-brand-text'
                }`}
              >
                Empezar ahora
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
