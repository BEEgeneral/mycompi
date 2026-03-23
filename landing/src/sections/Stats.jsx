export default function Stats() {
  const stats = [
    { num: '62%', label: 'Mejora en procesos' },
    { num: '200+', label: 'Casos de éxito' },
    { num: '150+', label: 'Clientes recurrentes' },
    { num: '1349+', label: '5 Star Reviews' },
  ]

  return (
    <section className="bg-brand-bg-section border-t border-b border-brand-border py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10 grid grid-cols-4 gap-8">
        {stats.map(s => (
          <div key={s.label} className="text-center">
            <div className="text-[52px] font-extrabold tracking-tight text-brand-text leading-none">{s.num}</div>
            <div className="text-sm text-brand-muted mt-2 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
