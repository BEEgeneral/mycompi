export default function Hero() {
  return (
    <section className="bg-brand-bg pt-[130px] pb-20">
      <div className="max-w-[1200px] mx-auto px-10 grid grid-cols-2 gap-[60px] items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Profesionales Agénticos Especializados para PYMES</p>
          <h1 className="text-[clamp(40px,5vw,64px)] font-extrabold leading-tight tracking-tight text-brand-text mb-5">
            Tu compañero digital para tu <span className="text-brand-yellow">día a día</span>
          </h1>
          <p className="text-[17px] text-brand-secondary leading-relaxed mb-9">
            Profesionales Agénticos Especializados que trabajan para tu negocio. Desde €10/mes. Reduce costes hasta un 80%.
          </p>
          <div className="flex gap-4 items-center flex-wrap">
            <a href="#contacto" className="bg-brand-yellow text-brand-text font-bold text-[15px] px-8 py-3.5 rounded-xl hover:bg-brand-yellow-dark hover:-translate-y-0.5 hover:shadow-md transition-all inline-block">
              Empezar ahora
            </a>
            <a href="#servicios" className="border border-brand-border text-brand-secondary font-semibold text-[15px] px-8 py-3.5 rounded-xl hover:border-brand-text hover:text-brand-text transition-all inline-block">
              Saber más
            </a>
          </div>
        </div>
        <div>
          <img src="/assets/dashboard.jpg" alt="MyCompi Dashboard" className="rounded-2xl shadow-lg w-full block" />
        </div>
      </div>
    </section>
  )
}
