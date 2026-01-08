import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { servicesApi, lawyersApi } from '../../api/services';

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

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [relatedLawyers, setRelatedLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [serviceRes, lawyersRes] = await Promise.all([
          servicesApi.getBySlug(slug),
          lawyersApi.getAll()
        ]);
        setService(serviceRes.data);

        const related = lawyersRes.data.filter(lawyer =>
          lawyer.services?.some(s => s.slug === slug)
        );
        setRelatedLawyers(related.slice(0, 4));
      } catch (err) {
        setError('Servicio no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Servicio no encontrado</h1>
        <Link to="/servicios" className="btn-primary">Ver todos los servicios</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service.meta_title || service.name} | {SITE_NAME}</title>
        <meta name="description" content={service.meta_description || service.short_description || `Servicios de ${service.name} - ${SITE_NAME}`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">{iconMap[service.icon] || '⚖️'}</span>
            </div>
            <div>
              <h1 className="text-white mb-2">{service.name}</h1>
              {service.short_description && (
                <p className="text-xl text-gray-300">{service.short_description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="container-custom">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/servicios" className="hover:text-primary-600">Servicios</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-900 font-medium">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                {service.description ? (
                  <div dangerouslySetInnerHTML={{ __html: service.description.replace(/\n/g, '<br/>') }} />
                ) : (
                  <div>
                    <p>
                      En {SITE_NAME}, contamos con un equipo de abogados especializados en {service.name.toLowerCase()},
                      preparados para brindarle la mejor asesoría y representación legal.
                    </p>
                    <h3>¿Por qué elegirnos?</h3>
                    <ul>
                      <li>Amplia experiencia en casos similares al suyo</li>
                      <li>Atención personalizada y seguimiento constante</li>
                      <li>Estrategias legales efectivas y probadas</li>
                      <li>Transparencia en honorarios y procesos</li>
                    </ul>
                    <h3>Nuestro proceso</h3>
                    <ol>
                      <li><strong>Consulta inicial:</strong> Evaluamos su caso sin compromiso</li>
                      <li><strong>Análisis:</strong> Estudiamos a fondo su situación legal</li>
                      <li><strong>Estrategia:</strong> Diseñamos un plan de acción personalizado</li>
                      <li><strong>Ejecución:</strong> Implementamos la estrategia legal</li>
                      <li><strong>Seguimiento:</strong> Le mantenemos informado en cada etapa</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Related Lawyers */}
              {relatedLawyers.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl mb-6">Abogados Especializados</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {relatedLawyers.map((lawyer) => (
                      <Link
                        key={lawyer.id}
                        to={`/equipo/${lawyer.slug}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                          {lawyer.photo_url ? (
                            <img src={lawyer.photo_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary-600 text-xl font-semibold">
                              {lawyer.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold">{lawyer.full_name}</h4>
                          <p className="text-sm text-gray-600">{lawyer.specialty || 'Abogado'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* CTA Card */}
                <div className="bg-primary-900 rounded-2xl p-6 text-white">
                  <h3 className="text-white text-xl mb-3">¿Necesita ayuda?</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Agende una consulta gratuita con nuestros expertos en {service.name.toLowerCase()}.
                  </p>
                  <Link to="/agendar-cita" className="btn-secondary w-full justify-center mb-3">
                    Agendar Cita
                  </Link>
                  <Link to="/contacto" className="btn-outline w-full justify-center border-white text-white hover:bg-white hover:text-primary-900">
                    Contactar
                  </Link>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">Contáctenos</h4>
                  <div className="space-y-3 text-sm">
                    <a href="tel:+1234567890" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                      <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        📞
                      </span>
                      +1 234 567 890
                    </a>
                    <a href="mailto:contacto@ejemplo.com" className="flex items-center gap-3 text-gray-600 hover:text-primary-600">
                      <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        ✉️
                      </span>
                      contacto@ejemplo.com
                    </a>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        📍
                      </span>
                      Calle Principal 123, Ciudad
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetailPage;
