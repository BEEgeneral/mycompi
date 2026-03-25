import { useState } from 'react'

const faqs = [
  {
    q: '¿Qué es exactamente un Profesional Agéntico?',
    a: 'Es un agente de IA especializado en un área — Marketing, Ventas, Atención al Cliente, etc. No es un chatbot genérico. Tiene memoria, conoce tu negocio y ejecuta tareas concretas: responder emails, crear contenido, hacer follow-up de leads, generar informes. Trabaja de forma autónoma y reporta resultados.',
  },
  {
    q: '¿Necesito conocimientos técnicos para usarlo?',
    a: 'No. Configuras todo desde tu panel de cliente en minutos. Si tienes dudas, tu account manager te ayuda. No necesitamos acceso a tus sistemas.',
  },
  {
    q: '¿Cómo se diferencia de contratar a alguien?',
    a: 'Un agente no生病, no pide vacaciones, no sedistrae, trabaja 24/7 y cuesta desde 10€/mes. No sustituye al 100% de una persona — pero sí puede hacer el trabajo de un junior o associate en muchas tareas repetitivas, por una fracción del coste.',
  },
  {
    q: '¿Mis clientes sabrán que es un agente?',
    a: 'Depende de cómo lo configuremos. En atención al cliente, Laura responde como cualquier agent — pero con más consistencia y velocidad que un humano. En otros roles, trabaja en segundo plano (creando contenido, analizando datos, gestionando leads).',
  },
  {
    q: '¿Cuánto tarda en estar operativo?',
    a: 'El primer agente, en menos de 24h. Un equipo completo en 1-3 días. Empezar es elegir tu plan y contarnos qué necesitas.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos, sin permanencia. Cancelas desde tu panel cuando quieras. No hay penalty ni costes de salida.',
  },
  {
    q: '¿Qué pasa si el agente se equivoca?',
    a: 'Los agentes tienen niveles de confianza — acciones irreversibles siempre requieren tu aprobación. Además, Paco supervisa y escala cuando algo está fuera de alcance o implica decisiones de negocio.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="bg-white border-t border-gray-200 py-16 md:py-[100px]">
      <div className="max-w-[720px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">FAQ</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-gray-900">
            Preguntas antes de empezar
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center gap-4 px-5 md:px-6 py-4 text-left font-semibold text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span>{f.q}</span>
                <span className={`text-indigo-500 text-lg flex-shrink-0 transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="px-5 md:px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50">
                  <div className="pt-4">{f.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA al final del FAQ */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 mb-4">¿Tienes más preguntas?</p>
          <a href="#contacto" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all">
            Habla con nosotros →
          </a>
        </div>
      </div>
    </section>
  )
}
