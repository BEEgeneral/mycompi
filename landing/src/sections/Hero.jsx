export default function Hero() {
  return (
    <section className="bg-brand-bg pt-[100px] md:pt-[130px] pb-16 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center">
        <div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-muted mb-3 md:mb-4">Profesionales Agénticos Especializados para PYMES</p>
          <h1 className="text-[32px] md:text-[clamp(40px,5vw,64px)] font-extrabold leading-tight tracking-tight text-brand-text mb-4 md:mb-5">
            Tu compañero digital para tu <span className="text-brand-yellow">día a día</span>
          </h1>
          <p className="text-sm md:text-[17px] text-brand-secondary leading-relaxed mb-6 md:mb-9">
            Profesionales Agénticos Especializados que trabajan para tu negocio. Desde €10/mes. Reduce costes hasta un 80%.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start md:items-center">
            <a href="#contacto" className="bg-brand-yellow text-brand-text font-bold text-sm md:text-[15px] px-6 md:px-8 py-3 md:py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all inline-block text-center w-full sm:w-auto">
              Empezar ahora
            </a>
            <a href="#servicios" className="border border-brand-border text-brand-secondary font-semibold text-sm md:text-[15px] px-6 md:px-8 py-3 md:py-3.5 rounded-xl hover:border-brand-text hover:text-brand-text transition-all inline-block text-center w-full sm:w-auto">
              Saber más
            </a>
          </div>
        </div>
        <div>
          <img loading="lazy" decoding="async" src="/assets/dashboard.jpg" alt="MyCompi Dashboard" className="rounded-2xl shadow-lg w-full block" />
        </div>
      </div>
    </section>
  )
}
