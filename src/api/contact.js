import api from './axiosConfig';

export const contactApi = {
  // Público - Enviar mensaje de contacto
  send: (data) => api.post('/contact', data),

  // Admin - Obtener estadísticas
  getStats: () => api.get('/contact/admin/stats'),

  // Admin - Obtener todos los mensajes
  getAll: (params) => api.get('/contact/admin', { params }),

  // Admin - Obtener mensaje por ID
  getById: (id) => api.get(`/contact/admin/${id}`),

  // Admin - Actualizar estado
  updateStatus: (id, status) => api.patch(`/contact/admin/${id}/status`, { status }),

  // Admin - Asignar a usuario
  assign: (id, userId) => api.patch(`/contact/admin/${id}/assign`, { user_id: userId }),

  // Admin - Responder mensaje
  respond: (id, response) => api.post(`/contact/admin/${id}/respond`, { response }),

  // Admin - Eliminar mensaje
  delete: (id) => api.delete(`/contact/admin/${id}`),
};

export default contactApi;
