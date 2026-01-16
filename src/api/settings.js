import api from './axiosConfig';

export const settingsApi = {
  // Obtener configuraciones públicas (contacto, horarios)
  getPublic: () => api.get('/settings/public')
};
