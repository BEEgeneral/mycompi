import Navbar from '../components/Navbar'
import Footer from '../sections/Footer'

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="pt-[90px] pb-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-[28px] md:text-3xl font-extrabold text-brand-dark mb-2">Aviso Legal</h1>
          <p className="text-xs text-gray-500 mb-8">Última actualización: marzo 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-gray-600">

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">1. Información general</h2>
              <p>En cumplimiento con el artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se exponen los siguientes datos identificativos del titular de la plataforma MyCompi:</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">2. Titular</h2>
              <p>
                <strong>BeeNoCode S.L.</strong><br />
                CIF: B-XXXXXXX<br />
                Domicilio social: España<br />
                Actividad: Desarrollo y comercialización de software SaaS<br />
                Email: <strong>paco@mycompi.com</strong><br />
                Web: <strong>mycompi.onrender.com</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">3. Objeto</h2>
              <p>MyCompi es una plataforma tecnológica SaaS que proporciona acceso a un equipo de Compis agénticos — agentes de inteligencia artificial especializados en distintas áreas — que trabajan de forma autónoma para el negocio del cliente contratante.</p>
              <p>El presente aviso legal regula las condiciones de uso del sitio web mycompi.onrender.com (en adelante, el "Sitio Web").</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">4. Condiciones de uso del Sitio Web</h2>
              <p>La utilización del Sitio Web otorga la condición de Usuario del mismo e implica la aceptación plena de las condiciones presentes en este Aviso Legal. El Usuario se compromete a utilizar el Sitio Web y sus servicios conforme a:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>La legislación vigente aplicable</li>
                <li>Los presentes términos y condiciones</li>
                <li>La moral, buenas costumbres y orden público</li>
              </ul>
              <p>Queda prohibido el uso del Sitio Web con fines ilícitos, lesivos de derechos o intereses de terceros, o que puedan dañar, inutilizar o deteriorar el Sitio Web o impedir su normal disfrute.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">5. Propiedad intelectual e industrial</h2>
              <p>BeeNoCode S.L. es titular de todos los derechos de propiedad intelectual e industrial del Sitio Web, incluyendo pero no limitándose a: el nombre de dominio mycompi.onrender.com, el software, los textos, diseños gráficos, logotipos, combinaciones de colores, estructura de navegación, bases de datos, y cualquier otro elemento que lo compone.</p>
              <p>Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación total o parcial del contenido del Sitio Web sin autorización expresa de BeeNoCode S.L. El Usuario reconoce que la infringe quien, sin autorización, reproduzca, distribuya o comunique públicamente los contenidos del Sitio Web.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">6. Exclusión de responsabilidad</h2>
              <p>BeeNoCode S.L. no garantiza la inexistencia de errores en el acceso al Sitio Web, ni en sus contenidos. En caso de detectarse, se procederán a subsanar dichos errores a la mayor brevedad posible.</p>
              <p>BeeNoCode S.L. no se hace responsable de los daños y perjuicios derivados de:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Interferencias, interrupciones, fallos, omisiones, averías telefónicas, retrasos, bloqueos o desconexiones en el funcionamiento del sistema electrónico motivadas por deficiencias, sobrecargas o errores en las líneas de telecomunicaciones o en servicios de alojamiento web.</li>
                <li>Intromisiones ilegítimas mediante el uso de programas malignos de cualquier tipo.</li>
                <li>Utilisation indebite o inadecuada del Sitio Web por parte de los Usuarios.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">7. Protección de datos de carácter personal</h2>
              <p>Los datos personales que el Usuario facilite a través del Sitio Web serán tratados conforme a lo expuesto en la <a href="#/privacidad" className="text-blue-600 underline">Política de Privacidad</a>.</p>
              <p>En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), BeeNoCode S.L. informa a los Usuarios de que dispone de un Registro de Actividades de Tratamiento documentado.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">8. Cookies</h2>
              <p>El uso de cookies en el Sitio Web se rige por lo establecido en la <a href="#/cookies" className="text-blue-600 underline">Política de Cookies</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">9. Ley aplicable y jurisdicción</h2>
              <p>El presente Aviso Legal se interpreta y rige conforme a la legislación española. Para cualquier controversia derivada del uso del Sitio Web, las partes se someten a los Juzgados y Tribunales de Madrid (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-brand-dark mb-2">10. Contacto</h2>
              <p>Para cualquier cuestión relativa al presente Aviso Legal, puede contactar con BeeNoCode S.L. en:</p>
              <p>Email: <strong>paco@mycompi.com</strong></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
