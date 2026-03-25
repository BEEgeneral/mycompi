import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ——— Rutas ———
const LANDING_LINKS = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
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

  return (
    <div className="hidden md:flex items-center gap-6">
      {/* Links comunes */}
      {LANDING_LINKS.map(l => (
        <a
          key={l.href}
          href={l.href}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          {l.label}
        </a>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200" />

      {/* Si logueado */}
      {user ? (
        <>
          {LOGGED_IN_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
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
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {l.label}
            </a>
          ))}

          {/* Usuario + logout */}
          <div className="flex items-center gap-3 pl-2">
            <span className="text-sm text-gray-500">
              {user.nombre}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-400 hover:text-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </>
      ) : (
        <>
          {LOGGED_OUT_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#/checkout"
            className="bg-brand-yellow text-gray-900 text-sm font-bold px-5 py-2 rounded-xl hover:bg-yellow-400 transition-all"
          >
            Contratar →
          </a>
        </>
      )}
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
      <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${open ? 'opacity-0' : ''}`} />
      <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
  )
}

// ——— Mobile menu ———
function MobileMenu({ user, onLogout, onClose }) {
  const isAdmin = user?.rol_platform === 'ADMIN'

  const linkGroups = [
    { label: 'Web', links: LANDING_LINKS },
    ...(user ? [{ label: 'Tu cuenta', links: LOGGED_IN_LINKS }] : []),
    ...(user && isAdmin ? [{ label: 'Administración', links: ADMIN_LINKS }] : []),
    ...(user ? [] : [{ label: 'Acceder', links: LOGGED_OUT_LINKS }]),
  ]

  return (
    <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-5">
      {linkGroups.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            {group.label}
          </div>
          <div className="flex flex-col gap-1">
            {group.links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-1.5"
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      ))}

      {!user && (
        <a
          href="/#/checkout"
          onClick={onClose}
          className="bg-brand-yellow text-gray-900 text-sm font-bold px-5 py-3 rounded-xl text-center mt-2"
        >
          Contratar →
        </a>
      )}

      {user && (
        <button
          onClick={() => { onLogout(); onClose() }}
          className="text-sm text-red-500 hover:text-red-700 py-1.5 text-left mt-2 border-t border-gray-100 pt-4"
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

  // Leer usuario inicial
  useEffect(() => {
    setUser(getUser())
  }, [])

  // Sincronizar con cambios de localStorage (otros tabs, login success)
  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener('mycompi_auth_change', sync)
    // Polling para covering all cases (storage event only fires in other tabs)
    const interval = setInterval(sync, 1000)
    return () => {
      window.removeEventListener('mycompi_auth_change', sync)
      clearInterval(interval)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    // Notificar a otros components
    window.dispatchEvent(new Event('mycompi_auth_change'))
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="h-[68px] flex items-center justify-between">
          <Logo />
          <DesktopNav user={user} onLogout={logout} />
          <Hamburger open={open} onClick={() => setOpen(o => !o)} />
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <MobileMenu user={user} onLogout={logout} onClose={() => setOpen(false)} />
      )}
    </nav>
  )
}
