export default function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-border py-12 md:py-[60px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div>
            <a href="/" className="inline-block mb-4">
              <img loading="lazy" decoding="async" src="/assets/logo.png" alt="MyCompi" className="h-[30px] md:h-[34px]" />
            </a>
            <p className="text-sm text-brand-muted leading-relaxed">
              Mi futuro es Hoy.<br />Equipos de agentes IA para PYMES.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] md:text-xs font-bold text-brand-text uppercase tracking-wider mb-3 md:mb-4">Producto</h4>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <a href="#servicios" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Servicios</a>
              <a href="#equipo" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Equipo</a>
              <a href="#precios" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Precios</a>
              <a href="#faq" className="text-sm text-brand-muted hover:text-brand-text transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] md:text-xs font-bold text-brand-text uppercase tracking-wider mb-3 md:mb-4">Empresa</h4>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Sobre nosotros</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Blog</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Prensa</a>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] md:text-xs font-bold text-brand-text uppercase tracking-wider mb-3 md:mb-4">Legal</h4>
            <div className="flex flex-col gap-2 md:gap-2.5">
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Privacidad</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Términos</a>
            </div>
          </div>
        </div>
        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-brand-border text-center">
          <p className="text-[12px] md:text-[13px] text-brand-muted">© 2026 MyCompi — Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}
