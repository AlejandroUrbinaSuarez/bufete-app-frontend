import api from './axiosConfig';

export const usersApi = {
  // Obtener perfil actual
  getProfile: () => api.get('/auth/me'),

  // Actualizar perfil
  updateProfile: (data) => api.put('/auth/profile', data),

  // Cambiar contraseña
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    }),
};
