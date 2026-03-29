import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Stats from './sections/Stats'
import Services from './sections/Services'
import Pricing from './sections/Pricing'
import TeamPresentation from './sections/TeamPresentation'
import QueHacen from './sections/QueHacen'
import Testimonials from './sections/Testimonials'
import FAQ from './sections/FAQ'
import Contact from './sections/Contact'
import Hiring from './sections/Hiring'
import Footer from './sections/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Activar from './pages/Activar'
import Recuperar from './pages/Recuperar'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'

function HomePage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Pricing />
        <TeamPresentation />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contratacion" element={<Hiring />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activar" element={<Activar />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </HashRouter>
  )
}
