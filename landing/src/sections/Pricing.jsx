const planes = [
  {
    id: 'EQUIPO',
    name: 'Tu Equipo Completo',
    desc: 'Todo lo que necesitas para automatizar y hacer crecer tu negocio',
    price: '49',
    popular: true,
    features: [
      '🎯 7 profesionales IA especializados',
      '📊 Marketing, ventas, atención, operaciones, data y desarrollo',
      '🤖 Investigación automática de tu empresa',
      '📋 5 tareas de onboarding personalizadas',
      '⚡ 3 tareas proactivas diarias por cada profesional',
      '📈 Reporting y análisis continuo',
      '💬 Chat con Paco, tu orquestador 24/7',
      '🔄 Mejora y optimización diaria del negocio',
    ],
  },
]

export default function Pricing() {
  return (
    <section id="precios" className="bg-brand-pastel/30 py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-yellow mb-2 md:mb-3">Precio único</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark mb-2 md:mb-3">Todo incluido por €49/mes</h2>
          <p className="text-sm text-brand-secondary max-w-[560px] mx-auto px-4">Sin costes de contratación. Sin compromisos a largo plazo. Cancela cuando quieras.</p>
        </div>

        <div className="flex justify-center">
          <div className="rounded-[2.5rem] bg-brand-dark text-white shadow-2xl shadow-brand-dark/30 max-w-[520px] w-full p-8 md:p-12">
            <span className="inline-block bg-brand-yellow text-brand-dark text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-pill mb-4">El más completo</span>

            <div className="text-2xl md:text-3xl font-bold mb-1 text-white">Tu Equipo Completo</div>
            <div className="text-sm mb-6 text-white/70">Todo lo que necesitas para automatizar y hacer crecer tu negocio</div>

            <div className="text-[48px] md:text-[56px] font-extrabold tracking-tight leading-none text-brand-yellow mb-1">
              €49<span className="text-xl font-normal text-white/50">/mes</span>
            </div>

            <ul className="space-y-3 mb-8 mt-6">
              {planes[0].features.map(f => (
                <li key={f} className="text-sm text-white/80 flex items-start gap-3">
                  <span className="text-brand-yellow font-bold mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/#/checkout"
              className="block text-center font-bold text-sm bg-brand-yellow text-brand-dark px-6 py-4 rounded-pill hover:bg-white transition-colors shadow-md"
            >
              Contratar ahora →
            </a>

            <p className="text-center text-xs text-white/40 mt-4">Pago seguro con Stripe · Cancela cuando quieras · Sin sorpresas</p>
          </div>
        </div>
      </div>
    </section>
  )
}
