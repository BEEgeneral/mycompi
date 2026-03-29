import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

const PLANES = {
  EQUIPO: { name: 'Tu Equipo Completo', price: 49, agents: 7, desc: '7 profesionales IA trabajando 24/7', planId: 'profesional' },
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const [plan, setPlan] = useState(() => {
    const p = searchParams.get('plan')
    return PLANES[p] ? p : 'EQUIPO'
  })
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', nombreEmpresa: '', cupon: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedPlan = PLANES[plan]

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      localStorage.setItem('mycompi_token', data.tokens.accessToken)
      localStorage.setItem('mycompi_usuario', JSON.stringify(data.usuario))
      setStep(2)
    } catch {
      setError('No se pudo conectar')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      // Crear sesión de pago en Stripe
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.planId,
          email: form.email,
          nombre: form.nombre,
          empresa: form.nombreEmpresa,
          couponCode: form.cupon || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error creando checkout'); setLoading(false); return }

      // Redirixir a Stripe
      window.location.href = data.url
    } catch {
      setError('No se pudo iniciar el pago. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-6 pt-[88px] pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/contratacion" className="hover:text-gray-600">Contratar</Link>
          <span>/</span>
          <span className="text-gray-700">Checkout</span>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Contrata tu equipo agéntico</h1>
        <p className="text-sm text-gray-500 mb-6">Completa tu registro y pago para activar tu equipo.</p>

        {/* Plan único */}
        <div className="bg-brand-dark/5 border-2 border-brand-dark rounded-2xl px-6 py-4 mb-8 text-center">
          <div className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">Tu Equipo Completo</div>
          <div className="text-3xl font-extrabold text-brand-dark">€49<span className="text-sm font-normal text-gray-500">/mes</span></div>
          <div className="text-sm text-gray-600 mt-1">7 profesionales IA trabajando 24/7 para tu negocio</div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full bg-brand-dark transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} /></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {/* STEP 1: Registro + Pago */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">Tus datos</h2>
              <form id="checkout-form" onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre completo</label>
                  <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} required placeholder="Tu nombre"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="tu@empresa.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Contraseña</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="Mínimo 8 caracteres"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Empresa (opcional)</label>
                  <input type="text" value={form.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} placeholder="Nombre de tu empresa"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Código promocional <span className="font-normal text-gray-400">(opcional)</span></label>
                  <input type="text" value={form.cupon} onChange={e => update('cupon', e.target.value.toUpperCase())} placeholder="Ej: HORUS100"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-white font-extrabold py-4 rounded-xl hover:bg-brand-dark-hover transition-colors disabled:opacity-50 text-base tracking-wide cursor-pointer">
                  {loading ? 'Registrando...' : 'Registrarse →'}
                </button>
                <p className="text-center text-xs text-gray-400">Sin compromiso · Sin permanencia · Cancela cuando quieras</p>
              </form>
            </div>

            {/* Plan summary — 2 cols, sticky */}
            <div className="lg:col-span-2">
              <div className="bg-brand-dark rounded-2xl p-6 shadow-xl sticky top-24 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-brand-yellow flex items-center justify-center text-brand-dark font-extrabold text-2xl">
                    €{selectedPlan.price}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{selectedPlan.name}</div>
                    <div className="text-xs text-white/60">por mes · IVA incluido</div>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <span className="text-brand-yellow font-bold">✓</span>
                    {selectedPlan.agents} Compi{selectedPlan.agents !== 1 ? 's' : ''} especializado{selectedPlan.agents !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <span className="text-brand-yellow font-bold">✓</span>
                    Dashboard en tiempo real
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <span className="text-brand-yellow font-bold">✓</span>
                    Soporte incluido
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/90">
                    <span className="text-brand-yellow font-bold">✓</span>
                    Cancela cuando quieras
                  </li>
                </ul>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-center text-xs text-white/50 mb-1">Pago seguro</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-white/50">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#635BFF"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="#FFF"/></svg>
                    Procesado por Stripe
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pago */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">Tu pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{selectedPlan.name}</span>
                  <span className="font-bold text-gray-900">€{selectedPlan.price}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA</span>
                  <span className="text-gray-500">Incluido</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total mensual</span>
                  <span className="font-extrabold text-brand-dark text-lg">€{selectedPlan.price}</span>
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-brand-dark text-white font-extrabold py-4 rounded-xl hover:bg-brand-dark-hover transition-colors disabled:opacity-50 text-base flex items-center justify-center gap-2">
                {loading ? (
                  'Redirigiendo a Stripe...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#635BFF"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="#FFF"/></svg>
                    Pagar €{selectedPlan.price} con Stripe →
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="text-xs text-gray-400">🔒 Pago seguro</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">Stripe encriptado</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">Cancela cuando quieras</span>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">Al contratar aceptas nuestros términos y condiciones. Tu suscripción se renovará automáticamente cada mes. Puedes cancelar en cualquier momento desde tu cuenta.</p>
              </div>
            </div>

            <div className="bg-brand-bg rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Tu equipo agéntico incluye:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-brand-dark font-bold mt-0.5">+</span>
                  <div>
                    <span className="font-semibold">Acceso instantáneo</span>
                    <p className="text-gray-500 text-xs mt-0.5">Tu equipo estará activo en minutos</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-brand-dark font-bold mt-0.5">+</span>
                  <div>
                    <span className="font-semibold">Dashboard privado</span>
                    <p className="text-gray-500 text-xs mt-0.5">Gestiona y consulta tu equipo en tiempo real</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-brand-dark font-bold mt-0.5">+</span>
                  <div>
                    <span className="font-semibold">Sin permanencia</span>
                    <p className="text-gray-500 text-xs mt-0.5">Cancela cuando quieras, sin penalizaciones</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
