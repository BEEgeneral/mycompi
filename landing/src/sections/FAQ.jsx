import { useState } from 'react'

const faqs = [
  {
    q: '¿Qué es exactamente un Profesional de MyCompi?',
    a: 'Es un profesional especializado en un área — Marketing, Ventas, Atención al Cliente, etc. No es un chatbot genérico. Tiene memoria, conoce tu negocio y ejecuta tareas concretas: responder dudas de clientes, crear contenido, hacer follow-up de leads, generar informes. Trabaja de forma autónoma y reporta resultados.',
    category: 'general',
  },
  {
    q: '¿Necesito conocimientos técnicos para usarlo?',
    a: 'No. Configuras todo desde tu panel en minutos. Si tienes dudas, el equipo de soporte te ayuda. No necesitamos acceso a tus sistemas.',
    category: 'general',
  },
  {
    q: '¿Cómo se diferencia de contratar a alguien?',
    a: 'Un profesional de MyCompi no enferma, no pide vacaciones, no se distrae, trabaja 24/7 y cuesta 49€/mes. No sustituye al 100% de una persona — pero sí puede hacer el trabajo de un junior en muchas tareas repetitivas, por una fracción del coste.',
    category: 'general',
  },
  {
    q: '¿Mis clientes sabrán que es un profesional automatizado?',
    a: 'Depende de cómo lo configuremos. En atención al cliente responde como cualquier profesional — pero con más consistencia y velocidad. En otros roles trabaja en segundo plano (creando contenido, analizando datos, gestionando leads).',
    category: 'general',
  },
  {
    q: '¿Cuánto tarda en estar operativo?',
    a: 'El primer profesional, en menos de 24h. Un equipo completo en 1-3 días. Empezar es elegir tu plan y contarnos qué necesitas.',
    category: 'general',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos, sin permanencia. Cancelas desde tu panel cuando quieras. No hay penalty ni costes de salida.',
    category: 'pagos',
  },
  {
    q: '¿Qué pasa si el profesional se equivoca?',
    a: 'Las acciones irreversibles siempre requieren tu aprobación. Además, el director de tu equipo supervisa y escala cuando algo está fuera de alcance o implica decisiones de negocio.',
    category: 'tecnico',
  },
  {
    q: '¿Qué pasa si necesito una功能 que no existe?',
    a: 'Lo evaluamos y lo implementamos si tiene sentido para otros clientes. Roadmap abierto: tú puedes pedir funcionalidades y priorizamos según la demanda.',
    category: 'tecnico',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'Tus datos se almacenan en servidores seguros (Neon PostgreSQL + Render). No compartimos información con terceros. Cumple con GDPR.',
    category: 'tecnico',
  },
  {
    q: '¿Cómo funciona el pago?',
    a: 'Pago mensual con tarjeta a través de Stripe. Datos 100% seguros. Sin sorpresas: el precio que ves es el que pagas.',
    category: 'pagos',
  },
  {
    q: '¿Hay factura fiscal?',
    a: 'Sí. Stripe genera factura automática con todos los datos fiscales que necesites (CIF, dirección, IVA).',
    category: 'pagos',
  },
]

const categories = [
  { id: 'all', label: 'Todas' },
  { id: 'general', label: 'General' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'tecnico', label: 'Técnico' },
]

export default function FAQ() {
  const [active, setActive] = useState('all')

  const filtered = active === 'all' ? faqs : faqs.filter(f => f.category === active)

  return (
    <section id="faq" className="bg-brand-pastel/20 border-t border-brand-pastel py-16 md:py-[100px]">
      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">FAQ</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark">
            Preguntas antes de empezar
          </h2>
        </div>

        {/* Filtro por categoría */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-5 py-2 rounded-pill text-sm font-semibold transition-all border-2 ${
                active === c.id
                  ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                  : 'bg-white text-brand-dark border-brand-pastel hover:border-brand-dark'
              }`}
            >
              {c.label}
              {c.id !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({faqs.filter(f => f.category === c.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid de FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((f, i) => (
            <div
              key={i}
              className="bg-white border-2 border-brand-pastel rounded-2xl p-6 hover:shadow-md hover:border-brand-yellow transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-brand-yellow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-yellow text-xs font-bold">Q</span>
                </div>
                <p className="font-semibold text-sm text-brand-dark leading-snug">{f.q}</p>
              </div>
              <p className="text-sm text-brand-secondary leading-relaxed pl-10">{f.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-brand-secondary mb-4">¿Tienes más preguntas?</p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 bg-brand-dark text-white font-bold text-sm px-8 py-3.5 rounded-pill hover:bg-brand-dark/90 transition-all"
          >
            Habla con nosotros
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
