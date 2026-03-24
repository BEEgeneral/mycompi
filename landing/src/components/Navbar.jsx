import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const links = [
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#equipo', label: 'Equipo' },
  { href: '/#precios', label: 'Precios' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contratacion', label: 'Contratar' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('mycompi_token')
    const savedUser = localStorage.getItem('mycompi_usuario')
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setLoggedIn(true)
        setUserName(user.nombre || '')
        setIsAdmin(user.rol_platform === 'ADMIN')
      } catch {
        setLoggedIn(false)
      }
    }
  }, [])

  // Listen for storage changes (from other tabs / Login success)
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem('mycompi_token')
      const savedUser = localStorage.getItem('mycompi_usuario')
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser)
          setLoggedIn(true)
          setUserName(user.nombre || '')
          setIsAdmin(user.rol_platform === 'ADMIN')
        } catch {
          setLoggedIn(false)
        }
      } else {
        setLoggedIn(false)
        setIsAdmin(false)
        setUserName('')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    setLoggedIn(false)
    setIsAdmin(false)
    setUserName('')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="h-[68px] max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <Link to="/">
          <img src="/assets/logo.png" alt="MyCompi" className="h-[34px]" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">
              {l.label}
            </a>
          ))}

          {loggedIn ? (
            <>
              {isAdmin && (
                <a href="/admin" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">
                  Admin
                </a>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm text-brand-secondary">Hola, {userName}</span>
                <button
                  onClick={logout}
                  className="text-sm text-brand-secondary hover:text-brand-text transition-colors"
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-brand-secondary hover:text-brand-text transition-colors">
                Login
              </Link>
              <a href="/#contacto" className="bg-brand-yellow text-brand-text text-sm font-bold px-5 py-2 rounded-xl hover:bg-brand-yellow-dark transition-all">
                Hablamos?
              </a>
            </>
          )}
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
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-brand-secondary hover:text-brand-text py-2"
            >
              {l.label}
            </a>
          ))}
          {loggedIn ? (
            <>
              {isAdmin && (
                <a href="/admin" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-secondary hover:text-brand-text py-2">
                  Admin
                </a>
              )}
              <button onClick={logout} className="text-sm text-brand-secondary hover:text-brand-text py-2 text-left">
                Salir ({userName})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-secondary hover:text-brand-text py-2">
                Login
              </Link>
              <a href="/#contacto" onClick={() => setOpen(false)} className="bg-brand-yellow text-brand-text text-sm font-bold px-5 py-3 rounded-xl text-center mt-2">
                Hablamos?
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
