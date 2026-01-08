import api from './axiosConfig';

// ==================== CLIENTE ====================

export const casesApi = {
  // Obtener mis casos
  getMyCases: () => api.get('/cases/my'),

  // Obtener detalle de mi caso
  getMyCaseById: (id) => api.get(`/cases/my/${id}`),

  // Obtener mensajes de mi caso
  getMessages: (caseId) => api.get(`/cases/my/${caseId}/messages`),

  // Enviar mensaje en mi caso
  sendMessage: (caseId, message) =>
    api.post(`/cases/my/${caseId}/messages`, { message }),

  // Contar mensajes no leídos
  getUnreadCount: () => api.get('/cases/my/unread-count'),

  // Subir documento
  uploadDocument: (caseId, file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return api.post(`/cases/my/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Descargar documento
  downloadDocument: (caseId, docId) =>
    api.get(`/cases/my/${caseId}/documents/${docId}/download`, {
      responseType: 'blob'
    }),
};

// ==================== ADMIN ====================

export const casesAdminApi = {
  // Obtener todos los casos
  getAll: (params) => api.get('/cases/admin', { params }),

  // Obtener caso por ID
  getById: (id) => api.get(`/cases/admin/${id}`),

  // Crear caso
  create: (data) => api.post('/cases/admin', data),

  // Actualizar caso
  update: (id, data) => api.put(`/cases/admin/${id}`, data),

  // Eliminar caso
  delete: (id) => api.delete(`/cases/admin/${id}`),

  // Estadísticas
  getStats: () => api.get('/cases/admin/stats'),

  // Agregar actualización
  addUpdate: (caseId, data) =>
    api.post(`/cases/admin/${caseId}/updates`, data),

  // Enviar mensaje
  sendMessage: (caseId, message) =>
    api.post(`/cases/admin/${caseId}/messages`, { message }),

  // Subir documento
  uploadDocument: (caseId, file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    return api.post(`/cases/admin/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Descargar documento
  downloadDocument: (caseId, docId) =>
    api.get(`/cases/admin/${caseId}/documents/${docId}/download`, {
      responseType: 'blob'
    }),

  // Eliminar documento
  deleteDocument: (caseId, docId) =>
    api.delete(`/cases/admin/${caseId}/documents/${docId}`),

  // Obtener usuarios (clientes y abogados)
  getUsers: () => api.get('/users/admin/list'),
};

// Agregar admin como propiedad de casesApi para acceso unificado
casesApi.admin = casesAdminApi;

export default casesApi;
