import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiBriefcase, HiCalendar, HiDocumentText, HiChatAlt2, HiClock, HiUser } from 'react-icons/hi';
import { casesApi } from '../../api/cases';
import { appointmentsApi } from '../../api/appointments';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-gray-100 text-gray-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  on_hold: 'En Espera',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [casesRes, appointmentsRes, unreadRes] = await Promise.all([
        casesApi.getMyCases(),
        appointmentsApi.getMyAppointments(),
        casesApi.getUnreadCount()
      ]);

      setCases(casesRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setUnreadMessages(unreadRes.data?.count || 0);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCases = cases.filter(c => ['pending', 'in_progress', 'on_hold'].includes(c.status));
  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(a.appointment_date);
    return appointmentDate >= new Date() && ['pending', 'confirmed'].includes(a.status);
  });

  const stats = [
    {
      label: 'Casos Activos',
      value: activeCases.length,
      icon: HiBriefcase,
      color: 'bg-blue-500',
      to: '/portal/casos'
    },
    {
      label: 'Próximas Citas',
      value: upcomingAppointments.length,
      icon: HiCalendar,
      color: 'bg-green-500',
      to: '/portal/citas'
    },
    {
      label: 'Mensajes sin leer',
      value: unreadMessages,
      icon: HiChatAlt2,
      color: 'bg-orange-500',
      to: '/portal/mensajes'
    },
    {
      label: 'Total Casos',
      value: cases.length,
      icon: HiDocumentText,
      color: 'bg-purple-500',
      to: '/portal/casos'
    },
  ];

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
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.first_name || user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Aquí puedes ver el resumen de tu actividad legal.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Casos Recientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Casos Recientes</h3>
            <Link to="/portal/casos" className="text-primary text-sm hover:underline">
              Ver todos
            </Link>
          </div>

          {activeCases.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes casos activos</p>
          ) : (
            <div className="space-y-4">
              {activeCases.slice(0, 3).map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/portal/casos/${caseItem.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-500">{caseItem.case_number}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[caseItem.status]}`}>
                      {STATUS_LABELS[caseItem.status]}
                    </span>
                  </div>
                  {caseItem.lawyer && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <HiUser className="w-4 h-4 mr-1" />
                      {caseItem.lawyer.full_name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Próximas Citas */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Próximas Citas</h3>
            <Link to="/portal/citas" className="text-primary text-sm hover:underline">
              Ver todas
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes citas programadas</p>
              <Link to="/agendar-cita" className="btn-primary btn-sm">
                Agendar Cita
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <HiCalendar className="w-5 h-5 text-primary mr-2" />
                      <span className="font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <HiClock className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {appointment.start_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                  {appointment.lawyer && (
                    <div className="flex items-center text-sm text-gray-600">
                      {appointment.lawyer.photo_url ? (
                        <img
                          src={appointment.lawyer.photo_url}
                          alt=""
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                          <HiUser className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      {appointment.lawyer.full_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/agendar-cita" className="btn-primary">
            Agendar Cita
          </Link>
          <Link to="/portal/casos" className="btn-outline">
            Ver Mis Casos
          </Link>
          <Link to="/contacto" className="btn-ghost">
            Contactar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
