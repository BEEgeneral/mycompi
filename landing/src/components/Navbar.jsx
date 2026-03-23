export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white/95 backdrop-blur-md border-b border-brand-border flex items-center">
      <div className="max-w-[1200px] mx-auto px-10 w-full flex items-center justify-between">
        <a href="/">
          <img src="/assets/logo.png" alt="MyCompi" className="h-[34px]" />
        </a>
        <div className="flex items-center gap-8">
          <a href="#servicios" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">Servicios</a>
          <a href="#equipo" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">Equipo</a>
          <a href="#precios" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">Precios</a>
          <a href="#faq" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">FAQ</a>
        </div>
        <a href="#contacto" className="bg-brand-yellow text-brand-text text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-brand-yellow-dark transition-all">
          Hablamos?
        </a>
      </div>
    </nav>
  )
}
