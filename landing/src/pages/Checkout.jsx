import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const PLANES = {
  BASICO: { name: 'Profesional Agéntico', price: 10, agents: 1, desc: '1 agente especializado' },
  EQUIPO: { name: 'Equipo Agéntico', price: 49, agents: 6, desc: '1 manager + 5 especializados', popular: true },
  DIRECCION: { name: 'Equipos con Dirección', price: 147, agents: 'Ilimitados', desc: 'Equipos + dirección 24/7' },
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
    await new Promise(r => setTimeout(r, 1500))
    localStorage.setItem('mycompi_checkout_done', 'true')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-6 pt-[88px] pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/contratacion" className="hover:text-gray-600">Contratar</Link>
          <span>/</span>
          <span className={step === 1 ? 'text-gray-900 font-semibold' : 'text-gray-400'}>Tu cuenta</span>
          <span>/</span>
          <span className={step === 2 ? 'text-gray-900 font-semibold' : 'text-gray-400'}>Pago</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Elige tu plan</h1>
          <p className="text-sm text-gray-500">Tu equipo se monta automáticamente cuando completes el pago.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Plan cards */}
          <div className="lg:col-span-3 space-y-3">
            {Object.entries(PLANES).map(([key, p]) => (
              <div
                key={key}
                onClick={() => setPlan(key)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${plan === key ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan === key ? 'border-brand-yellow' : 'border-gray-300'}`}>
                  {plan === key && <div className="w-3.5 h-3.5 rounded-full bg-brand-yellow" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{p.name}</span>
                    {p.popular && <span className="text-[10px] font-bold bg-brand-yellow text-gray-900 px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-extrabold text-lg text-gray-900">€{p.price}<span className="text-xs font-normal text-gray-400">/mes</span></div>
                  <div className="text-[10px] text-gray-400">{p.agents} agente{p.agents !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Resumen */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-[88px]">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{selectedPlan.name}</span>
                  <span className="font-bold text-gray-900">€{selectedPlan.price}/mes</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Setup incluido</span>
                  <span>€0</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total hoy</span>
                  <span className="font-extrabold text-gray-900">€{selectedPlan.price}</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400">Cancela cuando quieras. Sin compromisos.</div>
            </div>
          </div>
        </div>

        {/* Step 1: Registro */}
        {step === 1 && (
          <div className="mt-10 max-w-[500px]">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Crea tu cuenta</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Nombre completo</label>
                <input type="text" value={form.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Tu nombre" required className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="tu@empresa.com" required className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Contraseña</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Empresa</label>
                <input type="text" value={form.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} placeholder="Nombre de tu empresa" required className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-yellow" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-yellow text-gray-900 font-bold py-3.5 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50">
                {loading ? 'Creando cuenta...' : 'Continuar al pago →'}
              </button>
              <p className="text-center text-xs text-gray-400">Al registrarte aceptas nuestros términos. Tu equipo se monta automáticamente.</p>
            </form>
          </div>
        )}

        {/* Step 2: Pago */}
        {step === 2 && (
          <div className="mt-10 max-w-[500px]">
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">¡Cuenta creada!</h2>
            <p className="text-sm text-gray-500 mb-6">Tu cuenta está lista. Completa el pago para activar tu equipo.</p>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Cuenta activa</div>
                  <div className="text-xs text-gray-500">{form.email}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Plan</span><span className="font-bold">{selectedPlan.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Equipo</span><span className="font-bold">{selectedPlan.agents} agentes</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2"><span className="font-bold">Total</span><span className="font-extrabold text-lg">€{selectedPlan.price}/mes</span></div>
              </div>
            </div>

            <button onClick={handlePayment} disabled={loading} className="w-full bg-brand-yellow text-gray-900 font-bold py-3.5 rounded-xl hover:bg-yellow-300 transition-all disabled:opacity-50">
              {loading ? 'Procesando...' : `Pagar €${selectedPlan.price}/mes →`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">🔒 Pago seguro con Stripe. Cancela cuando quieras.</p>
          </div>
        )}
      </main>
    </div>
  )
}
