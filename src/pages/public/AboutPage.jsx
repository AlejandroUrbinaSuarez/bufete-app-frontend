import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Sobre Nosotros | {SITE_NAME}</title>
        <meta name="description" content={`Conozca la historia, misión y valores de ${SITE_NAME}. Más de 20 años brindando servicios legales de excelencia.`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Sobre Nosotros</h1>
            <p className="text-xl text-gray-300">
              Más de dos décadas comprometidos con la excelencia legal
              y la defensa de los derechos de nuestros clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="container-custom">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-900 font-medium">Sobre Nosotros</span>
          </nav>
        </div>
      </div>

      {/* Historia */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold-600 font-medium mb-2 block">Nuestra Historia</span>
              <h2 className="mb-6">Una trayectoria de éxito y compromiso</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  {SITE_NAME} fue fundado con la visión de brindar servicios legales de la más alta
                  calidad, accesibles para todos. Desde nuestros inicios, nos hemos distinguido por
                  un enfoque personalizado y un compromiso inquebrantable con los intereses de nuestros clientes.
                </p>
                <p>
                  A lo largo de más de 20 años, hemos construido una reputación basada en resultados,
                  integridad y profesionalismo. Nuestro equipo ha crecido para incluir especialistas
                  en diversas áreas del derecho, permitiéndonos ofrecer soluciones integrales.
                </p>
                <p>
                  Hoy, continuamos innovando y adaptándonos a las necesidades cambiantes de nuestros
                  clientes, sin perder de vista los valores fundamentales que nos han llevado al éxito.
                </p>
              </div>
            </div>
            <div className="bg-primary-900 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4">
                  <div className="text-4xl font-heading font-bold text-gold-400 mb-2">20+</div>
                  <div className="text-gray-300 text-sm">Años de experiencia</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-heading font-bold text-gold-400 mb-2">5000+</div>
                  <div className="text-gray-300 text-sm">Casos resueltos</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-heading font-bold text-gold-400 mb-2">98%</div>
                  <div className="text-gray-300 text-sm">Clientes satisfechos</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl font-heading font-bold text-gold-400 mb-2">15+</div>
                  <div className="text-gray-300 text-sm">Profesionales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl mb-4">Nuestra Misión</h3>
              <p className="text-gray-600">
                Brindar servicios legales de excelencia, defendiendo los derechos e intereses
                de nuestros clientes con integridad, profesionalismo y compromiso absoluto
                con la justicia.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🔭</span>
              </div>
              <h3 className="text-xl mb-4">Nuestra Visión</h3>
              <p className="text-gray-600">
                Ser reconocidos como el bufete de abogados de referencia, destacando por
                nuestra excelencia profesional, innovación en servicios legales y el
                impacto positivo en la vida de nuestros clientes.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl mb-4">Nuestros Valores</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-gold-500">•</span> Integridad y ética profesional
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold-500">•</span> Compromiso con el cliente
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold-500">•</span> Excelencia en el servicio
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gold-500">•</span> Transparencia y honestidad
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="section">
        <div className="container-custom">
          <div className="section-title">
            <h2>¿Por qué elegirnos?</h2>
            <div className="divider-gold"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-600 text-2xl">✓</span>
              </div>
              <h4 className="mb-2">Experiencia</h4>
              <p className="text-gray-600 text-sm">
                Más de 20 años resolviendo casos complejos con éxito.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-600 text-2xl">✓</span>
              </div>
              <h4 className="mb-2">Especialización</h4>
              <p className="text-gray-600 text-sm">
                Equipo de expertos en diversas áreas del derecho.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-600 text-2xl">✓</span>
              </div>
              <h4 className="mb-2">Atención Personal</h4>
              <p className="text-gray-600 text-sm">
                Cada caso recibe dedicación y estrategia personalizada.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold-600 text-2xl">✓</span>
              </div>
              <h4 className="mb-2">Resultados</h4>
              <p className="text-gray-600 text-sm">
                98% de satisfacción y miles de casos ganados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 text-white py-16 text-center">
        <div className="container-custom">
          <h2 className="text-white mb-4">Conozca a nuestro equipo</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Detrás de cada caso exitoso hay un equipo de profesionales comprometidos.
            Conozca a los abogados que defenderán sus intereses.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/equipo" className="btn-secondary btn-lg">
              Ver Equipo
            </Link>
            <Link to="/contacto" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900 btn-lg">
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
