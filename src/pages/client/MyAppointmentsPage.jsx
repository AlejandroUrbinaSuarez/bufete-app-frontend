import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiCalendar, HiClock, HiUser, HiPhone, HiMail,
  HiLocationMarker, HiX, HiPlus, HiRefresh
} from 'react-icons/hi';
import { appointmentsApi } from '../../api/appointments';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  no_show: 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
};

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await appointmentsApi.getMyAppointments();
      setAppointments(res.data || []);
    } catch (error) {
      console.error('Error cargando citas:', error);
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    setCancellingId(id);
    try {
      await appointmentsApi.cancel(id);
      toast.success('Cita cancelada');
      loadAppointments();
    } catch (error) {
      toast.error('Error al cancelar la cita');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);

    if (filter === 'upcoming') {
      return aptDate >= now && ['pending', 'confirmed'].includes(apt.status);
    } else if (filter === 'past') {
      return aptDate < now || ['completed', 'cancelled', 'no_show'].includes(apt.status);
    }
    return true;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.appointment_date);
    const dateB = new Date(b.appointment_date);
    return filter === 'past' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus citas programadas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAppointments}
            className="btn-ghost p-2"
            title="Actualizar"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
          <Link to="/agendar-cita" className="btn-primary flex items-center">
            <HiPlus className="w-5 h-5 mr-2" />
            Nueva Cita
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'upcoming', label: 'Próximas' },
          { id: 'past', label: 'Pasadas' },
          { id: 'all', label: 'Todas' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === f.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {sortedAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'upcoming'
              ? 'No tienes citas programadas'
              : filter === 'past'
              ? 'No hay citas pasadas'
              : 'No tienes citas'}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'upcoming' && 'Agenda una cita con nuestro equipo legal'}
          </p>
          {filter === 'upcoming' && (
            <Link to="/agendar-cita" className="btn-primary inline-flex items-center">
              <HiPlus className="w-5 h-5 mr-2" />
              Agendar Cita
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((apt) => {
            const aptDate = new Date(apt.appointment_date);
            const isPast = aptDate < now;
            const canCancel = !isPast && ['pending', 'confirmed'].includes(apt.status);

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  STATUS_COLORS[apt.status]?.split(' ')[2] || 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Date and Time */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3 text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-primary">
                        {aptDate.getDate()}
                      </p>
                      <p className="text-sm text-primary uppercase">
                        {aptDate.toLocaleDateString('es-ES', { month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {aptDate.getFullYear()}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status]}`}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                        {apt.appointment_type && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {apt.appointment_type === 'presencial' ? 'Presencial' : 'Virtual'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-700 mb-1">
                        <HiClock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">
                          {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      {apt.service && (
                        <p className="text-sm text-gray-600">{apt.service.name}</p>
                      )}
                      {apt.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">"{apt.notes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Lawyer Info */}
                  {apt.lawyer && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      {apt.lawyer.photo_url ? (
                        <img
                          src={apt.lawyer.photo_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <HiUser className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{apt.lawyer.full_name}</p>
                        {apt.lawyer.specialization && (
                          <p className="text-sm text-gray-500">{apt.lawyer.specialization}</p>
                        )}
                        <div className="flex gap-2 mt-1">
                          {apt.lawyer.email && (
                            <a
                              href={`mailto:${apt.lawyer.email}`}
                              className="text-primary hover:text-primary-dark"
                            >
                              <HiMail className="w-4 h-4" />
                            </a>
                          )}
                          {apt.lawyer.phone && (
                            <a
                              href={`tel:${apt.lawyer.phone}`}
                              className="text-primary hover:text-primary-dark"
                            >
                              <HiPhone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {canCancel && (
                    <div>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={cancellingId === apt.id}
                        className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center"
                      >
                        <HiX className="w-4 h-4 mr-2" />
                        {cancellingId === apt.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Location for presencial */}
                {apt.appointment_type === 'presencial' && apt.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-600">
                    <HiLocationMarker className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Oficina Principal - Calle Principal 123, Ciudad</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
