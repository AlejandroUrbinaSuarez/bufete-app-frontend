import { useState, useEffect } from 'react';
import { testimonialsApi } from '../../api/blog';
import { servicesApi } from '../../api/services';

const ManageTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_title: '',
    content: '',
    rating: 5,
    photo_url: '',
    service_id: '',
    is_featured: false,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testimonialsRes, servicesRes] = await Promise.all([
        testimonialsApi.getAllAdmin(),
        servicesApi.getAllAdmin()
      ]);
      setTestimonials(testimonialsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        client_name: testimonial.client_name || '',
        client_title: testimonial.client_title || '',
        content: testimonial.content || '',
        rating: testimonial.rating || 5,
        photo_url: testimonial.photo_url || '',
        service_id: testimonial.service_id || '',
        is_featured: testimonial.is_featured || false,
        is_active: testimonial.is_active !== false,
        display_order: testimonial.display_order || 0
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        client_name: '',
        client_title: '',
        content: '',
        rating: 5,
        photo_url: '',
        service_id: '',
        is_featured: false,
        is_active: true,
        display_order: testimonials.length
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial.id, formData);
      } else {
        await testimonialsApi.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el testimonio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este testimonio?')) return;

    try {
      await testimonialsApi.delete(id);
      fetchData();
    } catch (err) {
      setError('Error al eliminar el testimonio');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await testimonialsApi.toggleActive(id);
      fetchData();
    } catch (err) {
      setError('Error al cambiar el estado');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await testimonialsApi.toggleFeatured(id);
      fetchData();
    } catch (err) {
      setError('Error al cambiar destacado');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-gold-500' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading">Testimonios</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm">
          + Nuevo Testimonio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Testimonio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No hay testimonios. Haga clic en "Nuevo Testimonio" para agregar uno.
                </td>
              </tr>
            ) : (
              testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testimonial.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {testimonial.photo_url ? (
                        <img
                          src={testimonial.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                          <span className="text-primary-600 font-medium">
                            {testimonial.client_name?.charAt(0) || 'C'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{testimonial.client_name}</div>
                        <div className="text-sm text-gray-500">{testimonial.client_title || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{testimonial.content}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderStars(testimonial.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(testimonial.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testimonial.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {testimonial.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(testimonial.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testimonial.is_featured
                          ? 'bg-gold-100 text-gold-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {testimonial.is_featured ? 'Destacado' : 'Normal'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(testimonial)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-heading">
                {editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre del Cliente *</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Cargo/Descripción</label>
                  <input
                    type="text"
                    name="client_title"
                    value={formData.client_title}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: Empresario, Caso de divorcio"
                  />
                </div>
              </div>

              <div>
                <label className="label">Testimonio *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  required
                  placeholder="Escriba el testimonio del cliente..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Calificación</label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="input"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} estrellas</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Servicio Relacionado</label>
                  <select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Sin servicio</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">URL de Foto</label>
                <input
                  type="url"
                  name="photo_url"
                  value={formData.photo_url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="label">Orden de Visualización</label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  className="input w-32"
                  min={0}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm">Activo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-gold-600 rounded"
                  />
                  <span className="text-sm">Destacado en Inicio</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : editingTestimonial ? 'Actualizar' : 'Crear Testimonio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTestimonialsPage;
