import { useAuth } from '../../context/AuthContext';
import { HiUsers, HiBriefcase, HiCalendar, HiMail, HiTrendingUp } from 'react-icons/hi';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Clientes', value: '45', icon: HiUsers, change: '+5%', color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Casos Activos', value: '23', icon: HiBriefcase, change: '+12%', color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Citas Pendientes', value: '8', icon: HiCalendar, change: '-2%', color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Mensajes Nuevos', value: '15', icon: HiMail, change: '+18%', color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user?.fullName}. Aquí está el resumen de actividad.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                <HiTrendingUp className="w-4 h-4" />
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for charts and tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-heading text-lg mb-4">Casos Recientes</h3>
          <p className="text-gray-500 text-sm">Próximamente: lista de casos recientes</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-heading text-lg mb-4">Citas de Hoy</h3>
          <p className="text-gray-500 text-sm">Próximamente: calendario de citas</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
