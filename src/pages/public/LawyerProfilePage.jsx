import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { lawyersApi } from '../../api/services';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const LawyerProfilePage = () => {
  const { slug } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        setLoading(true);
        const response = await lawyersApi.getBySlug(slug);
        setLawyer(response.data);
      } catch (err) {
        setError('Abogado no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Perfil no encontrado</h1>
        <Link to="/equipo" className="btn-primary">Ver todo el equipo</Link>
      </div>
    );
  }

  const languages = lawyer.languages?.split(',').map(l => l.trim()) || [];

  return (
    <>
      <Helmet>
        <title>{lawyer.full_name} | {SITE_NAME}</title>
        <meta name="description" content={`${lawyer.full_name} - ${lawyer.specialty || 'Abogado'} en ${SITE_NAME}. ${lawyer.bio?.substring(0, 150) || ''}`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16 lg:py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {lawyer.photo_url ? (
                <img src={lawyer.photo_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-5xl font-semibold">
                  {lawyer.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-white mb-2">{lawyer.full_name}</h1>
              <p className="text-gold-400 text-xl mb-2">{lawyer.specialty || 'Abogado'}</p>
              {lawyer.experience_years && (
                <p className="text-gray-300">{lawyer.experience_years} años de experiencia</p>
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
            <Link to="/equipo" className="hover:text-primary-600">Equipo</Link>
            <span className="mx-2">/</span>
            <span className="text-primary-900 font-medium">{lawyer.full_name}</span>
          </nav>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              {lawyer.bio && (
                <div>
                  <h2 className="text-2xl mb-4">Biografía</h2>
                  <div className="prose max-w-none text-gray-600">
                    {lawyer.bio.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {lawyer.education && (
                <div>
                  <h2 className="text-2xl mb-4">Formación Académica</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <div className="text-gray-600">
                        {lawyer.education.split('\n').map((line, i) => (
                          <p key={i} className="mb-1">{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Areas of Practice */}
              {lawyer.services?.length > 0 && (
                <div>
                  <h2 className="text-2xl mb-4">Áreas de Práctica</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {lawyer.services.map(service => (
                      <Link
                        key={service.id}
                        to={`/servicios/${service.slug}`}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-2xl">⚖️</span>
                        <span className="font-medium">{service.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Card */}
                <div className="bg-primary-900 rounded-2xl p-6 text-white">
                  <h3 className="text-white text-xl mb-4">Contactar</h3>
                  <div className="space-y-3 mb-6">
                    {lawyer.email && (
                      <a href={`mailto:${lawyer.email}`} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                        <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">✉️</span>
                        <span className="text-sm">{lawyer.email}</span>
                      </a>
                    )}
                    {lawyer.phone && (
                      <a href={`tel:${lawyer.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                        <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">📞</span>
                        <span className="text-sm">{lawyer.phone}</span>
                      </a>
                    )}
                    {lawyer.linkedin_url && (
                      <a href={lawyer.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                        <span className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">💼</span>
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                  </div>
                  <Link to="/agendar-cita" className="btn-secondary w-full justify-center">
                    Agendar Cita
                  </Link>
                </div>

                {/* Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">Información</h4>
                  <div className="space-y-4">
                    {lawyer.bar_number && (
                      <div>
                        <span className="text-sm text-gray-500">N° Colegiado</span>
                        <p className="font-medium">{lawyer.bar_number}</p>
                      </div>
                    )}
                    {lawyer.experience_years && (
                      <div>
                        <span className="text-sm text-gray-500">Experiencia</span>
                        <p className="font-medium">{lawyer.experience_years} años</p>
                      </div>
                    )}
                    {languages.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Idiomas</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {languages.map((lang, i) => (
                            <span key={i} className="badge-primary text-xs">{lang}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom text-center">
          <h2 className="mb-4">¿Necesita asesoría legal?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Agende una consulta con {lawyer.full_name} para discutir su caso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/agendar-cita" className="btn-primary">
              Agendar Consulta
            </Link>
            <Link to="/equipo" className="btn-outline">
              Ver Todo el Equipo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LawyerProfilePage;
