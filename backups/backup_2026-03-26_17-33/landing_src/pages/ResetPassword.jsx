import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al reiniciar contraseña')
        return
      }
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <main className="pt-[100px] pb-20 px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-brand-text mb-2">Enlace inválido</h1>
            <p className="text-sm text-brand-secondary mb-4">Este enlace ya expiró o no es válido.</p>
            <Link to="/recuperar" className="text-sm font-bold text-brand-text hover:underline">Solicitar nuevo enlace</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="pt-[100px] pb-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          {done ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <h1 className="text-2xl font-extrabold text-brand-text">Contraseña actualizada</h1>
              <p className="text-sm text-brand-secondary">Ya puedes iniciar sesión con tu nueva contraseña.</p>
              <Link to="/login" className="block text-sm font-bold text-brand-text hover:underline mt-4">Ir al login →</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-brand-text mb-2">Nueva contraseña</h1>
                <p className="text-sm text-brand-secondary">Elige una contraseña segura</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1.5">Nueva contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-secondary mb-1.5">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                    className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-yellow text-brand-text font-bold py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
