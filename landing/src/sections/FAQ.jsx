import { useState } from 'react'

const faqs = [
  {
    q: '¿Qué es exactamente un Profesional de MyCompi?',
    a: 'Es un profesional especializado en un área — Marketing, Ventas, Atención al Cliente, etc. No es un chatbot genérico. Tiene memoria, conoce tu negocio y ejecuta tareas concretas: responder dudas de clientes, crear contenido, hacer follow-up de leads, generar informes. Trabaja de forma autónoma y reporta resultados.',
  },
  {
    q: '¿Necesito conocimientos técnicos para usarlo?',
    a: 'No. Configuras todo desde tu panel en minutos. Si tienes dudas, el equipo de soporte te ayuda. No necesitamos acceso a tus sistemas.',
  },
  {
    q: '¿Cómo se diferencia de contratar a alguien?',
    a: 'Un profesional de MyCompi no enferma, no pide vacaciones, no se distrae, trabaja 24/7 y cuesta desde 49€/mes. No sustituye al 100% de una persona — pero sí puede hacer el trabajo de un junior en muchas tareas repetitivas, por una fracción del coste.',
  },
  {
    q: '¿Mis clientes sabrán que es un profesional automatizado?',
    a: 'Depende de cómo lo configuremos. En atención al cliente, responde como cualquier profesional — pero con más consistencia y velocidad. En otros roles, trabaja en segundo plano (creando contenido, analizando datos, gestionando leads).',
  },
  {
    q: '¿Cuánto tarda en estar operativo?',
    a: 'El primer profesional, en menos de 24h. Un equipo completo en 1-3 días. Empezar es elegir tu plan y contarnos qué necesitas.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos, sin permanencia. Cancelas desde tu panel cuando quieras. No hay penalty ni costes de salida.',
  },
  {
    q: '¿Qué pasa si el profesional se equivoca?',
    a: 'Las acciones irreversibles siempre requieren tu aprobación. Además, el director de tu equipo supervisa y escala cuando algo está fuera de alcance o implica decisiones de negocio.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="bg-brand-pastel/20 border-t border-brand-pastel py-16 md:py-[100px]">
      <div className="max-w-[720px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">FAQ</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark">
            Preguntas antes de empezar
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border-2 border-brand-pastel rounded-[1.5rem] overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left font-semibold text-sm text-brand-dark hover:bg-brand-pastel/30 transition-colors"
              >
                <span>{f.q}</span>
                <span className={`text-brand-yellow text-lg flex-shrink-0 transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-brand-secondary leading-relaxed border-t border-brand-pastel bg-brand-pastel/10">
                  <div className="pt-4">{f.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA al final del FAQ */}
        <div className="text-center mt-10">
          <p className="text-sm text-brand-secondary mb-4">¿Tienes más preguntas?</p>
          <a href="#contacto" className="inline-flex items-center gap-2 bg-brand-dark text-white font-bold text-sm px-8 py-3.5 rounded-pill hover:bg-brand-dark/90 transition-all">
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
