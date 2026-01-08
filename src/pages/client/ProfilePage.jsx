import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HiUser, HiMail, HiPhone, HiKey, HiCheck,
  HiPencil, HiX, HiShieldCheck, HiClock
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users';

const ProfilePage = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersApi.updateProfile(formData);
      toast.success('Perfil actualizado');
      setEditMode(false);
      if (checkAuth) {
        await checkAuth();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate
    const errors = {};
    if (!passwordData.current_password) {
      errors.current_password = 'Ingresa tu contraseña actual';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'Ingresa la nueva contraseña';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Mínimo 8 caracteres';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      toast.success('Contraseña actualizada');
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      first_name: user?.first_name || user?.firstName || '',
      last_name: user?.last_name || user?.lastName || '',
      phone: user?.phone || '',
    });
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Administra tu información personal</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Header with avatar */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <HiUser className="w-10 h-10 text-white" />
            </div>
            <div className="ml-4 text-white">
              <h2 className="text-xl font-bold">
                {user.first_name || user.firstName} {user.last_name || user.lastName}
              </h2>
              <p className="opacity-90">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          {!editMode ? (
            // View Mode
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Información Personal</h3>
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-ghost text-sm flex items-center"
                >
                  <HiPencil className="w-4 h-4 mr-1" />
                  Editar
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <HiUser className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-900">
                      {user.first_name || user.firstName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <HiUser className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Apellido</p>
                    <p className="font-medium text-gray-900">
                      {user.last_name || user.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <HiMail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <HiPhone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">
                      {user.phone || 'No registrado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSaveProfile}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Editar Información</h3>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn-ghost text-sm flex items-center"
                >
                  <HiX className="w-4 h-4 mr-1" />
                  Cancelar
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ej: +1 234 567 8900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <HiCheck className="w-5 h-5 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <HiShieldCheck className="w-6 h-6 text-primary mr-2" />
            <h3 className="font-bold text-gray-900">Seguridad</h3>
          </div>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <HiKey className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Contraseña</p>
                <p className="text-sm text-gray-500">
                  Cambia tu contraseña regularmente para mayor seguridad
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-outline text-sm"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.current_password ? 'border-red-500' : ''}`}
              />
              {passwordErrors.current_password && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.current_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.new_password ? 'border-red-500' : ''}`}
              />
              {passwordErrors.new_password && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.new_password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className={`input-field ${passwordErrors.confirm_password ? 'border-red-500' : ''}`}
              />
              {passwordErrors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm_password}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                  setPasswordErrors({});
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Información de Cuenta</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500">Estado de la cuenta</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Activa
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500">Email verificado</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.email_verified || user.emailVerified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.email_verified || user.emailVerified ? 'Verificado' : 'Pendiente'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-500">Tipo de cuenta</span>
            <span className="text-gray-900">Cliente</span>
          </div>
          {user.created_at && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">Miembro desde</span>
              <span className="text-gray-900 flex items-center">
                <HiClock className="w-4 h-4 mr-1 text-gray-400" />
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
