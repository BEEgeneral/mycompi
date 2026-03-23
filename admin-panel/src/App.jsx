import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import AgentDetail from './components/AgentDetail'
import WelcomeState from './components/WelcomeState'

const API = ''

export default function App() {
  const [ownerKey, setOwnerKey] = useState(() => localStorage.getItem('mycompi_owner_key') || '')
  const [agentes, setAgentes] = useState([])
  const [agenteActual, setAgenteActual] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)

  const apiCall = useCallback(async (url, options = {}) => {
    const headers = {
      'X-Owner-Key': ownerKey,
      'Content-Type': 'application/json',
      ...options.headers,
    }
    const res = await fetch(API + url, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error de API')
    return data
  }, [ownerKey])

  const conectar = async () => {
    if (!ownerKey) return
    localStorage.setItem('mycompi_owner_key', ownerKey)
    setLoading(true)
    setError('')
    try {
      const data = await apiCall('/api/admin/agentes')
      setAgentes(data.agentes)
      setConnected(true)
    } catch (err) {
      setError(err.message)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ownerKey) conectar()
  }, [])

  const seleccionarAgente = async (id) => {
    setLoading(true)
    try {
      const data = await apiCall(`/api/admin/agentes/${id}`)
      setAgenteActual({ ...data.agente, archivos: data.agente.archivos })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const recargar = () => {
    if (agenteActual) seleccionarAgente(agenteActual.id)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="h-[72px] flex items-center px-8 bg-white border-b border-gray-200 sticky top-0 z-50">
        <a href="/" className="h-9">
          <img src="/assets/logo.png" alt="MyCompi" className="h-full" />
        </a>
        <div className="flex-1 flex justify-center items-center gap-2">
          <input
            type="password"
            value={ownerKey}
            onChange={e => setOwnerKey(e.target.value)}
            placeholder="Owner Key..."
            className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm w-56 focus:outline-none focus:border-primary"
          />
          <button
            onClick={conectar}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            Conectar
          </button>
        </div>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 text-sm font-medium">
          Error: {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-primary">Dashboard de Agentes</h1>
          <p className="text-sm text-text-muted mt-1">Selecciona un agente para ver y editar sus archivos de configuración.</p>
        </div>

        <div className="grid grid-cols-[300px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <Sidebar
            agentes={agentes}
            agenteActual={agenteActual}
            onSelect={seleccionarAgente}
            loading={loading}
            connected={connected}
          />

          {/* Content */}
          {agenteActual ? (
            <AgentDetail
              agente={agenteActual}
              apiCall={apiCall}
              onRecargar={recargar}
            />
          ) : (
            <WelcomeState connected={connected} loading={loading} />
          )}
        </div>
      </div>
    </div>
  )
}
