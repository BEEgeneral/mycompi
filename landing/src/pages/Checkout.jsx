import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const PLANES = {
  BASICO: { name: 'Profesional Agéntico', price: 10, agents: 1, desc: '1 agente especializado', planId: 'basico' },
  EQUIPO: { name: 'Equipo Agéntico', price: 49, agents: 6, desc: '1 manager + 5 especializados', planId: 'profesional', popular: true },
  DIRECCION: { name: 'Equipos con Dirección', price: 147, agents: 'Ilimitados', desc: 'Equipos + dirección 24/7', planId: 'enterprise' },
}

export default function Checkout() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState('EQUIPO')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', nombreEmpresa: '' })
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
        <p className="text-sm text-gray-500 mb-8">Completa tu registro y pago para activar tu equipo.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className="flex-1 h-0.5 bg-gray-200"><div className={`h-full bg-primary transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} /></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {/* STEP 1: Registro */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">Datos de tu cuenta</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre completo</label>
                  <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} required placeholder="Tu nombre"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="tu@empresa.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Contraseña</label>
                  <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required placeholder="Mínimo 8 caracteres"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Empresa (opcional)</label>
                  <input type="text" value={form.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} placeholder="Nombre de tu empresa"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm">
                  {loading ? 'Registrando...' : 'Continuar'}
                </button>
              </form>
            </div>

            {/* Plan summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Resumen del plan</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-lg">
                    {selectedPlan.price}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{selectedPlan.name}</div>
                    <div className="text-xs text-gray-500">EUR / mes</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary font-bold">+</span> {selectedPlan.agents} agente{selectedPlan.agents !== 1 ? 's' : ''} especializado{selectedPlan.agents !== 1 ? 's' : ''}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary font-bold">+</span> Dashboard en tiempo real
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary font-bold">+</span> Soporte incluido
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary font-bold">+</span> Cancela cuando quieras
                  </li>
                </ul>
                <p className="text-center text-xs text-gray-400">Pago seguro con Stripe. Cancela cuando quieras.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pago */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5">Resumen del pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{selectedPlan.name}</span>
                  <span className="font-bold text-gray-900">{selectedPlan.price} EUR/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA</span>
                  <span className="text-gray-500">Incluido</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total mensual</span>
                  <span className="font-extrabold text-primary text-lg">{selectedPlan.price} EUR</span>
                </div>
              </div>

              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm">
                {loading ? 'Redirigiendo a Stripe...' : 'Pagar con Stripe'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Pago 100% seguro con Stripe. Cancela cuando quieras.</p>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">Al contratar aceptas nuestros términos y condiciones. Tu suscripción se renovará automáticamente cada mes. Puedes cancelar en cualquier momento desde tu cuenta.</p>
              </div>
            </div>

            <div className="bg-brand-bg rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4">Tu equipo agéntico incluye:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-primary font-bold mt-0.5">+</span>
                  <div>
                    <span className="font-semibold">Acceso instantáneo</span>
                    <p className="text-gray-500 text-xs mt-0.5">Tu equipo estará activo en minutos</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-primary font-bold mt-0.5">+</span>
                  <div>
                    <span className="font-semibold">Dashboard privado</span>
                    <p className="text-gray-500 text-xs mt-0.5">Gestiona y consulta tu equipo en tiempo real</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-primary font-bold mt-0.5">+</span>
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
