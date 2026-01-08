import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { successCasesApi } from '../../api/blog';
import { servicesApi } from '../../api/services';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const SuccessCasesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentService = searchParams.get('servicio') || '';

  useEffect(() => {
    fetchData();
  }, [currentService]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, servicesRes] = await Promise.all([
        successCasesApi.getAll({ service: currentService }),
        servicesApi.getAll()
      ]);
      setCases(casesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error cargando casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('servicio', slug);
    } else {
      params.delete('servicio');
    }
    setSearchParams(params);
  };

  const openModal = (caseItem) => {
    setSelectedCase(caseItem);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedCase(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <Helmet>
        <title>Casos de Éxito | {SITE_NAME}</title>
        <meta name="description" content="Conozca algunos de nuestros casos de éxito más destacados y cómo hemos ayudado a nuestros clientes." />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-white mb-4">Casos de Éxito</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Resultados que hablan por sí mismos. Conozca cómo hemos ayudado a nuestros clientes a obtener justicia.
          </p>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          {/* Filtros por servicio */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleServiceChange('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !currentService
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Todos
              </button>
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => handleServiceChange(service.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentService === service.slug
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-500 text-lg">No se encontraron casos de éxito.</p>
              {currentService && (
                <button
                  onClick={() => handleServiceChange('')}
                  className="btn-primary mt-4"
                >
                  Ver todos los casos
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseItem) => (
                <article
                  key={caseItem.id}
                  className="card group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(caseItem)}
                >
                  {caseItem.image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4">
                      <img
                        src={caseItem.image_url}
                        alt={caseItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {caseItem.is_featured && (
                      <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded">
                        Destacado
                      </span>
                    )}
                    {caseItem.service && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {caseItem.service.name}
                      </span>
                    )}
                    {caseItem.year && (
                      <span className="text-xs text-gray-500">
                        {caseItem.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-heading mb-2 group-hover:text-primary-600 transition-colors">
                    {caseItem.title}
                  </h3>

                  {caseItem.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {caseItem.description}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-primary-600 text-sm font-medium group-hover:underline">
                      Ver detalles
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-primary-900 text-white rounded-xl p-8 mt-12 text-center">
            <h2 className="text-2xl font-heading text-white mb-3">¿Necesita Representación Legal?</h2>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              Permítanos ayudarle a obtener los resultados que merece. Contáctenos para una consulta gratuita.
            </p>
            <Link to="/agendar-cita" className="btn-secondary btn-lg">
              Agendar Consulta Gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de detalle */}
      {selectedCase && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {selectedCase.image_url && (
              <div className="aspect-video overflow-hidden rounded-t-xl">
                <img
                  src={selectedCase.image_url}
                  alt={selectedCase.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {selectedCase.is_featured && (
                  <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded">
                    Destacado
                  </span>
                )}
                {selectedCase.service && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {selectedCase.service.name}
                  </span>
                )}
                {selectedCase.year && (
                  <span className="text-xs text-gray-500">
                    Año {selectedCase.year}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-heading mb-4">{selectedCase.title}</h2>

              {selectedCase.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Descripción del Caso</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedCase.description}</p>
                </div>
              )}

              {selectedCase.result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Resultado Obtenido</h3>
                  <p className="text-green-700 whitespace-pre-line">{selectedCase.result}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button onClick={closeModal} className="btn-ghost">
                  Cerrar
                </button>
                <Link to="/agendar-cita" className="btn-primary">
                  Consultar Caso Similar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuccessCasesPage;
