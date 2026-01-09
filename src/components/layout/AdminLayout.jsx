import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiCollection,
  HiUsers,
  HiNewspaper,
  HiBriefcase,
  HiCalendar,
  HiMail,
  HiCog,
  HiLogout,
  HiMenu,
  HiX,
  HiExternalLink,
  HiStar,
  HiChat,
  HiChatAlt2
} from 'react-icons/hi';
import { useState } from 'react';
import { clsx } from 'clsx';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const sidebarLinks = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/servicios', icon: HiCollection, label: 'Servicios' },
  { to: '/admin/abogados', icon: HiUsers, label: 'Abogados' },
  { to: '/admin/blog', icon: HiNewspaper, label: 'Blog' },
  { to: '/admin/casos-exito', icon: HiStar, label: 'Casos de Éxito' },
  { to: '/admin/testimonios', icon: HiChat, label: 'Testimonios' },
  { to: '/admin/casos', icon: HiBriefcase, label: 'Casos Clientes' },
  { to: '/admin/citas', icon: HiCalendar, label: 'Citas' },
  { to: '/admin/contactos', icon: HiMail, label: 'Contactos' },
  { to: '/admin/chat', icon: HiChatAlt2, label: 'Chat en Vivo' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-primary-900 text-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold">PP</span>
            </div>
            <span className="font-heading font-semibold text-sm">
              Panel Admin
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
          >
            {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-6 border-b border-white/10">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl">PP</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">
                  {SITE_NAME}
                </p>
                <p className="text-xs text-gray-400">Panel de Administración</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                <span className="font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <div>
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
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
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      )
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Ver sitio */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
              >
                <HiExternalLink className="w-5 h-5" />
                Ver Sitio Web
              </a>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
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
        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
