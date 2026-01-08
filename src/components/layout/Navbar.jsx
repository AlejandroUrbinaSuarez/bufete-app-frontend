import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX, HiUser, HiLogout } from 'react-icons/hi';
import { clsx } from 'clsx';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/equipo', label: 'Equipo' },
  { to: '/blog', label: 'Blog' },
  { to: '/casos-exito', label: 'Casos de Éxito' },
  { to: '/contacto', label: 'Contacto' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">PP</span>
            </div>
            <span className="font-heading font-semibold text-primary-900 text-lg hidden sm:block">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx('nav-link text-sm', isActive && 'nav-link-active')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA & Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-900"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <HiUser className="w-5 h-5 text-primary-900" />
                  </div>
                  <span className="font-medium">{user?.firstName}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-fade-in">
                    <Link
                      to={user?.role === 'client' ? '/portal' : '/admin'}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mi Portal
                    </Link>
                    <Link
                      to="/portal/perfil"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mi Perfil
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <HiLogout className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-link text-sm">
                  Iniciar Sesión
                </Link>
                <Link to="/agendar-cita" className="btn-primary btn-sm">
                  Agendar Cita
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-gray-600 hover:text-primary-900"
            aria-label="Menu"
          >
            {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-2 rounded-lg',
                      isActive ? 'bg-primary-50 text-primary-900 font-medium' : 'text-gray-600'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <hr className="my-2" />

              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'client' ? '/portal' : '/admin'}
                    onClick={closeMenu}
                    className="px-4 py-2 text-gray-600"
                  >
                    Mi Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-left text-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="px-4 py-2 text-gray-600"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/agendar-cita"
                    onClick={closeMenu}
                    className="mx-4 btn-primary text-center"
                  >
                    Agendar Cita
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
