export default function Hero() {
  return (
    <section className="bg-white pt-[100px] md:pt-[130px] pb-16 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="max-w-[720px] mx-auto text-center mb-10 md:mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Ya disponible · Sin compromiso · Empieza hoy
          </div>

          {/* Headline */}
          <h1 className="text-[28px] md:text-[clamp(34px,5vw,56px)] font-display font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-5">
            Deja de hacer horas extra.
            <br />
            <span className="text-indigo-600">Tu equipo de agentes</span> trabaja 24/7.
          </h1>

          {/* Subheadline */}
          <p className="text-[15px] md:text-[18px] text-gray-500 leading-relaxed mb-8 max-w-[560px] mx-auto">
            Contrata profesionales IA especializados que trabajan para tu negocio. 
            Responden clientes, cierran ventas, crean contenido. <strong className="text-gray-700">Desde 10€/mes.</strong>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <a
              href="#precios"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm md:text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
            >
              Ver precios y contratar →
            </a>
            <a
              href="#equipo"
              className="text-gray-500 hover:text-gray-800 font-semibold text-sm md:text-[15px] px-6 py-3.5 rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto"
            >
              Conoce a tu equipo →
            </a>
          </div>

          {/* Trust signals */}
          <p className="text-xs text-gray-400">
            Sin contratos · Sin permanence · Cancela cuando quieras
          </p>
        </div>

        {/* Dashboard screenshot */}
        <div className="relative max-w-[900px] mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <img
            loading="lazy"
            decoding="async"
            src="/assets/dashboard.jpg"
            alt="Panel de MyCompi — tus agentes en acción"
            className="rounded-2xl shadow-2xl w-full block border border-gray-200"
          />
          {/* Floating proof */}
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg z-20">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['https://randomuser.me/api/portraits/women/44.jpg',
                  'https://randomuser.me/api/portraits/men/54.jpg',
                  'https://randomuser.me/api/portraits/men/75.jpg'].map((src, i) => (
                  <img key={i} src={src} className="w-7 h-7 rounded-full object-cover border-2 border-white" alt="" />
                ))}
              </div>
              <div className="text-xs">
                <div className="font-bold text-gray-800">+150 empresas activas</div>
                <div className="text-gray-400">automatizando con MyCompi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
