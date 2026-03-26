import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ——— Scroll in-page a un anchor ———
function scrollToAnchor(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ——— Rutas ———
const LANDING_LINKS = [
  { href: 'servicios', label: 'Servicios' },
  { href: 'equipo', label: 'Equipo' },
  { href: 'precios', label: 'Precios' },
  { href: 'faq', label: 'FAQ' },
]

const LOGGED_OUT_LINKS = [
  { href: '/#/login', label: 'Login' },
  { href: '/#/registro', label: 'Registro' },
]

const LOGGED_IN_LINKS = [
  { href: '/#/dashboard', label: 'Mi equipo' },
]

const ADMIN_LINKS = [
  { href: '/admin', label: 'Admin', external: true },
]

// ——— Helper: obtener usuario desde localStorage ———
function getUser() {
  try {
    const saved = localStorage.getItem('mycompi_usuario')
    const token = localStorage.getItem('mycompi_token')
    if (!token || !saved) return null
    return JSON.parse(saved)
  } catch {
    return null
  }
}

// ——— Logo ———
function Logo() {
  return (
    <Link to="/">
      <img
        loading="lazy"
        decoding="async"
        src="/assets/logo.png"
        alt="MyCompi"
        className="h-[34px]"
      />
    </Link>
  )
}

// ——— Desktop nav ———
function DesktopNav({ user, onLogout }) {
  const isAdmin = user?.rol_platform === 'ADMIN'

  if (user) {
    return (
      <div className="hidden md:flex items-center gap-6">
        {LOGGED_IN_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            className="text-sm font-semibold text-brand-dark hover:text-brand-yellow transition-colors"
          >
            {l.label}
          </a>
        ))}
        {isAdmin && ADMIN_LINKS.map(l => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-brand-yellow hover:text-brand-dark-yellow transition-colors"
          >
            {l.label}
          </a>
        ))}
        <div className="flex items-center gap-3 pl-2">
          <span className="text-sm text-brand-secondary">{user.nombre}</span>
          <button
            onClick={onLogout}
            className="text-sm text-brand-muted hover:text-red-500 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center gap-6">
      {LANDING_LINKS.map(l => (
        <button
          key={l.href}
          onClick={() => scrollToAnchor(l.href)}
          className="text-sm font-semibold text-brand-dark hover:text-brand-yellow transition-colors cursor-pointer"
        >
          {l.label}
        </button>
      ))}
      <div className="w-px h-5 bg-brand-pastel" />
      {LOGGED_OUT_LINKS.map(l => (
        <a
          key={l.href}
          href={l.href}
          className="text-sm font-semibold text-brand-dark hover:text-brand-yellow transition-colors"
        >
          {l.label}
        </a>
      ))}
      <a
        href="/#/checkout"
        className="bg-brand-dark text-white text-sm font-semibold px-6 py-2.5 rounded-pill hover:bg-brand-dark/90 transition-colors flex items-center gap-2"
      >
        Contratar
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  )
}

// ——— Mobile hamburger ———
function Hamburger({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Menú"
    >
      <span className={`block w-6 h-0.5 bg-brand-dark transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`block w-6 h-0.5 bg-brand-dark transition-all ${open ? 'opacity-0' : ''}`} />
      <span className={`block w-6 h-0.5 bg-brand-dark transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
  )
}

// ——— Mobile menu ———
function MobileMenu({ user, onLogout, onClose }) {
  const isAdmin = user?.rol_platform === 'ADMIN'

  const linkGroups = user
    ? [
        ...(isAdmin ? [{ label: 'Administración', links: ADMIN_LINKS }] : []),
        { label: 'Tu cuenta', links: LOGGED_IN_LINKS },
      ]
    : [
        { label: 'Web', links: LANDING_LINKS },
        { label: 'Acceder', links: LOGGED_OUT_LINKS },
      ]

  return (
    <div className="md:hidden bg-brand-cream border-t border-brand-pastel px-6 py-4 flex flex-col gap-5">
      {linkGroups.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">
            {group.label}
          </div>
          <div className="flex flex-col gap-1">
            {group.links.map(l => {
              if (['servicios', 'equipo', 'precios', 'faq'].includes(l.href)) {
                return (
                  <button
                    key={l.href}
                    onClick={() => { scrollToAnchor(l.href); onClose() }}
                    className="text-sm font-semibold text-brand-dark hover:text-brand-yellow py-1.5 text-left"
                  >
                    {l.label}
                  </button>
                )
              }
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="text-sm font-semibold text-brand-dark hover:text-brand-yellow py-1.5"
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {l.label}
                </a>
              )
            })}
          </div>
        </div>
      ))}

      {!user && (
        <a
          href="/#/checkout"
          onClick={onClose}
          className="bg-brand-dark text-white text-sm font-semibold px-6 py-3 rounded-pill text-center mt-2"
        >
          Contratar →
        </a>
      )}

      {user && (
        <button
          onClick={() => { onLogout(); onClose() }}
          className="text-sm text-red-400 hover:text-red-600 py-1.5 text-left mt-2 border-t border-brand-pastel pt-4"
        >
          Cerrar sesión
        </button>
      )}
    </div>
  )
}

// ——— Navbar principal ———
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener('mycompi_auth_change', sync)
    const interval = setInterval(sync, 1000)
    return () => {
      window.removeEventListener('mycompi_auth_change', sync)
      clearInterval(interval)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    window.dispatchEvent(new Event('mycompi_auth_change'))
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-pastel">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="h-[68px] flex items-center justify-between">
          <Logo />
          <DesktopNav user={user} onLogout={logout} />
          <Hamburger open={open} onClick={() => setOpen(o => !o)} />
        </div>
      </div>

      {open && (
        <MobileMenu user={user} onLogout={logout} onClose={() => setOpen(false)} />
      )}
    </nav>
  )
}
