import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { statsApi } from '../../api/stats';
import {
  HiUsers,
  HiBriefcase,
  HiCalendar,
  HiMail,
  HiTrendingUp,
  HiTrendingDown,
  HiChatAlt2,
  HiClock,
  HiEye,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

const COLORS = ['#1a365d', '#d4a574', '#3182ce', '#38a169', '#e53e3e', '#805ad5'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const STATUS_LABELS = {
  // Estados de casos
  consultation: 'Consulta',
  active: 'Activo',
  in_progress: 'En progreso',
  pending: 'Pendiente',
  on_hold: 'En espera',
  closed: 'Cerrado',
  archived: 'Archivado',
  won: 'Ganado',
  lost: 'Perdido',
  // Estados de citas
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió'
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [caseStats, setCaseStats] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, caseRes, appointRes, recentRes] = await Promise.all([
        statsApi.getDashboardStats(),
        statsApi.getCaseStats(),
        statsApi.getAppointmentStats(),
        statsApi.getRecentActivity()
      ]);

      setDashboardData(dashRes.data.data);
      setCaseStats(caseRes.data.data);
      setAppointmentStats(appointRes.data.data);
      setRecentActivity(recentRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const { kpis, summary } = dashboardData || {};

  const stats = [
    {
      label: 'Clientes',
      value: kpis?.clients?.total || 0,
      subtext: `+${kpis?.clients?.thisMonth || 0} este mes`,
      icon: HiUsers,
      change: kpis?.clients?.change || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      link: '/admin/cases'
    },
    {
      label: 'Casos Activos',
      value: kpis?.cases?.active || 0,
      subtext: `${kpis?.cases?.total || 0} total`,
      icon: HiBriefcase,
      change: kpis?.cases?.change || 0,
      color: 'text-green-600',
      bg: 'bg-green-100',
      link: '/admin/cases'
    },
    {
      label: 'Citas Hoy',
      value: kpis?.appointments?.today || 0,
      subtext: `${kpis?.appointments?.pending || 0} pendientes`,
      icon: HiCalendar,
      change: kpis?.appointments?.change || 0,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      link: '/admin/appointments'
    },
    {
      label: 'Mensajes',
      value: kpis?.messages?.unread || 0,
      subtext: 'Sin leer',
      icon: HiMail,
      change: kpis?.messages?.change || 0,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      link: '/admin/contacts'
    }
  ];

  // Preparar datos para gráficos
  const casesByStatusData = caseStats?.byStatus?.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count
  })) || [];

  const casesByMonthData = caseStats?.byMonth?.map(item => ({
    name: MONTHS[item.month - 1],
    casos: item.count
  })) || [];

  const appointmentsByMonthData = appointmentStats?.byMonth?.map(item => ({
    name: MONTHS[item.month - 1],
    citas: item.count
  })) || [];

  // Combinar datos por mes para el gráfico de líneas
  const combinedMonthlyData = [];
  const monthsSet = new Set();

  casesByMonthData.forEach(item => monthsSet.add(item.name));
  appointmentsByMonthData.forEach(item => monthsSet.add(item.name));

  Array.from(monthsSet).forEach(month => {
    const caseItem = casesByMonthData.find(c => c.name === month);
    const appointItem = appointmentsByMonthData.find(a => a.name === month);
    combinedMonthlyData.push({
      name: month,
      casos: caseItem?.casos || 0,
      citas: appointItem?.citas || 0
    });
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido, {user?.fullName}. Aquí está el resumen de actividad.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.change !== 0 && (
                <span className={`text-sm font-medium flex items-center gap-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change > 0 ? (
                    <HiTrendingUp className="w-4 h-4" />
                  ) : (
                    <HiTrendingDown className="w-4 h-4" />
                  )}
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.subtext}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <HiChatAlt2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{kpis?.chats?.active || 0}</p>
            <p className="text-gray-500 text-sm">Chats activos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <HiUsers className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{summary?.lawyers || 0}</p>
            <p className="text-gray-500 text-sm">Abogados</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <HiBriefcase className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{summary?.services || 0}</p>
            <p className="text-gray-500 text-sm">Servicios</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Casos por Estado - Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-heading text-lg mb-4">Casos por Estado</h3>
          {casesByStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={casesByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {casesByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No hay datos de casos
            </div>
          )}
        </div>

        {/* Actividad Mensual - Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-heading text-lg mb-4">Actividad Mensual</h3>
          {combinedMonthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={combinedMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="casos" stroke="#1a365d" strokeWidth={2} name="Casos" />
                <Line type="monotone" dataKey="citas" stroke="#d4a574" strokeWidth={2} name="Citas" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No hay datos mensuales
            </div>
          )}
        </div>
      </div>

      {/* Citas por Abogado - Bar Chart */}
      {appointmentStats?.byLawyer?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="font-heading text-lg mb-4">Citas por Abogado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={appointmentStats.byLawyer.map(item => ({
              name: item.lawyer?.split(' ')[0] || 'Sin asignar',
              citas: item.count
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="citas" fill="#1a365d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Casos Recientes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg">Casos Recientes</h3>
            <Link to="/admin/cases" className="text-primary-600 hover:text-primary-700 text-sm">
              Ver todos
            </Link>
          </div>
          {recentActivity?.recentCases?.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.recentCases.map((caseItem) => (
                <div key={caseItem.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    caseItem.status === 'active' ? 'bg-green-500' :
                    caseItem.status === 'pending' ? 'bg-yellow-500' :
                    caseItem.status === 'closed' ? 'bg-gray-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{caseItem.title}</p>
                    <p className="text-xs text-gray-500">{caseItem.client} • {caseItem.lawyer || 'Sin asignar'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {STATUS_LABELS[caseItem.status] || caseItem.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay casos recientes</p>
          )}
        </div>

        {/* Citas de Hoy */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg">Citas de Hoy</h3>
            <Link to="/admin/appointments" className="text-primary-600 hover:text-primary-700 text-sm">
              Ver todas
            </Link>
          </div>
          {recentActivity?.todayAppointments?.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <HiClock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{appointment.time?.slice(0, 5)}</p>
                    <p className="text-xs text-gray-500 truncate">{appointment.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{appointment.lawyer}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {STATUS_LABELS[appointment.status] || appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay citas programadas para hoy</p>
          )}
        </div>

        {/* Mensajes de Contacto */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg">Mensajes Recientes</h3>
            <Link to="/admin/contacts" className="text-primary-600 hover:text-primary-700 text-sm">
              Ver todos
            </Link>
          </div>
          {recentActivity?.recentMessages?.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.recentMessages.map((message) => (
                <div key={message.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    message.status === 'new' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <HiMail className={`w-5 h-5 ${message.status === 'new' ? 'text-red-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.name}</p>
                    <p className="text-xs text-gray-500 truncate">{message.subject || 'Sin asunto'}</p>
                  </div>
                  {message.status === 'new' && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay mensajes recientes</p>
          )}
        </div>

        {/* Chats Activos */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg">Chats Activos</h3>
            <Link to="/admin/chat" className="text-primary-600 hover:text-primary-700 text-sm">
              Ir al chat
            </Link>
          </div>
          {recentActivity?.activeChats?.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.activeChats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    chat.status === 'waiting' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <HiChatAlt2 className={`w-5 h-5 ${
                      chat.status === 'waiting' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.visitorName}</p>
                    <p className="text-xs text-gray-500 truncate">{chat.visitorEmail}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {chat.status === 'waiting' ? 'En espera' : 'Activo'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No hay chats activos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
