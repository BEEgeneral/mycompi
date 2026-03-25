const testimonios = [
  {
    quote: 'Laura respondía a nuestros clientes a las 2am cuando dormíamos. Nunca HubSpot hizo eso por nosotros.',
    name: 'David Ruiz',
    role: 'CEO, TiendaFarma',
    result: '−60% tickets de soporte',
    initials: 'DR',
    color: 'from-pink-500 to-rose-600',
  },
  {
    quote: 'Carlos recuperó 3 ventas que habían caído en el olvido. Ningún CRM lo habría hecho tan automáticamente.',
    name: 'María Vega',
    role: 'Comercial, Asesoría Contable',
    result: '+€8.400 ventas/mes',
    initials: 'MV',
    color: 'from-green-500 to-emerald-600',
  },
  {
    quote: 'Elena automatizó el envío de reportes semanales. Antes lo hacíamos entre 2 personas en 4 horas. Ahora, 0.',
    name: 'Jordi Serra',
    role: 'COO, LogiFast',
    result: '4h → 0h/semana',
    initials: 'JS',
    color: 'from-orange-500 to-amber-600',
  },
  {
    quote: 'Enzo encontró que nuestros posts del martes convertían 3x más. Cambió la estrategia en una semana.',
    name: 'Lucía Torres',
    role: 'CMO, ModaPaTi',
    result: '3x CTR en contenido',
    initials: 'LT',
    color: 'from-blue-500 to-indigo-600',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-gray-50 border-t border-gray-200 py-16 md:py-[80px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Casos reales</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-gray-900">
            Resultados que puedes verificar
          </h2>
          <p className="text-sm text-gray-500 mt-2">Con nombres, empresas y cifras concretas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {testimonios.map(t => (
            <div
              key={t.initials}
              className="bg-white border border-gray-200 rounded-2xl p-6 md:p-7 hover:shadow-lg transition-all"
            >
              {/* Result badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1 rounded-full mb-4">
                <span>📈</span> {t.result}
              </div>

              {/* Quote */}
              <blockquote className="text-[14px] md:text-[15px] text-gray-700 leading-relaxed mb-5 font-medium">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
