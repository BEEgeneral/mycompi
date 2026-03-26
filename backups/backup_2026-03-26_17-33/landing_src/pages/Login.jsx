import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }
      localStorage.setItem('mycompi_token', data.token)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))
      window.dispatchEvent(new Event('mycompi_auth_change'))
      // Redirect based on role — admin va a URL absoluta (no HashRouter)
      if (data.usuario.rol_platform === 'ADMIN') {
        window.location.href = '/admin'
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-[100px] pb-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-brand-text mb-2">Bienvenido de nuevo</h1>
            <p className="text-sm text-brand-secondary">Inicia sesión para acceder a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="tu@empresa.com"
                required
                className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-secondary mb-1.5">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-yellow text-brand-text font-bold py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-secondary mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-bold text-brand-text hover:underline">
              Regístrate gratis
            </Link>
          </p>
          <p className="text-center text-sm text-brand-secondary mt-3">
            <Link to="/recuperar" className="text-brand-secondary hover:text-brand-text transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
