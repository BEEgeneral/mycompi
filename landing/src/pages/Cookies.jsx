import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

export default function Cookies() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="pt-[90px] pb-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-[28px] md:text-3xl font-extrabold text-brand-dark mb-2">Política de Cookies</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">1. ¿Qué son las cookies?</h2>
              <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, móvil, tablet) cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen correctamente, proporcionar una mejor experiencia de usuario, y ofrecer información analítica a los propietarios del sitio.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">2. Tipos de cookies que usamos</h2>
              <p>En MyCompi utilizamos exclusivamente <strong>cookies técnicas y funcionales</strong>. No utilizamos cookies de publicidad, ni cookies de terceros con fines de tracking o perfilado.</p>

              <table className="w-full text-xs border-collapse mt-3 mb-4">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-bold text-brand-dark">Cookie</th>
                    <th className="text-left py-2 font-bold text-brand-dark">Tipo</th>
                    <th className="text-left py-2 font-bold text-brand-dark">Finalidad</th>
                    <th className="text-left py-2 font-bold text-brand-dark">Duración</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    ['session_id', 'Técnica', 'Mantiene tu sesión activa en la plataforma', 'Sesión'],
                    ['auth_token', 'Funcional', 'Recuerda tu login para no pedir credenciales en cada visita', '30 días'],
                    ['csrf_token', 'Técnica', 'Protección contra ataques CSRF', 'Sesión'],
                    ['cookies_consent', 'Funcional', 'Guarda tu preferencia sobre el uso de cookies', '1 año'],
                  ].map(([name, type, purpose, duration], i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 font-mono text-[10px]">{name}</td>
                      <td className="py-2">{type}</td>
                      <td className="py-2">{purpose}</td>
                      <td className="py-2">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">3. Cookies de terceros</h2>
              <p>Utilizamos servicios de terceros que pueden instalar cookies en tu dispositivo:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stripe</strong> — para el proceso de pago. <a href="https://stripe.com/cookies" className="text-blue-600 underline" target="_blank" rel="noopener">Ver política de cookies de Stripe</a>.</li>
                <li><strong>Google Fonts</strong> — para cargar fuentes tipográficas. Estas cookies se usan para distinguir usuarios únicos y se consideran cookies funcionales.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">4. ¿Cómo gestionar o desactivar cookies?</h2>
              <p>Puedes configurar tu navegador para que rechace todas las cookies o para que te avise cada vez que se intenta instalar una. Ten en cuenta que si desactivas las cookies, algunas funcionalidades de la plataforma pueden dejar de funcionar correctamente.</p>
              <p className="mt-2">Puedes gestionar tus preferencias de cookies desde el banner que aparece en tu primera visita, o en cualquier momento borrando las cookies de mycompi.onrender.com en la configuración de tu navegador.</p>
              <p className="mt-2">Instrucciones para los principales navegadores:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-blue-600 underline" target="_blank" rel="noopener">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/es/kb/Borrar%20cookies" className="text-blue-600 underline" target="_blank" rel="noopener">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" className="text-blue-600 underline" target="_blank" rel="noopener">Safari</a></li>
                <li><a href="https://support.microsoft.com/es-es/windows/microsoft-edge-datos-de-exploraci%C3%B3n-y-privacidad-bb8174ba-9cfd-4aa3-c14d-cf1ba1a55e03" className="text-blue-600 underline" target="_blank" rel="noopener">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">5. Consentimiento</h2>
              <p>Al visitar MyCompi por primera vez, se muestra un banner informativo sobre el uso de cookies. Al continuar navegando o al hacer clic en "Aceptar", consientes el uso de las cookies descritas en esta política.</p>
              <p>Puedes retirar tu consentimiento en cualquier momento borrando las cookies desde tu navegador.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">6. Más información</h2>
              <p>Para cualquier duda sobre nuestra política de cookies, contacta con nosotros en <strong>paco@mycompi.com</strong>.</p>
              <p>Puedes consultar más información sobre cookies en: <a href="https://www.allaboutcookies.org/es/" className="text-blue-600 underline" target="_blank" rel="noopener">www.allaboutcookies.org</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
