import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function Activar() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      setDone(true)
    } catch { setError('No se pudo conectar') }
    finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">¡Cuenta activada!</h1>
          <p className="text-gray-500 mb-8">Ya puedes iniciar sesión con tu email y contraseña.</p>
          <a href="/#/login" className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img loading="lazy" decoding="async" src="/assets/logo.png" alt="MyCompi" className="h-12 mx-auto mb-5" />
          <h1 className="text-2xl font-extrabold text-gray-900">Activa tu cuenta</h1>
          <p className="text-sm text-gray-500 mt-2">Crea tu contraseña para acceder a MyCompi</p>
        </div>

        <form onSubmit={handle} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Email</label>
            <input type="email" value={email} readOnly
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Confirmar contraseña</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8}
              placeholder="Repite la contraseña"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm">
            {loading ? 'Activando...' : 'Activar cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
