import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

export default function Terminos() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="pt-[90px] pb-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-[28px] md:text-3xl font-extrabold text-brand-dark mb-2">Términos y Condiciones</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">1. Información general</h2>
              <p>Los presentes términos y condiciones (en adelante, "Términos") regulan la relación entre BeeNoCode S.L. (en adelante, "MyCompi", "nosotros") y cualquier persona física o jurídica que contrate los servicios ofrecidos a través de la plataforma web mycompi.onrender.com (en adelante, el "Servicio").</p>
              <p>Al contratar cualquier plan de MyCompi, aceptas expresamente estos Términos en su totalidad. Si no estás de acuerdo con alguno de ellos, no deberías contratar el Servicio.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">2. Descripción del servicio</h2>
              <p>MyCompi es una plataforma SaaS que proporciona acceso a un equipo de Compis agénticos — agentes de inteligencia artificial especializados en distintas áreas (atención al cliente, marketing, ventas, operaciones, análisis de datos y desarrollo web) — que trabajan de forma autónoma para el negocio del cliente.</p>
              <p>MyCompi actúa como plataforma tecnológica. Los Compis son herramientas de inteligencia artificial y no son empleados, representantes ni agentes legales del cliente ni de MyCompi.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">3. Registro y cuenta</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Para contratar el Servicio debes registrarte proporcionando información veraz, completa y actualizada.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Toda actividad bajo tu cuenta es tu responsabilidad.</li>
                <li>Debes ser mayor de 18 años y tener capacidad legal para celebrar contratos.</li>
                <li>MyCompi se reserva el derecho de suspender o cancelar cuentas que infrinjan estos Términos o que se utilicen para fines ilícitos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">4. Planes y precios</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Los precios vigentes aparecen en mycompi.onrender.com y se cobran mensualmente en euros (€).</li>
                <li>El precio incluye todos los impuestos aplicables (IVA).</li>
                <li>Todos los planes se renuevan automáticamente mes a mes salvo cancelación expresa.</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de cuenta. La cancelación se hará efectiva al final del período de facturación en curso.</li>
                <li>No hay permanencias ni compromisos a largo plazo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">5. Pago</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Los pagos se procesan a través de Stripe, nuestro procesador de pagos externo. Al contratar aceptas las <a href="https://stripe.com/ssa" className="text-blue-600 underline" target="_blank" rel="noopener">condiciones de Stripe</a>.</li>
                <li>Si un pago no se puede procesar (tarjeta declinada, fondos insuficientes), MyCompi intentará cobro de nuevo en los 3 días siguientes. Si no se resuelve, la cuenta quedará suspendida.</li>
                <li>Los precios pueden modificarse en cualquier momento. Los cambios se aplicarán a partir del siguiente ciclo de facturación y se comunicarán con al menos 15 días de antelación.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">6. Uso aceptable</h2>
              <p>Te comprometes a usar MyCompi de forma lícita y conforme a estos Términos. Queda prohibido:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Usar el Servicio para任何违法违规活动, incluyendo pero no limitado a fraude, phishing, distribución de malware o spam.</li>
                <li>Utilizar los Compis para generar contenido ilegal, difamatorio, discriminatorio o que infrinja derechos de terceros.</li>
                <li>Realizar ingeniería inversa, descompilar o acceder al código fuente de la plataforma.</li>
                <li>Revender, redistribuir o ceder el acceso al Servicio sin autorización escrita de MyCompi.</li>
                <li>Usar el Servicio para procesar datos personales de terceros sin cumplir con el RGPD.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">7. Propiedad intelectual</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>MyCompi y todos sus componentes (código, diseño, logos, nombres comerciales) son propiedad de BeeNoCode S.L. y están protegidos por la normativa de propiedad intelectual española y europea.</li>
                <li>El contenido que los Compis generen para ti durante la prestación del Servicio te pertenece, con la excepción de los modelos underlying de IA y la infraestructura de MyCompi.</li>
                <li>Nos reservamos el derecho a usar contenido agregado y anónimo derivado del uso del Servicio para mejorar nuestros productos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">8. Limitación de responsabilidad</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>MyCompi se esforzará por prestar el Servicio con la mayor calidad posible. No garantizamos que los Compisproduzcan resultados específicos, ya que dependen de los inputs del cliente y de la naturaleza de las tareas.</li>
                <li>MyCompi no será responsable de pérdidas indirectas, consecuenciales o por lucro cesante, salvo en caso de dolo o negligencia grave.</li>
                <li>La responsabilidad total de MyCompi en cualquier circunstancia no excederá el importe total abonado por el cliente en los 12 meses anteriores al hecho causante.</li>
                <li>Quedan excluidas las pérdidas derivadas de: (i) fallos en equipos o comunicaciones del cliente, (ii) configuraciones o instrucciones incorrectas proporcionadas por el cliente, (iii) fuerza mayor según se define en la legislación española.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">9. Garantías y soporte</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>MyCompi se compromete a mantener la plataforma operativa el mayor tiempo posible. No garantizamos disponibilidad del 100% (SLA). Los unplanned downtime se comunican cuando son detectables.</li>
                <li>El soporte técnico se presta por email a través de paco@mycompi.com.</li>
                <li>Los Compis funcionan de forma autónoma. MyCompi no interviene en las decisiones que los Compis toman basándose en las instrucciones del cliente.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">10. Modificaciones del servicio y Términos</h2>
              <p>MyCompi puede modificar las características del Servicio o estos Términos en cualquier momento. Los cambios sustanciales se comunicarán con al menos 15 días de antelación por email o mediante aviso en la plataforma. El uso continuado tras la notificación se considerará aceptación.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">11. Cancelación y baja</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de cuenta o escribiendo a paco@mycompi.com.</li>
                <li>La cancelación surte efecto al final del período de facturación en curso. No hay reembolsos parciales.</li>
                <li>Tras la baja, tu cuenta y datos se eliminarán en un plazo máximo de 30 días, salvo obligación legal de conservación (facturación: 6 años).</li>
                <li>MyCompi puede darte de baja de forma inmediata si incumples estos Términos o la legislación aplicable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">12. Ley aplicable y jurisdicción</h2>
              <p>Estos Términos se rigen por la legislación española. Para cualquier controversia derivada de estos Términos o del uso del Servicio, ambas partes se someten expresamente a los Juzgados y Tribunales de la ciudad de Madrid (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">13. Información de la empresa</h2>
              <p>
                <strong>BeeNoCode S.L.</strong><br />
                CIF: B-XXXXXXX<br />
                Domicilio: España<br />
                Email: paco@mycompi.com<br />
                Web: mycompi.onrender.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
