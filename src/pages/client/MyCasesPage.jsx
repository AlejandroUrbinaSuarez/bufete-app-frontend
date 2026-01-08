import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBriefcase, HiUser, HiCalendar, HiFilter, HiChevronRight } from 'react-icons/hi';
import { casesApi } from '../../api/cases';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  on_hold: 'En Espera',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export default function MyCasesPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await casesApi.getMyCases();
      setCases(res.data || []);
    } catch (error) {
      console.error('Error cargando casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = filter === 'all'
    ? cases
    : filter === 'active'
    ? cases.filter(c => ['pending', 'in_progress', 'on_hold'].includes(c.status))
    : cases.filter(c => c.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Casos</h1>
          <p className="text-gray-600">Seguimiento de tus casos legales</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <HiFilter className="text-gray-500" />
          <span className="font-medium text-gray-700">Filtrar por estado</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'pending', label: 'Pendiente' },
            { value: 'in_progress', label: 'En Progreso' },
            { value: 'resolved', label: 'Resuelto' },
            { value: 'closed', label: 'Cerrado' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de casos */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <HiBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay casos</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? 'Aún no tienes casos registrados.'
              : 'No hay casos con el estado seleccionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/portal/casos/${caseItem.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-500 font-mono">
                        {caseItem.case_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[caseItem.status]}`}>
                        {STATUS_LABELS[caseItem.status]}
                      </span>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[caseItem.priority]}`}>
                        Prioridad: {PRIORITY_LABELS[caseItem.priority]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {caseItem.title}
                    </h3>
                    {caseItem.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {caseItem.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {caseItem.lawyer && (
                        <div className="flex items-center">
                          {caseItem.lawyer.photo_url ? (
                            <img
                              src={caseItem.lawyer.photo_url}
                              alt=""
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                              <HiUser className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                          {caseItem.lawyer.full_name}
                        </div>
                      )}
                      {caseItem.service && (
                        <span>{caseItem.service.name}</span>
                      )}
                      <div className="flex items-center">
                        <HiCalendar className="w-4 h-4 mr-1" />
                        {new Date(caseItem.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <HiChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
