import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { servicesApi } from '../../api/services';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const iconMap = {
  scale: '⚖️',
  gavel: '🔨',
  briefcase: '💼',
  users: '👥',
  building: '🏢',
  'file-text': '📄',
  shield: '🛡️',
  home: '🏠',
  car: '🚗',
  heart: '❤️'
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesApi.getAll();
        setServices(response.data);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <>
      <Helmet>
        <title>Servicios Legales | {SITE_NAME}</title>
        <meta name="description" content="Ofrecemos una amplia gama de servicios legales: derecho civil, penal, laboral, familiar, mercantil y más. Consulta gratuita." />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Nuestros Servicios Legales</h1>
            <p className="text-xl text-gray-300">
              Brindamos asesoría legal integral en diversas áreas del derecho.
              Nuestro equipo de expertos está preparado para defender sus intereses.
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
            <span className="text-primary-900 font-medium">Servicios</span>
          </nav>
        </div>
      </div>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay servicios disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/servicios/${service.slug}`}
                  className="card group hover:shadow-elegant transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                      <span className="text-2xl">
                        {iconMap[service.icon] || '⚖️'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-2 group-hover:text-gold-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {service.short_description || 'Asesoría legal especializada para proteger sus derechos e intereses.'}
                      </p>
                      <span className="text-primary-600 text-sm font-medium inline-flex items-center gap-1 group-hover:text-gold-600">
                        Ver más
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="bg-primary-900 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-white mb-4">¿No encuentra lo que busca?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Contáctenos para una consulta personalizada. Nuestro equipo evaluará
              su caso y le orientará sobre la mejor solución legal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contacto" className="btn-secondary">
                Consulta Gratuita
              </Link>
              <Link to="/agendar-cita" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900">
                Agendar Cita
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
