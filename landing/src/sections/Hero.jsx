export default function Hero() {
  return (
    <section className="bg-brand-cream pt-[100px] md:pt-[130px] pb-16 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="max-w-[720px] mx-auto text-center mb-10 md:mb-14">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-pastel border border-brand-dark/10 text-brand-dark text-[11px] font-bold px-4 py-1.5 rounded-pill mb-6">
            <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse" />
            Ya disponible · Sin compromiso · Empieza hoy
          </div>

          {/* Headline */}
          <h1 className="text-[28px] md:text-[clamp(34px,5vw,56px)] font-extrabold leading-[1.1] tracking-tight text-brand-dark mb-5">
            Deja de hacer horas extra.
            <br />
            <span className="relative">
              <span className="relative z-10">Tu equipo de profesionales</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-brand-yellow/60 -z-0 rounded-sm" style={{ height: '0.6em', bottom: '0.1em' }} />
            </span>{' '}
            trabaja 24/7.
          </h1>

          {/* Subheadline */}
          <p className="text-[15px] md:text-[18px] text-brand-secondary leading-relaxed mb-8 max-w-[560px] mx-auto">
            Profesionales especializados que conocen tu negocio. Responden clientes, cierran ventas, crean contenido.{' '}
            <strong className="text-brand-dark font-semibold">Desde 10€/mes.</strong>
          </p>

          {/* CTA buttons — pill-shaped */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <a
              href="/#/checkout"
              className="bg-brand-dark hover:bg-brand-dark/90 text-white font-semibold text-sm md:text-[15px] px-8 py-3.5 rounded-pill transition-all shadow-lg shadow-brand-dark/20 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Contratar mi equipo
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/#/equipo"
              className="text-brand-dark hover:text-brand-dark/70 font-semibold text-sm md:text-[15px] px-6 py-3.5 rounded-pill hover:bg-brand-pastel transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Conoce a tu equipo
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Trust signals */}
          <p className="text-xs text-brand-muted">
            Sin contratos · Sin permanencia · Cancela cuando quieras
          </p>
        </div>

        {/* Dashboard screenshot — container muy redondeado */}
        <div className="relative max-w-[900px] mx-auto rounded-[3rem] overflow-hidden shadow-2xl border border-brand-pastel">
          <img
            loading="lazy"
            decoding="async"
            src="/assets/dashboard.jpg"
            alt="Panel de MyCompi — tu equipo en acción"
            className="rounded-[3rem] w-full block"
          />
          {/* Floating proof */}
          <div className="absolute bottom-4 left-4 bg-white border border-brand-pastel rounded-2xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'https://randomuser.me/api/portraits/women/44.jpg',
                  'https://randomuser.me/api/portraits/men/54.jpg',
                  'https://randomuser.me/api/portraits/men/75.jpg',
                ].map((src, i) => (
                  <img key={i} src={src} className="w-7 h-7 rounded-full object-cover border-2 border-white" alt="" />
                ))}
              </div>
              <div className="text-xs">
                <div className="font-bold text-brand-dark">+150 empresas activas</div>
                <div className="text-brand-muted">automatizando con MyCompi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
