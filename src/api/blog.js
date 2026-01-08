import api from './axiosConfig';

// ===========================================
// API DE BLOG - CATEGORÍAS
// ===========================================

export const blogCategoriesApi = {
  // Público
  getAll: () =>
    api.get('/blog/categories'),

  getBySlug: (slug) =>
    api.get(`/blog/categories/${slug}`),

  // Admin
  create: (data) =>
    api.post('/blog/categories/admin', data),

  update: (id, data) =>
    api.put(`/blog/categories/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/blog/categories/admin/${id}`)
};

// ===========================================
// API DE BLOG - POSTS
// ===========================================

export const blogPostsApi = {
  // Público
  getAll: (params = {}) =>
    api.get('/blog/posts', { params }),

  getBySlug: (slug) =>
    api.get(`/blog/posts/${slug}`),

  getRecent: (limit = 5) =>
    api.get('/blog/recent', { params: { limit } }),

  // Admin
  getAllAdmin: (params = {}) =>
    api.get('/blog/posts/admin/all', { params }),

  getById: (id) =>
    api.get(`/blog/posts/admin/${id}`),

  create: (data) =>
    api.post('/blog/posts/admin', data),

  update: (id, data) =>
    api.put(`/blog/posts/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/blog/posts/admin/${id}`),

  updateStatus: (id, status) =>
    api.patch(`/blog/posts/admin/${id}/status`, { status })
};

// ===========================================
// API DE CASOS DE ÉXITO
// ===========================================

export const successCasesApi = {
  // Público
  getAll: (params = {}) =>
    api.get('/success-cases', { params }),

  getBySlug: (slug) =>
    api.get(`/success-cases/${slug}`),

  // Admin
  getAllAdmin: () =>
    api.get('/success-cases/admin/all'),

  getById: (id) =>
    api.get(`/success-cases/admin/${id}`),

  create: (data) =>
    api.post('/success-cases/admin', data),

  update: (id, data) =>
    api.put(`/success-cases/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/success-cases/admin/${id}`),

  reorder: (items) =>
    api.put('/success-cases/admin/reorder', { items }),

  toggleActive: (id) =>
    api.patch(`/success-cases/admin/${id}/toggle-active`),

  toggleFeatured: (id) =>
    api.patch(`/success-cases/admin/${id}/toggle-featured`)
};

// ===========================================
// API DE TESTIMONIOS
// ===========================================

export const testimonialsApi = {
  // Público
  getAll: (params = {}) =>
    api.get('/testimonials', { params }),

  getById: (id) =>
    api.get(`/testimonials/${id}`),

  // Admin
  getAllAdmin: () =>
    api.get('/testimonials/admin/all'),

  getByIdAdmin: (id) =>
    api.get(`/testimonials/admin/${id}`),

  create: (data) =>
    api.post('/testimonials/admin', data),

  update: (id, data) =>
    api.put(`/testimonials/admin/${id}`, data),

  delete: (id) =>
    api.delete(`/testimonials/admin/${id}`),

  reorder: (items) =>
    api.put('/testimonials/admin/reorder', { items }),

  toggleActive: (id) =>
    api.patch(`/testimonials/admin/${id}/toggle-active`),

  toggleFeatured: (id) =>
    api.patch(`/testimonials/admin/${id}/toggle-featured`)
};
