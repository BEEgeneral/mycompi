const semanas = [
  {
    semana: 'Semana 1',
    emoji: '⚡',
    titulo: 'Descubrimiento + MVP',
    desc: 'Configuramos todo y tu primer Compi ya trabaja en 24h.',
    dias: [
      { emoji: '🔍', agente: 'Diana', tarea: 'Research: análisis top 5 competidores directos en tu sector' },
      { emoji: '💻', agente: 'Marcos', tarea: 'Setup inicial: tu espacio de trabajo, integrations, panel' },
      { emoji: '💬', agente: 'Laura', tarea: 'Live: atención al cliente 24/7, respondiendo desde el día 1' },
      { emoji: '📊', agente: 'Enzo', tarea: 'Copy para web y ads: headlines, descripción, CTAs' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Primer outreach: 10 leads qualificados y primer mensaje enviado' },
    ],
  },
  {
    semana: 'Semana 2',
    emoji: '📊',
    titulo: 'Contenido + Outreach',
    desc: 'Tu marca gana presencia y el pipeline de ventas se activa.',
    dias: [
      { emoji: '📊', agente: 'Enzo', tarea: '15 posts para Instagram y LinkedIn + calendario editorial' },
      { emoji: '🐦', agente: 'Enzo', tarea: 'Primer post en redes: lanzamiento de tu empresa' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Follow-up a primeros leads + 10 leads nuevos qualificados' },
      { emoji: '🌐', agente: 'Marcos', tarea: 'Post en comunidades: Reddit, foros hispanos de tu sector' },
      { emoji: '📧', agente: 'Carlos', tarea: 'Email de lanzamiento a tu base de contactos' },
    ],
  },
  {
    semana: 'Semana 3',
    emoji: '🚀',
    titulo: 'Iterar + Métricas',
    desc: 'Mejoramos con datos reales de tus primeros usuarios.',
    dias: [
      { emoji: '💬', agente: 'Laura', tarea: 'Review feedback early adopters: qué funciona, qué no' },
      { emoji: '💻', agente: 'Marcos', tarea: 'Implementar las 2-3 features más pedidas por usuarios' },
      { emoji: '🔍', agente: 'Diana', tarea: 'Investigar canales de adquisición: TikTok, WhatsApp, SEO' },
      { emoji: '📈', agente: 'Diana', tarea: 'Reporte: retención, conversaciones/usuario, drop-off' },
      { emoji: '⚙️', agente: 'Elena', tarea: 'Automatizaciones: follow-up leads fríos, respuestas rápidas' },
    ],
  },
  {
    semana: 'Semana 4',
    emoji: '🎯',
    titulo: 'Growth + Informe Final',
    desc: 'Máquina de acquisition encendida y datos para decidir.',
    dias: [
      { emoji: '💻', agente: 'Marcos', tarea: 'SEO básico: meta tags, estructura, sitemap' },
      { emoji: '📺', agente: 'Enzo', tarea: 'Crear video ad con Sora + lanzar campaña Meta Ads (10€/día)' },
      { emoji: '📈', agente: 'Diana', tarea: 'Informe final 30 días: antes vs después, métricas, oportunidades' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Informe de pipeline: leads capturados, ratio de cierre' },
      { emoji: '🎯', agente: 'Paco', tarea: 'Informe ejecutivo para ti + roadmap mes 2' },
    ],
  },
]

const agentes = [
  { emoji: '🎯', nombre: 'Paco', rol: 'Orquestador', desc: 'Coordina el equipo y te reporta cada semana' },
  { emoji: '💬', nombre: 'Laura', rol: 'Atención al Cliente', desc: 'Responsable 24/7 — responde, escala, raccoge feedback' },
  { emoji: '📊', nombre: 'Enzo', rol: 'Marketing', desc: 'Contenido, ads, SEO — hace crecer tu visibilidad' },
  { emoji: '💼', nombre: 'Carlos', rol: 'Ventas', desc: 'Captación, qualification y cierre de leads' },
  { emoji: '⚙️', nombre: 'Elena', rol: 'Operaciones', desc: 'Automatizaciones y conexión de herramientas' },
  { emoji: '📈', nombre: 'Diana', rol: 'Data', desc: 'Métricas, dashboards, análisis de retención' },
  { emoji: '💻', nombre: 'Marcos', rol: 'Desarrollo', desc: 'Tu web, landing y e-commerce siempre actualizadas' },
]

export default function QueHacen() {
  return (
    <section id="quehacen" className="bg-white border-t border-gray-100 py-16 md:py-[90px]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">Tu primer mes</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-dark mb-3">
            Qué hacen tus Compis en 30 días
          </h2>
          <p className="text-sm text-brand-secondary max-w-[560px] mx-auto">
            El mismo plan que usa Polsia para lanzar sus productos. Tus Compis ejecutan día a día, en paralelo, sin que tengas que gestionar nada.
          </p>
        </div>

        {/* Las 4 semanas */}
        <div className="space-y-6 mb-14">
          {semanas.map((s, si) => (
            <div key={si} className="bg-brand-cream rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{s.emoji}</span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow mb-0.5">{s.semana}</div>
                  <div className="font-bold text-base text-brand-dark">{s.titulo}</div>
                </div>
                <div className="ml-auto text-xs text-brand-secondary hidden md:block">{s.desc}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {s.dias.map((d, di) => (
                  <div key={di} className="bg-white rounded-xl p-3 border border-gray-100 hover:border-brand-yellow transition-colors">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">{d.emoji}</span>
                      <span className="text-[10px] font-bold text-brand-dark">{d.agente}</span>
                    </div>
                    <p className="text-[11px] text-brand-secondary leading-snug">{d.tarea}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Resultado */}
        <div className="bg-brand-dark rounded-3xl p-6 md:p-10 text-center mb-14">
          <div className="text-brand-yellow text-[10px] font-bold uppercase tracking-widest mb-2">Resultado del mes 1</div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
            Producto o servicio en mercado con pipeline de clientes
          </h3>
          <p className="text-sm text-white/60 max-w-[480px] mx-auto">
            Cada Compi ejecuta su parte del plan. Tú recibes un informe semanal de Paco y un roadmap para el mes 2.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {['20 días de trabajo paralelo', '7 Compis ejecutando', 'Campaña de ads activa', 'Informe final con datos'].map(r => (
              <div key={r} className="bg-white/10 rounded-full px-4 py-1.5 text-xs text-white font-medium">{r}</div>
            ))}
          </div>
        </div>

        {/* Tu equipo de Compis */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-brand-dark mb-1">Tu equipo de Compis</h3>
          <p className="text-xs text-brand-secondary">Cada uno tiene un rol claro. Todos reportan a Paco.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {agentes.map((a, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-dark/80 flex items-center justify-center text-xl shadow-lg mx-auto mb-2">
                {a.emoji}
              </div>
              <div className="font-bold text-xs text-brand-dark">{a.nombre}</div>
              <div className="text-[10px] text-brand-yellow font-semibold uppercase tracking-tight">{a.rol}</div>
              <div className="text-[10px] text-brand-secondary mt-1 leading-snug">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
