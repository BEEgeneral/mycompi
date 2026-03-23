import { useState } from 'react'
import { Link } from 'react-router-dom'

const links = [
  { href: '/#servicios', label: 'Servicios', external: false },
  { href: '/#equipo', label: 'Equipo', external: false },
  { href: '/#precios', label: 'Precios', external: false },
  { href: '/#faq', label: 'FAQ', external: false },
  { href: '/contratacion', label: 'Contratar', external: false },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="h-[68px] max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link to="/">
          <img src="/assets/logo.png" alt="MyCompi" className="h-[34px]" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.href} to={l.href} className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">
              {l.label}
            </Link>
          ))}
          <a href="/#contacto" className="bg-brand-yellow text-brand-text text-sm font-bold px-5 py-2 rounded-xl hover:bg-brand-yellow-dark transition-all">
            Hablamos?
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-brand-text transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-brand-border px-6 py-4 flex flex-col gap-3">
          {links.map(l => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-text py-2"
            >
              {l.label}
            </Link>
          ))}
          <a href="/#contacto" onClick={() => setOpen(false)} className="bg-brand-yellow text-brand-text text-sm font-bold px-5 py-3 rounded-xl text-center mt-2">
            Hablamos?
          </a>
        </div>
      )}
    </nav>
  )
}
