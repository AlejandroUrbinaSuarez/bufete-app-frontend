import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {string[]} allowedRoles - Roles permitidos para acceder
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return <Loader fullScreen />;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles especificados, verificar que el usuario tenga permiso
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirigir según el rol del usuario
    if (user?.role === 'admin' || user?.role === 'lawyer') {
      return <Navigate to="/admin" replace />;
    }
    if (user?.role === 'client') {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Usuario autenticado y con permisos, renderizar la ruta
  return <Outlet />;
};

export default ProtectedRoute;
