const testimonios = [
  { quote: 'Gracias a MyCompi, hemos automatizado nuestros procesos internos, resultando en un aumento del 35% en productividad.', initials: 'LM', name: 'Laura Martínez', role: 'Científica de Datos, DataFlow' },
  { quote: 'La implementación de agentes ha mejorado significativamente la experiencia de nuestros clientes. Tasa de conversión +25%.', initials: 'CG', name: 'Carlos Gómez', role: 'Gerente de Marketing, TechWorld' },
  { quote: 'BeeNoCode transformó la forma en que interactuamos con nuestros clientes. Servicio eficiente y personalizado.', initials: 'AB', name: 'Ana Beltrán', role: 'Responsable Att. Cliente, ServiPlus' },
  { quote: 'La integración de las soluciones ha sido un cambio de juego. Reducimos costes operativos y mejoramos eficiencia.', initials: 'JR', name: 'Javier Ruiz', role: 'CEO, MarketLeaders' },
  { quote: 'Trabajar con MyCompi ha sido excepcional. Soluciones que han optimizado nuestros procesos de forma impresionante.', initials: 'MF', name: 'María Fernández', role: 'Directiva General, EcoSolutions' },
  { quote: 'Desde que incorporamos MyCompi, nuestra empresa ha visto una mejora notable en eficiencia y satisfacción de clientes.', initials: 'RS', name: 'Roberto Sánchez', role: 'Director de Tecnología, InnovaCorp' },
  { quote: 'MyCompi nos permitió escalar sin incrementar costes operativos. Automatización real que funciona.', initials: 'EL', name: 'Elena López', role: 'Gerente de Proyectos, TechSolutions' },
  { quote: 'La colaboración con MyCompi ha sido fundamental para nuestra transformación digital. Mejora medible.', initials: 'MT', name: 'Miguel Torres', role: 'Director de Operaciones, DigitalWave' },
]

export default function Testimonials() {
  return (
    <section className="bg-brand-bg-section border-t border-b border-brand-border py-[100px]">
      <div className="max-w-[1200px] mx-auto px-10 mb-[60px]">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">Testimonios</p>
          <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text mb-3">Lo que dicen nuestros clientes</h2>
          <p className="text-base text-brand-secondary max-w-[560px] mx-auto">Empresas que ya están creciendo con MyCompi</p>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-none pb-8">
        <div className="flex gap-5 px-10">
          {testimonios.map(t => (
            <div key={t.initials} className="flex-shrink-0 w-[300px] bg-brand-bg border border-brand-border rounded-xl p-7 transition-all duration-300 hover:shadow-md">
              <blockquote className="text-sm text-brand-secondary leading-relaxed mb-4">"{t.quote}"</blockquote>
              <div className="text-amber-400 text-[13px] tracking-widest mb-3.5">★★★★★</div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-brand-yellow text-brand-text flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-[13px] text-brand-text">{t.name}</div>
                  <div className="text-[11px] text-brand-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
