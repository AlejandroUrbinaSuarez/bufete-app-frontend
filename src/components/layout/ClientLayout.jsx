import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiBriefcase,
  HiCalendar,
  HiDocumentText,
  HiChatAlt2,
  HiUser,
  HiLogout,
  HiMenu,
  HiX
} from 'react-icons/hi';
import { useState } from 'react';
import { clsx } from 'clsx';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const sidebarLinks = [
  { to: '/portal', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/portal/casos', icon: HiBriefcase, label: 'Mis Casos' },
  { to: '/portal/citas', icon: HiCalendar, label: 'Mis Citas' },
  { to: '/portal/documentos', icon: HiDocumentText, label: 'Documentos' },
  { to: '/portal/mensajes', icon: HiChatAlt2, label: 'Mensajes' },
  { to: '/portal/perfil', icon: HiUser, label: 'Mi Perfil' },
];

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold">PP</span>
            </div>
            <span className="font-heading font-semibold text-primary-900 text-sm">
              Portal Cliente
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600"
          >
            {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">PP</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-primary-900 text-sm">
                  {SITE_NAME}
                </p>
                <p className="text-xs text-gray-500">Portal Cliente</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <HiUser className="w-5 h-5 text-primary-900" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      )
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <HiLogout className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
