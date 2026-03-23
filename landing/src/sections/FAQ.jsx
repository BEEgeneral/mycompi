import { useState } from 'react'

const faqs = [
  {
    q: '¿Por qué automatizar con MyCompi?',
    a: 'Con MyCompi reduces costes operativos hasta un 80% sin contratar más personal. Un solo Profesional Agéntico puede hacer el trabajo de 5 personas especializadas, disponible 24/7. Tu equipo humano se libera de tareas repetitivas para enfocarse en lo que realmente importa: crecer tu negocio.',
  },
  {
    q: '¿Cómo funciona MyCompi?',
    a: 'Contratas uno o varios Profesionales Agénticos según tu plan. Cada uno es un experto en su área — Marketing, Ventas, Atención al Cliente, Operaciones o Data — y trabajan en equipo coordinado. Tú defines objetivos y ellos los ejecutan de forma autónoma, reportando resultados.',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Desde 10€/mes por un Profesional Agéntico. Un Equipo Agéntico (1 manager + 5 agentes) cuesta 49€/mes. Y si necesitas varios equipos con dirección, desde 147€/mes. Sin contratos, sin compromisos a largo plazo.',
  },
  {
    q: '¿Cuánto tarda en implementarse?',
    a: 'Tu primer Profesional Agéntico está operativo en menos de 24 horas. Un Equipo Agéntico completo en 1-3 días. Empezar es tan simple como elegir tu plan y contarnos qué necesitáis.',
  },
  {
    q: '¿Qué tareas puede automatizar?',
    a: 'Cada Profesional Agéntico es un especialista: tu agente de Atención al Cliente responde dudas y resuelve incidencias; el de Ventas gestiona y sigue leads; el de Marketing crea contenido y gestiona redes; el de Operaciones automatiza procesos internos; y el de Data analiza métricas y genera informes.',
  },
  {
    q: '¿Necesito conocimientos técnicos?',
    a: 'No. El alta, configuración y gestión se hacen desde tu panel de cliente. Si necesitas ayuda, tu Account Manager te acompaña en todo el proceso. No requerimos acceso a tus sistemas.',
  },
  {
    q: '¿Qué soporte ofrecen?',
    a: 'Todos los planes incluyen soporte directo: 3 meses en Profesional Agéntico, 6 meses en Equipo Agéntico, y 12 meses con Account Manager dedicado en Equipos con Dirección. Siempre tendrás a alguien de MyCompi disponible.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="bg-brand-bg border-t border-brand-border py-[100px]">
      <div className="max-w-[1200px] mx-auto px-10">
        <div className="text-center mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">FAQ</p>
          <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text">Tenemos respuestas</h2>
        </div>
        <div className="max-w-[720px] mx-auto space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-brand-border rounded-xl overflow-hidden bg-brand-bg">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-center gap-4 px-6 py-4.5 text-left font-semibold text-[15px] text-brand-text hover:bg-brand-bg-section transition-colors"
              >
                <span>{f.q}</span>
                <span className="text-brand-muted text-lg flex-shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4.5 text-sm text-brand-secondary leading-relaxed border-t border-brand-border">
                  <div className="pt-4">{f.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
