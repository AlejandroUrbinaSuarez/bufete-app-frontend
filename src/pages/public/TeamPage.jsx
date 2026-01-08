import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { lawyersApi } from '../../api/services';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const TeamPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await lawyersApi.getAll();
        setLawyers(response.data);
      } catch (error) {
        console.error('Error cargando abogados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  return (
    <>
      <Helmet>
        <title>Nuestro Equipo | {SITE_NAME}</title>
        <meta name="description" content="Conozca a nuestro equipo de abogados expertos. Profesionales con años de experiencia dedicados a defender sus derechos." />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Nuestro Equipo</h1>
            <p className="text-xl text-gray-300">
              Contamos con un equipo de abogados altamente calificados,
              comprometidos con la excelencia y la defensa de sus derechos.
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
            <span className="text-primary-900 font-medium">Equipo</span>
          </nav>
        </div>
      </div>

      {/* Team Grid */}
      <section className="section">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay miembros del equipo disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lawyers.map((lawyer) => (
                <Link
                  key={lawyer.id}
                  to={`/equipo/${lawyer.slug}`}
                  className="card group text-center hover:shadow-elegant transition-all duration-300"
                >
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-primary-100">
                    {lawyer.photo_url ? (
                      <img
                        src={lawyer.photo_url}
                        alt={lawyer.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-600 text-4xl font-semibold">
                        {lawyer.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl mb-1 group-hover:text-gold-600 transition-colors">
                    {lawyer.full_name}
                  </h3>

                  <p className="text-gold-600 font-medium mb-3">
                    {lawyer.specialty || 'Abogado'}
                  </p>

                  {lawyer.experience_years && (
                    <p className="text-gray-500 text-sm mb-4">
                      {lawyer.experience_years} años de experiencia
                    </p>
                  )}

                  {lawyer.services?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {lawyer.services.slice(0, 3).map(service => (
                        <span key={service.id} className="badge-primary text-xs">
                          {service.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-primary-600 text-sm font-medium inline-flex items-center gap-1 group-hover:text-gold-600">
                    Ver perfil
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="section-title">
            <h2>¿Por qué confiar en nosotros?</h2>
            <div className="divider-gold"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h4 className="mb-2">Formación de Excelencia</h4>
              <p className="text-gray-600 text-sm">
                Nuestros abogados se han formado en las mejores universidades y mantienen actualización constante.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚖️</span>
              </div>
              <h4 className="mb-2">Experiencia Comprobada</h4>
              <p className="text-gray-600 text-sm">
                Miles de casos resueltos con éxito respaldan nuestra trayectoria profesional.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h4 className="mb-2">Compromiso Total</h4>
              <p className="text-gray-600 text-sm">
                Cada cliente recibe atención personalizada y dedicación absoluta a su caso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-primary-900 text-white text-center">
        <div className="container-custom">
          <h2 className="text-white mb-4">¿Listo para trabajar con nosotros?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Agende una consulta con uno de nuestros abogados expertos y dé el primer paso hacia la solución de su caso.
          </p>
          <Link to="/agendar-cita" className="btn-secondary btn-lg">
            Agendar Consulta Gratuita
          </Link>
        </div>
      </section>
    </>
  );
};

export default TeamPage;
