import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, lawyersRes] = await Promise.all([
          servicesApi.getAll(true),
          lawyersApi.getAll()
        ]);
        setServices(servicesRes.data.slice(0, 6));
        setLawyers(lawyersRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} | Bufete de Abogados</title>
        <meta name="description" content="Bufete de abogados con más de 20 años de experiencia. Asesoría legal en derecho civil, penal, laboral, familiar y más." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-primary-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              Más de 20 años de experiencia
            </span>
            <h1 className="text-white mb-6">
              Protegemos sus derechos con excelencia legal
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Somos un equipo de abogados comprometidos con la justicia y la defensa
              de sus intereses. Su tranquilidad es nuestra prioridad.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/agendar-cita" className="btn-secondary btn-lg">
                Agendar Consulta Gratuita
              </Link>
              <Link to="/servicios" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900">
                Nuestros Servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary-900">20+</div>
              <div className="text-gray-600 mt-1">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary-900">5000+</div>
              <div className="text-gray-600 mt-1">Casos Resueltos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary-900">98%</div>
              <div className="text-gray-600 mt-1">Clientes Satisfechos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-heading font-bold text-primary-900">15+</div>
              <div className="text-gray-600 mt-1">Abogados Expertos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="section-title">
            <h2>Áreas de Práctica</h2>
            <div className="divider-gold"></div>
            <p>Ofrecemos servicios legales integrales para proteger sus intereses</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.length > 0 ? (
                services.map((service) => (
                  <Link
                    key={service.id}
                    to={`/servicios/${service.slug}`}
                    className="card-hover text-center group"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                      <span className="text-2xl">
                        {iconMap[service.icon] || '⚖️'}
                      </span>
                    </div>
                    <h4 className="mb-2 group-hover:text-gold-600 transition-colors">{service.name}</h4>
                    <p className="text-gray-600 text-sm">
                      {service.short_description || 'Asesoría especializada para proteger sus derechos e intereses.'}
                    </p>
                  </Link>
                ))
              ) : (
                ['Derecho Civil', 'Derecho Penal', 'Derecho Laboral', 'Derecho Familiar', 'Derecho Mercantil', 'Derecho Inmobiliario'].map((name) => (
                  <div key={name} className="card-hover text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h4 className="mb-2">{name}</h4>
                    <p className="text-gray-600 text-sm">
                      Asesoría especializada para proteger sus derechos e intereses.
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/servicios" className="btn-primary">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">¿Por qué elegirnos?</h2>
              <div className="divider-gold mb-8" style={{ margin: '0 0 2rem 0' }}></div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Experiencia Comprobada</h4>
                    <p className="text-gray-600">Más de dos décadas resolviendo casos complejos con éxito.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Atención Personalizada</h4>
                    <p className="text-gray-600">Cada caso es único y merece una estrategia a medida.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Transparencia Total</h4>
                    <p className="text-gray-600">Le mantenemos informado en cada etapa del proceso.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-600 text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg mb-1">Resultados Garantizados</h4>
                    <p className="text-gray-600">Nuestro compromiso es obtener el mejor resultado para usted.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary-900 rounded-2xl p-8 text-white">
              <h3 className="text-white text-2xl mb-4">Consulta Gratuita</h3>
              <p className="text-gray-300 mb-6">
                Agende una cita con nuestros expertos para evaluar su caso sin compromiso.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-gold-500">•</span>
                  Evaluación inicial sin costo
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-gold-500">•</span>
                  Orientación legal profesional
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-gold-500">•</span>
                  Plan de acción personalizado
                </li>
              </ul>
              <Link to="/agendar-cita" className="btn-secondary w-full justify-center">
                Agendar Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      {lawyers.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="section-title">
              <h2>Nuestro Equipo</h2>
              <div className="divider-gold"></div>
              <p>Profesionales comprometidos con su éxito</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lawyers.map((lawyer) => (
                <Link
                  key={lawyer.id}
                  to={`/equipo/${lawyer.slug}`}
                  className="card-hover text-center group"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-primary-100">
                    {lawyer.photo_url ? (
                      <img
                        src={lawyer.photo_url}
                        alt={lawyer.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-600 text-2xl font-semibold">
                        {lawyer.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg mb-1 group-hover:text-gold-600 transition-colors">
                    {lawyer.full_name}
                  </h4>
                  <p className="text-gold-600 text-sm mb-2">{lawyer.specialty || 'Abogado'}</p>
                  {lawyer.experience_years && (
                    <p className="text-gray-500 text-xs">{lawyer.experience_years} años de experiencia</p>
                  )}
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/equipo" className="btn-outline">
                Conocer al equipo completo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonios placeholder */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="section-title">
            <h2>Lo que dicen nuestros clientes</h2>
            <div className="divider-gold"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'María García',
                text: 'Excelente atención y profesionalismo. Resolvieron mi caso de manera rápida y eficiente.',
                role: 'Cliente - Derecho Civil'
              },
              {
                name: 'Carlos Rodríguez',
                text: 'Me mantuvieron informado en todo momento. Muy satisfecho con los resultados obtenidos.',
                role: 'Cliente - Derecho Laboral'
              },
              {
                name: 'Ana Martínez',
                text: 'Un equipo de abogados comprometidos y con gran experiencia. Los recomiendo ampliamente.',
                role: 'Cliente - Derecho Familiar'
              }
            ].map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-1 text-gold-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section bg-primary-900 text-white text-center">
        <div className="container-custom">
          <h2 className="text-white mb-4">¿Necesita asesoría legal?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Contáctenos hoy para una consulta gratuita. Nuestro equipo de abogados
            está listo para ayudarle a resolver su situación legal.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contacto" className="btn-secondary btn-lg">
              Contáctenos Ahora
            </Link>
            <a href="tel:+1234567890" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900 btn-lg">
              Llamar: +1 234 567 890
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
