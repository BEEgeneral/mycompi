export default function Stats() {
  const stats = [
    { num: '80%', label: 'Reducción de costes operativos', sub: 'vs. contratar personal' },
    { num: '24/7', label: 'Disponibilidad total', sub: 'Sin vacaciones ni bajas' },
    { num: '<24h', label: 'Primer profesional operativo', sub: 'Sin implementación' },
    { num: '100%', label: 'Escalabilidad', sub: 'Crece con tu negocio' },
  ]

  return (
    <section className="bg-brand-dark py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="text-center mb-8">
          <p className="text-brand-yellow text-xs font-bold uppercase tracking-widest mb-2">Por qué MyCompi</p>
          <h2 className="text-white text-xl md:text-2xl font-extrabold">Resultados que impactan tu negocio</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl md:text-[52px] font-extrabold tracking-tight text-brand-yellow leading-none">{s.num}</div>
              <div className="text-white font-bold text-sm mt-2">{s.label}</div>
              <div className="text-white/50 text-xs mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
