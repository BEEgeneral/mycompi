const semanas = [
  {
    semana: 'Semana 1',
    emoji: '⚡',
    titulo: 'Descubrimiento + Setup',
    desc: 'Configuramos todo y tu primer Compi ya trabaja en 24h.',
    dias: [
      { emoji: '🎯', agente: 'Paco', tarea: 'Llamada de descubrimiento: tu negocio, clientes, pain points' },
      { emoji: '⚙️', agente: 'Elena', tarea: 'Configura tu panel y conecta herramientas (email, web, CRM)' },
      { emoji: '💬', agente: 'Laura', tarea: 'Atención al cliente 24/7 configurada y operativa' },
      { emoji: '📈', agente: 'Diana', tarea: 'Auditoría de datos: qué métricas tienes, cuáles faltan' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Primeros leads qualificados + mensajes de outreach' },
    ],
  },
  {
    semana: 'Semana 2',
    emoji: '📊',
    titulo: 'Pipeline + Contenido',
    desc: 'Tu negocio generando y vendiendo.',
    dias: [
      { emoji: '💼', agente: 'Carlos', tarea: '20 leads qualificados para tu negocio' },
      { emoji: '📊', agente: 'Enzo', tarea: '15 posts para Instagram y LinkedIn' },
      { emoji: '💬', agente: 'Laura', tarea: 'Análisis de las 10 dudas más frecuentes → automatización' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Follow-up a leads + cierre de primeros tratos' },
      { emoji: '📈', agente: 'Diana', tarea: 'Dashboard con métricas de tu negocio en tiempo real' },
    ],
  },
  {
    semana: 'Semana 3',
    emoji: '🚀',
    titulo: 'Ventas + Optimización',
    desc: 'Cerramos ventas y mejoramos con datos reales.',
    dias: [
      { emoji: '💼', agente: 'Carlos', tarea: 'Análisis de por qué los leads no cierran → nueva estrategia' },
      { emoji: '⚙️', agente: 'Elena', tarea: 'Automatizaciones: follow-up de leads fríos y carritos' },
      { emoji: '💬', agente: 'Laura', tarea: 'Primer informe de satisfacción de tus clientes' },
      { emoji: '📈', agente: 'Diana', tarea: 'Reporte de retención: quién compra, quién no y por qué' },
      { emoji: '💻', agente: 'Marcos', tarea: 'Mejora de tu web o landing si la tienes' },
    ],
  },
  {
    semana: 'Semana 4',
    emoji: '🎯',
    titulo: 'Growth + Informe Final',
    desc: 'Máquina de acquisition encendida y datos para decidir.',
    dias: [
      { emoji: '📊', agente: 'Enzo', tarea: 'SEO básico: meta tags + estructura de contenido' },
      { emoji: '💼', agente: 'Carlos', tarea: 'Informe completo: leads capturados, ratio de cierre' },
      { emoji: '⚙️', agente: 'Elena', tarea: 'Optimización de automatizaciones según datos reales' },
      { emoji: '📈', agente: 'Diana', tarea: 'Informe final 30 días: antes vs después' },
      { emoji: '🎯', agente: 'Paco', tarea: 'Informe ejecutivo para ti + roadmap para el mes 2' },
    ],
  },
]

const agentes = [
  { emoji: '🎯', nombre: 'Paco', rol: 'Orquestador', color: 'from-gray-800 to-gray-900', desc: 'Coordina el equipo y te reporta cada semana' },
  { emoji: '💬', nombre: 'Laura', rol: 'Atención al Cliente', color: 'from-pink-500 to-rose-600', desc: 'Responsable 24/7 — responde, escala, raccoge feedback' },
  { emoji: '📊', nombre: 'Enzo', rol: 'Marketing', color: 'from-blue-500 to-indigo-600', desc: 'Contenido, ads, SEO — hace crecer tu visibilidad' },
  { emoji: '💼', nombre: 'Carlos', rol: 'Ventas', color: 'from-green-500 to-emerald-600', desc: 'Captación, qualification y cierre de leads' },
  { emoji: '⚙️', nombre: 'Elena', rol: 'Operaciones', color: 'from-orange-500 to-amber-600', desc: 'Automatizaciones y conexión de herramientas' },
  { emoji: '📈', nombre: 'Diana', rol: 'Data', color: 'from-purple-500 to-violet-600', desc: 'Métricas, dashboards, análisis de retención' },
  { emoji: '💻', nombre: 'Marcos', rol: 'Desarrollo', color: 'from-cyan-500 to-teal-600', desc: 'Tu web, landing y e-commerce siempre actualizadas' },
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
            El primer mes es intensivo. Tus Compis trabajan en paralelo para tener tu negocio automatizado, metricado y generando ventas.
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
                  <div key={di} className="bg-white rounded-xl p-3 border border-gray-100">
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
            Negocio automatizado, metricado y con pipeline de ventas activo
          </h3>
          <p className="text-sm text-white/60 max-w-[480px] mx-auto">
            Cada Compi sabe lo que tiene que hacer. Tú solo recibes resultados. A partir del mes 2, el equipo funciona en piloto automático.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {['~25 tareas ejecutadas', '7 Compis trabajando', 'Dashboard con métricas', 'Pipeline de ventas activo'].map(r => (
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
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl shadow-lg mx-auto mb-2`}>
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
