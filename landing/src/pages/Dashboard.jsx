import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mycompi_token')
    const saved = localStorage.getItem('mycompi_usuario')
    if (!token) {
      navigate('/login')
      return
    }
    if (saved) {
      setUsuario(JSON.parse(saved))
    }
    setLoading(false)
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('mycompi_token')
    localStorage.removeItem('mycompi_usuario')
    navigate('/login')
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-6 pt-[100px] pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-text">
              Hola, {usuario?.nombre || 'Usuario'}
            </h1>
            <p className="text-sm text-brand-secondary mt-1">
              Bienvenido a tu panel de control
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-brand-secondary hover:text-brand-text border border-brand-border px-4 py-2 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Plan badge */}
        <div className="bg-brand-yellow/10 border border-brand-yellow rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-1">Tu plan</div>
              <div className="text-xl font-extrabold text-brand-text">
                {usuario?.cliente?.plan || 'EQUIPO'} —{' '}
                <span className="text-brand-yellow">€49/mes</span>
              </div>
            </div>
            <a
              href="#"
              className="bg-brand-yellow text-brand-text font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-yellow-dark transition-all"
            >
              Gestionar plan
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Agentes activos', value: '6', icon: '🤖' },
            { label: 'Conversaciones', value: '142', icon: '💬' },
            { label: 'Tokens usados', value: '28K', icon: '⚡' },
            { label: 'Costo mensual', value: '€23.4', icon: '💰' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-brand-border rounded-xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-extrabold text-brand-text">{s.value}</div>
              <div className="text-xs text-brand-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tu equipo agéntico */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-brand-text mb-4">Tu equipo agéntico</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { nombre: 'Laura Montes', rol: 'Atención al Cliente', emoji: '💬', estado: 'Activo' },
              { nombre: 'Enzo Herrera', rol: 'Marketing', emoji: '📊', estado: 'Activo' },
              { nombre: 'Carlos Mendoza', rol: 'Ventas', emoji: '💼', estado: 'Activo' },
              { nombre: 'Elena Ortega', rol: 'Operaciones', emoji: '⚙️', estado: 'Descansando' },
              { nombre: 'Diana Palau', rol: 'Data & Growth', emoji: '📈', estado: 'Activo' },
              { nombre: 'Alberto Gala', rol: 'Desarrollo', emoji: '💻', estado: 'Activo' },
            ].map(a => (
              <div key={a.nombre} className="bg-white border border-brand-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-bg-section rounded-xl flex items-center justify-center text-xl">
                    {a.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-brand-text">{a.nombre}</div>
                    <div className="text-xs text-brand-secondary">{a.rol}</div>
                  </div>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                  a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {a.estado}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-lg font-bold text-brand-text mb-4">Actividad reciente</h2>
          <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
            {[
              { text: 'Laura respondió a 12 conversaciones', time: 'Hace 5 min', icon: '💬' },
              { text: 'Enzo generó informe de marketing semanal', time: 'Hace 2h', icon: '📊' },
              { text: 'Diana procesó 34 leads nuevos', time: 'Hace 5h', icon: '📈' },
              { text: 'Carlos cerró 3 deals por €2.400', time: 'Ayer', icon: '💼' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-brand-border' : ''}`}>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="text-sm text-brand-text font-medium">{item.text}</div>
                  <div className="text-xs text-brand-muted">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
