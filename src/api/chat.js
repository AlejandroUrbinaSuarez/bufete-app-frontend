import api from './axiosConfig';

export const chatApi = {
  // Obtener sesiones activas
  getActiveSessions: () => api.get('/chat/sessions/active'),

  // Obtener todas las sesiones
  getSessions: (params) => api.get('/chat/sessions', { params }),

  // Obtener una sesión por ID
  getSessionById: (id) => api.get(`/chat/sessions/${id}`),

  // Obtener estadísticas de chat
  getStats: () => api.get('/chat/stats'),

  // Asignar agente a sesión
  assignAgent: (id, agentId) => api.put(`/chat/sessions/${id}/assign`, { agentId }),

  // Cerrar sesión
  closeSession: (id) => api.put(`/chat/sessions/${id}/close`),

  // Eliminar sesión
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
};

export default chatApi;
