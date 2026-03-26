const planes = [
  {
    id: 'BASICO',
    name: 'Tu Primer Profesional',
    desc: 'Para empezar a automatizar con un profesional especializado',
    price: '10',
    popular: false,
    features: [
      '1 Profesional especializado',
      'Automatización de tareas esenciales',
      'Reportes mensuales',
      '3 meses de soporte incluido',
      'Coordinación con tu equipo',
    ],
  },
  {
    id: 'EQUIPO',
    name: 'Tu Equipo Completo',
    desc: 'Un manager + 5 profesionales especializados',
    price: '49',
    popular: true,
    features: [
      '1 Manager que coordina tu equipo',
      '5 Profesionales especializados',
      'Reportes semanales y análisis',
      '6 meses de soporte incluido',
      'Estrategia y planificación mensual',
    ],
  },
  {
    id: 'DIRECCION',
    name: 'Con Equipo de Dirección',
    desc: 'Director + managers + todo el equipo',
    price: '147',
    popular: false,
    features: [
      '1 Director + 5 Managers',
      '25+ Profesionales especializados',
      'Reportes avanzados y consultoría',
      '12 meses de soporte incluido',
      'Automatización total del negocio',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="precios" className="bg-brand-pastel/30 py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-yellow mb-2 md:mb-3">Planes</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark mb-2 md:mb-3">Elige tu plan</h2>
          <p className="text-sm text-brand-secondary max-w-[560px] mx-auto px-4">Sin costes de contratación. Sin compromisos a largo plazo. Cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {planes.map(p => (
            <div
              key={p.id}
              className={`rounded-[2.5rem] p-6 md:p-9 transition-all duration-300 ${
                p.popular
                  ? 'bg-brand-dark text-white shadow-2xl shadow-brand-dark/30 scale-[1.02]'
                  : 'bg-white border-2 border-brand-pastel'
              }`}
            >
              {p.popular && (
                <span className="inline-block bg-brand-yellow text-brand-dark text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-pill mb-4">Popular</span>
              )}

              <div className={`text-lg md:text-xl font-bold mb-1 md:mb-2 ${p.popular ? 'text-white' : 'text-brand-dark'}`}>{p.name}</div>
              <div className={`text-[12px] md:text-sm mb-4 md:mb-5 min-h-[36px] ${p.popular ? 'text-white/70' : 'text-brand-secondary'}`}>{p.desc}</div>

              <div className={`text-[32px] md:text-[44px] font-extrabold tracking-tight leading-none ${p.popular ? 'text-brand-yellow' : 'text-brand-dark'}`}>
                <sup className={`text-[16px] md:text-[22px] align-top ${p.popular ? 'text-brand-yellow' : 'text-brand-secondary'}`}>€</sup>{p.price}
              </div>
              <div className={`text-[12px] md:text-sm mt-1 mb-5 md:mb-6 ${p.popular ? 'text-white/50' : 'text-brand-muted'}`}>por mes</div>

              <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                {p.features.map(f => (
                  <li key={f} className={`text-[12px] md:text-sm pl-6 relative ${p.popular ? 'text-white/80' : 'text-brand-secondary'}`}>
                    <span className={`absolute left-0 ${p.popular ? 'text-brand-yellow' : 'text-brand-yellow'} font-bold`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={`/#/checkout?plan=${p.id}`}
                className={`block text-center font-bold text-[13px] md:text-sm px-4 py-3 rounded-pill transition-all ${
                  p.popular
                    ? 'bg-brand-yellow text-brand-dark hover:bg-brand-dark-yellow shadow-md'
                    : 'bg-brand-pastel text-brand-dark hover:bg-brand-yellow transition-colors'
                }`}
              >
                Contratar ahora →
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-brand-muted mt-8">Pago seguro con Stripe · Cancela cuando quieras · Sin sorpresas</p>
      </div>
    </section>
  )
}
