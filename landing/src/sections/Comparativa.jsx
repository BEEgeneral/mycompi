export default function Comparativa() {
  return (
    <section className="bg-brand-dark py-16 md:py-[90px]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-10">
        {/* Claim principal */}
        <div className="text-center mb-12 md:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">La diferencia</p>
          <h2 className="text-[22px] md:text-[clamp(28px,3vw,44px)] font-extrabold tracking-tight text-white leading-tight mb-4">
            7 profesionales IA por el precio<br className="hidden md:block" /> de un junior{' '}
            <span className="text-brand-yellow">que trabaja 24/7</span>
          </h2>
          <p className="text-sm text-white/60 max-w-[520px] mx-auto">
            Un empleado mínimo en España cuesta 1.400€/mes + cuotas. Con MyCompi tienes 7 profesionales especializados trabajando simultáneamente.
          </p>
        </div>

        {/* Comparativa visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Alternativa tradicional */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">La alternativa tradicional</div>
            <div className="space-y-3">
              {[
                { rol: 'Atención al cliente', coste: '1.400€/mes' },
                { rol: 'Comercial / Ventas', coste: '1.600€/mes' },
                { rol: 'Marketing digital', coste: '1.800€/mes' },
                { rol: 'Admin / Operaciones', coste: '1.400€/mes' },
                { rol: 'Desarrollador web', coste: '2.200€/mes' },
                { rol: 'Data Analyst', coste: '1.900€/mes' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-sm text-white/70">{item.rol}</span>
                  <span className="text-sm font-bold text-white/40">{item.coste}</span>
                </div>
              ))}
              <div className="pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Total mensual</span>
                  <span className="font-extrabold text-red-400 text-lg">~10.300€/mes</span>
                </div>
                <p className="text-[10px] text-white/30 mt-1">Sin contar Seguridad Social, vacaciones, bajas, formación</p>
              </div>
            </div>
          </div>

          {/* MyCompi */}
          <div className="bg-brand-yellow/10 border-2 border-brand-yellow rounded-3xl p-7">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-yellow mb-4">Con MyCompi</div>
            <div className="space-y-3">
              {[
                { rol: 'Laura — Atención al Cliente', tareas: 'Responde 24/7, escala cuando necesario' },
                { rol: 'Carlos — Ventas', tareas: 'Captación, follow-up, cierre' },
                { rol: 'Enzo — Marketing', tareas: 'Contenido, ads, SEO' },
                { rol: 'Elena — Operaciones', tareas: 'Automatizaciones, procesos' },
                { rol: 'Diana — Data', tareas: 'Métricas, dashboards, análisis' },
                { rol: 'Marcos — Desarrollo', tareas: 'Web, landing, e-commerce' },
                { rol: 'Paco — Director', tareas: 'Coordina y te reporta cada semana' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start border-b border-brand-yellow/10 pb-3">
                  <div>
                    <span className="text-sm font-semibold text-brand-dark">{item.rol}</span>
                    <p className="text-[10px] text-brand-dark/60 mt-0.5">{item.tareas}</p>
                  </div>
                  <span className="text-brand-yellow text-sm ml-2 flex-shrink-0">✓</span>
                </div>
              ))}
              <div className="pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-dark">Total mensual</span>
                  <span className="font-extrabold text-brand-dark text-lg">49€/mes</span>
                </div>
                <p className="text-[10px] text-brand-dark/50 mt-1">Sin sorpresas. Cancela cuando quieras.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="text-center">
          <p className="text-white/50 text-xs mb-4">7 Compis agénticos vs 6 empleados = diferencia de <span className="text-red-400 font-bold">~10.250€/mes</span> a tu favor</p>
          <a
            href="/#/checkout"
            className="inline-block bg-brand-yellow text-brand-dark font-bold text-sm px-10 py-4 rounded-pill hover:bg-white transition-all shadow-lg"
          >
            Contratar mi equipo — 49€/mes →
          </a>
        </div>
      </div>
    </section>
  )
}
