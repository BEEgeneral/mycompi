import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Recuperar() {
  const [step, setStep] = useState('email') // 'email' | 'sent' | 'error'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al procesar')
        return
      }
      setStep('sent')
    } catch {
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
            <h1 className="text-2xl font-extrabold text-brand-text mb-2">Recuperar contraseña</h1>
            <p className="text-sm text-brand-secondary">
              {step === 'sent'
                ? 'Revisa tu email para reiniciar tu contraseña'
                : 'Te enviaremos un enlace para reiniciar tu contraseña'}
            </p>
          </div>

          {step === 'sent' ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-sm text-brand-secondary">
                Hemos enviado un email a <strong>{email}</strong> con un enlace para reiniciar tu contraseña.
              </p>
              <p className="text-xs text-brand-muted">
                ¿No lo ves? Revisa la carpeta de spam o espera unos minutos.
              </p>
              <Link to="/login" className="block text-sm font-bold text-brand-text hover:underline mt-4">
                ← Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Tu email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  required
                  className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-yellow text-brand-text font-bold py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-brand-secondary mt-6">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="font-bold text-brand-text hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
