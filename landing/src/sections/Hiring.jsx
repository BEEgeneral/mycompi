import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

const plans = [
  { name: 'Profesional Agéntico', price: 10, desc: 'Para empezar a automatizar', popular: false, features: ['1 Profesional Agéntico especializado', 'Reportes mensuales', 'Soporte por email', 'Automatización esencial'] },
  { name: 'Equipo Agéntico', price: 49, desc: 'Manager + 5 especializados', popular: true, features: ['Manager Agéntico', '5 Profesionales especializados', 'Coordinación y supervisión', 'Reportes semanales', 'Soporte prioritario'] },
  { name: 'Equipos con Dirección', price: 147, desc: 'Varios equipos + dirección', popular: false, features: ['Profesionales ilimitados', 'Equipo de dirección', 'Soporte 24/7', 'Consultoría avanzada', 'Reporting completo'] },
]

const faqs = [
  { q: '¿Qué es un Profesional Agéntico?', a: 'Es un agente de IA especializado en un área concreta (marketing, ventas, atención al cliente, operaciones o data) que trabaja para tu negocio de forma autónoma, 24/7.' },
  { q: '¿Necesito conocimientos técnicos?', a: 'No. Lo configuramos todo nosotros. Tú solo nos dices qué necesitas.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencias ni penalizaciones. Cancela cuando quieras desde tu panel.' },
  { q: '¿Cómo funcionan los agentes?', a: 'Les defines objetivos y trabajan de forma autónoma. Recibes reportes periódicos y puedes hablar con ellos en cualquier momento.' },
  { q: '¿Qué incluye el soporte?', a: 'Email en Básico, prioritario en Equipo, y dedicado 24/7 en Dirección. Siempre tienes a alguien disponible.' },
]

export default function Hiring() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  const handleSubmit = (e) => { e.preventDefault() }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-16 px-6 bg-white">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-4 block">Profesionales Agénticos Especializados</span>
            <h1 className="text-[28px] md:text-[52px] font-extrabold text-brand-text tracking-tight leading-tight mb-6">
              Tu próximo empleado estrella no duerme, no cobra IRPF y no pide vacaciones.
            </h1>
            <p className="text-base md:text-lg text-brand-secondary leading-relaxed mb-8 max-w-[600px] mx-auto">
              Contrata profesionales agénticos que trabajan 24/7. Sin contratos, sin nóminas, sin papeleo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planes" className="bg-brand-yellow text-brand-text font-bold px-8 py-4 rounded-xl hover:bg-brand-yellow-dark transition-all inline-block">Ver planes</a>
              <a href="#faq" className="border border-brand-border text-brand-secondary font-semibold px-8 py-4 rounded-xl hover:border-brand-text transition-all inline-block">Preguntas frecuentes</a>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-16 px-6 bg-brand-bg-section border-t border-b border-brand-border">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-brand-text mb-12">¿Cómo funciona?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Elige tu plan', desc: '1 agente, un equipo o varios. Desde €10/mes. Sin alta de autónomos, nóminas ni papeleo.' },
                { step: '2', title: 'Los configuramos nosotros', desc: 'Te asignamos profesionales agénticos especializados. Activos en menos de 24h.' },
                { step: '3', title: 'Trabajan para ti', desc: 'Le dices qué necesitas y ellos lo hacen. Reportes semanales incluidos. Tú sigues enfocado en tu negocio.' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{s.step}️⃣</div>
                  <h3 className="font-bold text-brand-text mb-2">{s.title}</h3>
                  <p className="text-sm text-brand-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planes" className="py-16 px-6 bg-white">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-brand-text mb-3">Planes transparentes</h2>
            <p className="text-center text-brand-secondary mb-12 text-sm">Sin costes de contratación. Cancela cuando quieras.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(p => (
                <div key={p.name} className={`rounded-xl p-8 ${p.popular ? 'border-2 border-brand-yellow shadow-lg' : 'border border-brand-border'}`}>
                  {p.popular && <span className="inline-block bg-brand-yellow text-brand-text text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">Popular</span>}
                  <div className="font-bold text-lg text-brand-text mb-1">{p.name}</div>
                  <div className="text-sm text-brand-secondary mb-4">{p.desc}</div>
                  <div className="text-[40px] font-extrabold text-brand-text leading-none mb-1">
                    <sup className="text-lg align-top">€</sup>{p.price}
                  </div>
                  <div className="text-sm text-brand-muted mb-6">/mes</div>
                  <ul className="space-y-2 mb-6">
                    {p.features.map(f => (
                      <li key={f} className="text-sm text-brand-secondary pl-6 relative before:content-['✓'] before:absolute before:left-0 before:font-bold"> {f}</li>
                    ))}
                  </ul>
                  <a href="#contacto" className={`block text-center font-bold text-sm py-3 rounded-xl transition-all ${p.popular ? 'bg-brand-yellow text-brand-text hover:bg-brand-yellow-dark' : 'bg-brand-bg-section border border-brand-border text-brand-text hover:border-brand-text'}`}>
                    Elegir este plan
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 px-6 bg-brand-bg border-t border-brand-border">
          <div className="max-w-[700px] mx-auto">
            <h2 className="text-center text-2xl font-bold text-brand-text mb-8">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="border border-brand-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center gap-4 px-6 py-4.5 text-left font-semibold text-sm text-brand-text hover:bg-brand-bg-section transition-colors"
                  >
                    <span>{f.q}</span>
                    <span className="text-brand-muted text-lg flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4.5 text-sm text-brand-secondary leading-relaxed border-t border-brand-border">
                      <div className="pt-4">{f.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contacto" className="py-16 px-6 bg-brand-yellow">
          <div className="max-w-[480px] mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text mb-4">¿Hablamos de tu proyecto?</h2>
            <p className="text-brand-secondary mb-6 text-sm">Rellena el formulario y te respondemos en menos de 24h.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
              />
              <input
                type="email"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white"
              />
              <textarea
                rows="4"
                placeholder="Cuéntanos qué necesitas..."
                value={form.mensaje}
                onChange={e => setForm({ ...form, mensaje: e.target.value })}
                className="w-full border border-brand-border rounded-xl px-4 py-3.5 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text bg-white resize-y"
              />
              <button type="submit" className="bg-brand-text text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all">
                Enviar mensaje
              </button>
              <p className="text-xs text-brand-secondary">Sin compromiso. Respondemos en menos de 24h.</p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
