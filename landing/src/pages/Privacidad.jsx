import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="pt-[90px] pb-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-[28px] md:text-3xl font-extrabold text-brand-dark mb-2">Política de Privacidad</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">1. Responsable del tratamiento</h2>
              <p>BeeNoCode S.L. (en adelante, "MyCompi"), con CIF B-XXXXXXX y domicilio en España, es el responsable del tratamiento de los datos personales que nos proporcionas a través de la plataforma web mycompi.onrender.com.</p>
              <p>Email de contacto: <strong>paco@mycompi.com</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">2. Datos que recopilamos</h2>
              <p>Recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de registro:</strong> nombre, dirección de correo electrónico, contraseña (hashada), empresa, sector.</li>
                <li><strong>Datos de pago:</strong> procesamos datos de tarjeta a través de Stripe. No almacenamos datos de tarjeta en nuestros servidores.</li>
                <li><strong>Datos de uso:</strong> interacciones con el chat, tareas ejecutadas por los Compis, métricas de actividad.</li>
                <li><strong>Datos de navegación:</strong> IP, navegador, dispositivo, páginas visitadas (a través de cookies técnicas).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">3. Finalidad del tratamiento</h2>
              <p>Utilizamos tus datos para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prestar el servicio SaaS contratado (base legal: ejecución del contrato).</li>
                <li>Enviar emails transaccionales: bienvenida, recuperación de contraseña, notificaciones de los Compis (base legal: ejecución del contrato).</li>
                <li>Mejorar el servicio y realizar analítica agregada (base legal: interés legítimo).</li>
                <li>Enviar comunicaciones comerciales, solo si has dado tu consentimiento explícito.</li>
                <li>Cumplir obligaciones legales (facturación, prevención de fraude).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">4. Base legal</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Ejecución del contrato:</strong> prestación del servicio, gestión de cuenta, facturación.</li>
                <li><strong>Consentimiento:</strong> comunicaciones comerciales electrónicas.</li>
                <li><strong>Interés legítimo:</strong> mejora del servicio, seguridad, prevención de fraude.</li>
                <li><strong>Cumplimiento legal:</strong> obligaciones fiscales y contables.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">5. Destinatarios de los datos</h2>
              <p>Tus datos pueden ser comunicados a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stripe</strong> (procesador de pagos) — para la gestión de cobros. <a href="https://stripe.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener">Política de privacidad de Stripe</a>.</li>
                <li><strong>Neon (NeonDB)</strong> — proveedor de base de datos PostgreSQL. <a href="https://neon.tech/privacy" className="text-blue-600 underline" target="_blank" rel="noopener">Política de privacidad de Neon</a>.</li>
                <li><strong>Resend</strong> — proveedor de email transaccional. <a href="https://resend.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener">Política de privacidad de Resend</a>.</li>
                <li><strong>Autoridades competentes</strong> cuando exista obligación legal.</li>
              </ul>
              <p className="mt-2">No vendemos ni cedemos tus datos personales a terceros para fines publicitarios.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">6. Transferencias internacionales</h2>
              <p>Algunos de nuestros proveedores (Stripe, Resend, Neon) pueden transferir datos fuera del Espacio Económico Europeo (EEE). En tales casos, garantizamos que dichas transferencias se realizan bajo cláusulas contractuales tipo aprobadas por la Comisión Europea o bajo el EU-US Data Privacy Framework.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">7. Plazo de conservación</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa y hasta 3 años después del cierre.</li>
                <li><strong>Datos de facturación:</strong> conservados durante 6 años según obligación fiscal.</li>
                <li><strong>Datos de uso (chat):</strong> hasta 1 año después del cierre de cuenta.</li>
                <li><strong>Comunicaciones comerciales:</strong> hasta que retires el consentimiento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">8. Tus derechos</h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Acceso:</strong> saber qué datos tenemos tuyos.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                <li><strong>Supresión:</strong> solicitar la eliminación de tus datos (salvo obligación legal).</li>
                <li><strong>Limitación:</strong> restringir el tratamiento en ciertos casos.</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
                <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
                <li><strong>Revocación:</strong> retirar consentimiento en cualquier momento.</li>
              </ul>
              <p className="mt-2">Para ejercer tus derechos, escribe a <strong>paco@mycompi.com</strong>. Responderemos en un máximo de 30 días.</p>
              <p className="mt-2">También tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" className="text-blue-600 underline" target="_blank" rel="noopener">www.aepd.es</a></p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">9. Seguridad</h2>
              <p>Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración: cifrado en tránsito (TLS), hash de contraseñas con bcrypt, acceso restringido a personal autorizado, y monitorización continua.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">10. Cambios en esta política</h2>
              <p>Podremos actualizar esta política periódicamente. Los cambios se publicarán en esta misma página con fecha de "Última actualización" actualizada. Si los cambios son significativos, te notificaremos por email a la dirección asociada a tu cuenta.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
