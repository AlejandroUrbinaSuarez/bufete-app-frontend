import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  /**
   * Verificar si hay una sesión activa
   */
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      return { success: false, error: message };
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al registrar';
      const details = error.response?.data?.details;
      return { success: false, error: message, details };
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  /**
   * Solicitar recuperación de contraseña
   */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al enviar solicitud';
      return { success: false, error: message };
    }
  };

  /**
   * Restablecer contraseña
   */
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Error al restablecer contraseña';
      return { success: false, error: message };
    }
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (roles) => {
    if (!user?.role) return false;
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    return roles.includes(user.role);
  };

  /**
   * Verificar si es admin
   */
  const isAdmin = () => hasRole('admin');

  /**
   * Verificar si es abogado
   */
  const isLawyer = () => hasRole('lawyer');

  /**
   * Verificar si es cliente
   */
  const isClient = () => hasRole('client');

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    hasRole,
    isAdmin,
    isLawyer,
    isClient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
