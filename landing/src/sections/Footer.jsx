export default function Footer() {
  return (
    <footer className="bg-brand-bg border-t border-brand-border py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10">
        <div className="grid grid-cols-4 gap-10">
          <div>
            <a href="/">
              <img src="/assets/logo.png" alt="MyCompi" className="h-[34px] mb-4 block" />
            </a>
            <p className="text-sm text-brand-muted leading-relaxed">
              Mi futuro es Hoy.<br />Equipos de agentes IA para PYMES.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">Producto</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#servicios" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Servicios</a>
              <a href="#equipo" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Equipo</a>
              <a href="#precios" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Precios</a>
              <a href="#faq" className="text-sm text-brand-muted hover:text-brand-text transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">Empresa</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Sobre nosotros</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Blog</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Prensa</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Privacidad</a>
              <a href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">Términos</a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-brand-border text-center">
          <p className="text-[13px] text-brand-muted">© 2026 MyCompi — Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}
