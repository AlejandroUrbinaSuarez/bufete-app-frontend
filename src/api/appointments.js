import api from './axiosConfig';

// ==================== PÚBLICO ====================

export const appointmentsApi = {
  // Obtener abogados disponibles para citas
  getLawyers: () => api.get('/appointments/lawyers'),

  // Obtener disponibilidad de un abogado para una fecha
  getAvailability: (lawyerId, date) =>
    api.get(`/appointments/availability/${lawyerId}`, { params: { date } }),

  // Crear cita
  create: (data) => api.post('/appointments', data),

  // Cancelar cita
  cancel: (id, data) => api.post(`/appointments/${id}/cancel`, data),

  // Obtener mis citas (cliente autenticado)
  getMyAppointments: () => api.get('/appointments/my'),
};

// ==================== ADMIN ====================

export const appointmentsAdminApi = {
  // Obtener todas las citas
  getAll: (params) => api.get('/appointments/admin', { params }),

  // Obtener cita por ID
  getById: (id) => api.get(`/appointments/admin/${id}`),

  // Actualizar estado
  updateStatus: (id, status) =>
    api.patch(`/appointments/admin/${id}/status`, { status }),

  // Actualizar cita
  update: (id, data) => api.put(`/appointments/admin/${id}`, data),

  // Eliminar cita
  delete: (id) => api.delete(`/appointments/admin/${id}`),

  // Estadísticas
  getStats: () => api.get('/appointments/admin/stats'),
};

// ==================== SLOTS (ADMIN) ====================

export const slotsApi = {
  // Obtener slots de un abogado
  getByLawyer: (lawyerId) => api.get(`/appointments/admin/slots/${lawyerId}`),

  // Crear slot
  create: (data) => api.post('/appointments/admin/slots', data),

  // Actualizar slot
  update: (id, data) => api.put(`/appointments/admin/slots/${id}`, data),

  // Eliminar slot
  delete: (id) => api.delete(`/appointments/admin/slots/${id}`),

  // Copiar slots de un abogado a otro
  copy: (fromLawyerId, toLawyerId) =>
    api.post('/appointments/admin/slots/copy', {
      from_lawyer_id: fromLawyerId,
      to_lawyer_id: toLawyerId,
    }),
};

export default appointmentsApi;
