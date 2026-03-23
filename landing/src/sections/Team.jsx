const miembros = [
  { img: '/assets/mia.jpg', nombre: 'Enzo Herrera', rol: 'Marketing', radius: '70px' },
  { img: '/assets/victor.jpg', nombre: 'Carlos Mendoza', rol: 'Ventas', radius: '100px' },
  { img: '/assets/alex.jpg', nombre: 'Laura Montes', rol: 'Atención al Cliente', radius: '130px' },
  { img: '/assets/marta.jpg', nombre: 'Elena Ortega', rol: 'Operaciones', radius: '140px' },
  { img: '/assets/alan.jpg', nombre: 'Diana Palau', rol: 'Data Growth', radius: '140px' },
]

export default function Team() {
  return (
    <section id="equipo" className="bg-brand-bg-section border-t border-b border-brand-border py-[100px]">
      <div className="max-w-[1200px] mx-auto px-10">
        <div className="text-center mb-[60px]">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-yellow mb-3">Tu equipo de agentes</p>
          <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text mb-3">5 agentes especializados trabajando para ti</h2>
          <p className="text-base text-brand-secondary max-w-[560px] mx-auto">Cada agente es un experto en su área. Coordínalos como un equipo real.</p>
        </div>
        <div className="grid grid-cols-5 gap-6">
          {miembros.map(m => (
            <div key={m.nombre} className="text-center">
              <img
                src={m.img}
                alt={m.nombre}
                className="w-full aspect-square object-cover mb-3.5 border-2 border-brand-border hover:border-brand-yellow transition-colors"
                style={{ borderRadius: m.radius }}
              />
              <h4 className="text-[13px] font-bold text-brand-text">{m.nombre}</h4>
              <p className="text-[11px] text-brand-muted mt-1 uppercase tracking-wide font-semibold">{m.rol}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
