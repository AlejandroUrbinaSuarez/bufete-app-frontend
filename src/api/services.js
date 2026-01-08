import api from './axiosConfig';

export const servicesApi = {
  // Público
  getAll: (featured = false) =>
    api.get('/services', { params: { featured: featured ? 'true' : undefined } }),

  getBySlug: (slug) =>
    api.get(`/services/${slug}`),

  // Admin
  getAllAdmin: () =>
    api.get('/services/admin/all'),

  getById: (id) =>
    api.get(`/services/admin/${id}`),

  create: (data) =>
    api.post('/services/admin', data),

  update: (id, data) =>
    api.put(`/services/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/services/admin/${id}`),

  reorder: (items) =>
    api.put('/services/admin/reorder', { items }),

  toggleActive: (id) =>
    api.patch(`/services/admin/${id}/toggle-active`),

  toggleFeatured: (id) =>
    api.patch(`/services/admin/${id}/toggle-featured`)
};

export const lawyersApi = {
  // Público
  getAll: () =>
    api.get('/lawyers'),

  getBySlug: (slug) =>
    api.get(`/lawyers/${slug}`),

  // Admin
  getAllAdmin: () =>
    api.get('/lawyers/admin/all'),

  getById: (id) =>
    api.get(`/lawyers/admin/${id}`),

  create: (data) =>
    api.post('/lawyers/admin', data),

  update: (id, data) =>
    api.put(`/lawyers/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/lawyers/admin/${id}`),

  reorder: (items) =>
    api.put('/lawyers/admin/reorder', { items }),

  toggleActive: (id) =>
    api.patch(`/lawyers/admin/${id}/toggle-active`)
};
