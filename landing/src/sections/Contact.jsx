import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <section id="contacto" className="bg-brand-bg-section border-t border-brand-border py-16 md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-start">
          <div>
            <h2 className="text-[22px] md:text-[clamp(28px,3vw,40px)] font-bold tracking-tight text-brand-text mb-3 md:mb-4">No reemplaces, complementa</h2>
            <p className="text-sm md:text-base text-brand-secondary leading-relaxed mb-2 md:mb-3">Profesionales Agénticos que elevan el potencial de tu equipo. Empieza hoy.</p>
            <p className="text-sm md:text-base text-brand-secondary leading-relaxed mb-3 md:mb-3">¿Hablamos de tu proyecto?</p>
            <p className="text-base md:text-lg font-bold text-brand-text">hola@mycompi.com</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] md:text-xs font-semibold text-brand-secondary">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm md:text-[15px] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text transition-colors font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] md:text-xs font-semibold text-brand-secondary">Email</label>
              <input
                type="email"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm md:text-[15px] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text transition-colors font-sans"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] md:text-xs font-semibold text-brand-secondary">Mensaje</label>
              <textarea
                rows="4"
                placeholder="Cuéntanos tu proyecto..."
                value={form.mensaje}
                onChange={e => setForm({ ...form, mensaje: e.target.value })}
                className="bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm md:text-[15px] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-text transition-colors font-sans resize-y"
              />
            </div>
            <button
              type="submit"
              className="bg-brand-yellow text-brand-text font-bold text-sm md:text-[15px] px-6 md:px-7 py-3 md:py-3.5 rounded-xl hover:bg-brand-yellow-dark transition-all self-start hover:shadow-md mt-2"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
