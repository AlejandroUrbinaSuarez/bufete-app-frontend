import api from './axiosConfig';

export const statsApi = {
  // Estadísticas principales del dashboard
  getDashboardStats: () => api.get('/stats/dashboard'),

  // Estadísticas de casos
  getCaseStats: () => api.get('/stats/cases'),

  // Estadísticas de citas
  getAppointmentStats: () => api.get('/stats/appointments'),

  // Actividad reciente
  getRecentActivity: () => api.get('/stats/recent'),

  // Estadísticas de contenido
  getContentStats: () => api.get('/stats/content'),
};

export default statsApi;
