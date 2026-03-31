import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const planes = [
  { id: 'BASICO', name: 'Profesional Agéntico', price: 49, desc: '1 Compi especializado' },
  { id: 'EQUIPO', name: 'Equipo Agéntico', price: 49, desc: '1 manager + 5 especializados', popular: true },
  { id: 'DIRECCION', name: 'Equipos con Dirección', price: 49, desc: '1 Director + 5 Managers + 25 Compis' },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    nombreEmpresa: '',
    plan: 'EQUIPO',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        return
      }
      localStorage.setItem('mycompi_token', data.tokens.accessToken)
      localStorage.setItem('mycompi_refresh_token', data.tokens.refreshToken)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))

      // Redirigir a Stripe Checkout
      try {
        const checkoutRes = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: form.plan }),
        })
        const checkoutData = await checkoutRes.json()
        if (checkoutData.url) {
          window.location.href = checkoutData.url
          return
        }
      } catch (e) {
        console.error('Checkout error:', e)
      }
      // Si falla checkout, ir al dashboard igualmente
      navigate('/dashboard')
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
        <div className="w-full max-w-[520px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-brand-text mb-2">Crea tu cuenta</h1>
            <p className="text-sm text-brand-secondary">Empieza gratis y escala cuando quieras</p>
          </div>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Tu nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => update('nombre', e.target.value)}
                  placeholder="Juan García"
                  required
                  className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="juan@tuempresa.com"
                  required
                  className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Nombre de tu empresa</label>
                <input
                  type="text"
                  value={form.nombreEmpresa}
                  onChange={e => update('nombreEmpresa', e.target.value)}
                  placeholder="Tu Empresa SL"
                  required
                  className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-yellow text-brand-text font-bold py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all"
              >
                Continuar →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-1.5">Empresa</label>
                <div className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text bg-gray-50">
                  {form.nombreEmpresa} ({form.email})
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-brand-secondary hover:underline mt-1">
                  ← Editar datos
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-brand-secondary mb-3">Elige tu plan</label>
                <div className="space-y-2">
                  {planes.map(p => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.plan === p.id
                          ? 'border-brand-yellow bg-brand-yellow/5'
                          : 'border-brand-border hover:border-brand-text'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={p.id}
                          checked={form.plan === p.id}
                          onChange={() => update('plan', p.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.plan === p.id ? 'border-brand-yellow' : 'border-brand-border'
                        }`}>
                          {form.plan === p.id && <div className="w-3 h-3 rounded-full bg-brand-yellow" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-text">{p.name}</div>
                          <div className="text-xs text-brand-secondary">{p.desc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-brand-text">€{p.price}/mes</div>
                        {p.popular && <span className="text-[10px] text-brand-text font-bold">Popular</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-yellow text-brand-text font-bold py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>

              <p className="text-center text-xs text-brand-muted">
                Al registrarte aceptas nuestros términos. Cancela cuando quieras.
              </p>
            </form>
          )}

          <p className="text-center text-sm text-brand-secondary mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-bold text-brand-text hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
