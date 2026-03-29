import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const equipo = [
  {
    nombre: 'Alberto Gala',
    emoji: '🎯',
    rol: 'Director de Equipo',
    color: 'from-gray-800 to-gray-900',
    funciones: ['Coordina todo tu equipo agéntico', 'Toma decisiones estratégicas contigo', 'Supervisa que cada agente cumpla sus objetivos', 'Te reporta el progreso semanal'],
    ejemplo: 'Cada lunes te envía un resumen de lo que hizo cada agente durante la semana.',
  },
  {
    nombre: 'Enzo Herrera',
    emoji: '📊',
    rol: 'Marketing',
    color: 'from-blue-500 to-indigo-600',
    funciones: ['Crea contenido para redes sociales y blog', 'Gestiona campañas de publicidad (Meta, Google Ads)', 'Optimiza SEO de tu web para atraer tráfico', 'Analiza métricas y propone mejoras'],
    ejemplo: 'Te prepara 30 posts para el mes y los publica automáticamente.',
  },
  {
    nombre: 'Carlos Mendoza',
    emoji: '💼',
    rol: 'Ventas',
    color: 'from-green-500 to-emerald-600',
    funciones: ['Captura y qualification leads nuevos', 'Hace seguimiento automático de prospects', 'Cierra deals y gestiona objeciones', 'Te alerta cuando hay una oportunidad caliente'],
    ejemplo: 'Te ha contactado alguien por Instagram. Carlos le manda un mensaje personalizado y agenda una llamada contigo.',
  },
  {
    nombre: 'Laura Montes',
    emoji: '💬',
    rol: 'Atención al Cliente',
    color: 'from-pink-500 to-rose-600',
    funciones: ['Responde dudas de tus clientes al instante', 'Gestiona quejas y escala cuando es necesario', 'Recoge feedback y lo sintetiza para ti', 'Disponible 24/7 — no descansa ni en festivos'],
    ejemplo: 'Un cliente te pregunta a las 11pm si hacéis envíos a Andorra. Laura responde al momento.',
  },
  {
    nombre: 'Elena Ortega',
    emoji: '⚙️',
    rol: 'Operaciones',
    color: 'from-orange-500 to-amber-600',
    funciones: ['Automatiza procesos repetitivos de tu negocio', 'Conecta herramientas que no hablan entre sí', 'Detecta cuellos de botella y propone soluciones', 'Genera informes operativos'],
    ejemplo: 'Cada viernes te envía un excel con el resumen de ventas, stock y métricas del semana.',
  },
  {
    nombre: 'Diana Palau',
    emoji: '📈',
    rol: 'Data & Growth',
    color: 'from-purple-500 to-violet-600',
    funciones: ['Analiza datos de tu negocio para encontrar oportunidades', 'Identifica patrones de comportamiento de clientes', 'Te ayuda a entender qué funciona y qué no', 'Construye dashboards con métricas clave'],
    ejemplo: 'Descubre que los clientes que compran los martes tienen un ticket 40% mayor. Te lo comunica y propone una acción.',
  },
]

const planes = [
  { id: 'BASICO', name: 'Profesional Agéntico', price: 49, agents: 1, desc: '1 agente especializado' },
  { id: 'EQUIPO', name: 'Equipo Agéntico', price: 49, agents: 6, desc: '1 manager + 5 especializados', popular: true },
  { id: 'DIRECCION', name: 'Equipos con Dirección', price: 49, agents: 31, desc: '1 Director + 5 Managers + 25 agentes' },
]

function AgentRow({ agent, expanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md ${expanded ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200 bg-white'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-xl shadow`}>
          {agent.inicial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-900">{agent.nombre}</div>
          <div className="text-xs text-gray-500">{agent.rol}</div>
        </div>
        <div className="text-brand-yellow text-lg">{expanded ? '−' : '+'}</div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {agent.funciones.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-brand-yellow text-xs mt-0.5">-</span>
                <span className="text-xs text-gray-600">{f}</span>
              </div>
            ))}
          </div>
          <div className={`p-4 rounded-xl bg-gradient-to-br ${agent.color}`}>
            <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider mb-1">Ejemplo de tarea</div>
            <div className="text-sm text-white font-medium">{agent.ejemplo}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Hiring() {
  const [openAgent, setOpenAgent] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('EQUIPO')

  const plan = planes.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-[100px] pb-16 px-6 bg-white">
          <div className="max-w-[800px] mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-4 block">Profesionales Agénticos Especializados</span>
            <h1 className="text-[28px] md:text-[clamp(36px,5vw,56px)] font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              Tu próximo empleado estrella no duerme, no cobra IRPF y no pide vacaciones.
            </h1>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8 max-w-[600px] mx-auto">
              Contrata profesionales agénticos que trabajan 24/7. Sin contratos, sin nóminas, sin papeleo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#equipo" className="bg-brand-yellow text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-brand-yellow-dark transition-all inline-block">
                Ver equipo
              </a>
              <a href="/#/checkout" className="border border-gray-300 text-gray-600 font-semibold px-8 py-4 rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all inline-block">
                Ver precios
              </a>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section id="equipo" className="py-16 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Tu equipo agéntico</h2>
              <p className="text-sm text-gray-500">Cada agente tiene un rol claro.-reportan a un director que los coordina. Tu delegas, ellos ejecutan.</p>
            </div>

            {/* Director highlight */}
            <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl shadow-2xl flex-shrink-0">
                  {equipo[0].emoji}
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-lg text-white">{equipo[0].nombre}</div>
                  <div className="text-xs font-semibold text-brand-yellow uppercase tracking-wider mt-0.5">{equipo[0].rol}</div>
                  <div className="text-sm text-gray-400 mt-2">{equipo[0].funciones[0]}</div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {equipo.slice(1).map(a => (
                      <div key={a.nombre} className="w-10 h-10 rounded-full bg-gradient-to-br border-2 border-gray-800 flex items-center justify-center text-lg shadow" title={a.nombre}>
                        {a.inicial}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 max-w-[100px]">Coordina a {equipo.length - 1} especialistas</div>
                </div>
              </div>
            </div>

            {/* Resto de agentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {equipo.slice(1).map((agent, i) => (
                <AgentRow
                  key={agent.nombre}
                  agent={agent}
                  expanded={openAgent === i + 1}
                  onToggle={() => setOpenAgent(openAgent === i + 1 ? null : i + 1)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="planes" className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Planes transparentes</h2>
              <p className="text-sm text-gray-500">Sin costes de contratación. Cancela cuando quieras.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {planes.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`rounded-2xl p-6 cursor-pointer border-2 transition-all ${selectedPlan === p.id ? 'border-brand-yellow shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {p.popular && (
                    <div className="text-[10px] font-bold bg-brand-yellow text-gray-900 px-3 py-1 rounded-full inline-block mb-3">Popular</div>
                  )}
                  <div className="font-bold text-base text-gray-900 mb-1">{p.name}</div>
                  <div className="text-xs text-gray-500 mb-4">{p.desc}</div>
                  <div className="text-[32px] font-extrabold text-gray-900 leading-none">
                    <sup className="text-lg align-top">€</sup>{p.price}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 mb-4">por mes</div>
                  <div className="text-xs text-gray-600">{p.agents} agente{p.agents !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/checkout"
                className="inline-block bg-brand-yellow text-gray-900 font-bold px-10 py-4 rounded-xl hover:bg-brand-yellow-dark transition-all text-base"
              >
                Contratar plan {plan.name} — {plan.price}/mes
              </Link>
              <p className="text-xs text-gray-400 mt-3">Sin compromiso. Cancela cuando quieras.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
          <div className="max-w-[600px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Preguntas frecuentes</h2>
            {[
              { q: '¿Qué es un Profesional Agéntico?', a: 'Es un agente de IA especializado en un área concreta (marketing, ventas, atención al cliente, operaciones o data) que trabaja para tu negocio de forma autónoma, 24/7.' },
              { q: '¿Necesito conocimientos técnicos?', a: 'No. Lo configuramos todo nosotros. Tú solo nos dices qué necesitas.' },
              { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencias ni penalizaciones. Cancela cuando quieras desde tu panel.' },
              { q: '¿Cómo funcionan los agentes?', a: 'Les defines objetivos y trabajan de forma autónoma. Recibes reportes periódicos y puedes hablar con ellos en cualquier momento.' },
              { q: '¿Qué incluye el soporte?', a: 'Email en Básico, prioritario en Equipo, y dedicado 24/7 en Dirección. Siempre tienes a alguien disponible.' },
            ].map((f, i) => (
              <div key={i} className="border border-gray-200 rounded-xl mb-2 bg-white overflow-hidden">
                <div className="px-6 py-4 font-semibold text-sm text-gray-900">{f.q}</div>
                <div className="px-6 pb-4 text-xs text-gray-500 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer mínimo */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">MyCompi</a>
        <span className="mx-3 text-gray-300">·</span>
        <a href="/login" className="text-xs text-gray-400 hover:text-gray-600">Iniciar sesión</a>
        <span className="mx-3 text-gray-300">·</span>
        <span className="text-xs text-gray-400">© 2026 MyCompi</span>
      </footer>
    </div>
  )
}
