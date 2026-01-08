import { useState, useEffect } from 'react';
import { servicesApi } from '../../api/services';

const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    icon: '',
    image_url: '',
    is_featured: false,
    is_active: true,
    display_order: 0,
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await servicesApi.getAllAdmin();
      setServices(response.data);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        short_description: service.short_description || '',
        description: service.description || '',
        icon: service.icon || '',
        image_url: service.image_url || '',
        is_featured: service.is_featured || false,
        is_active: service.is_active !== false,
        display_order: service.display_order || 0,
        meta_title: service.meta_title || '',
        meta_description: service.meta_description || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        short_description: '',
        description: '',
        icon: '',
        image_url: '',
        is_featured: false,
        is_active: true,
        display_order: services.length,
        meta_title: '',
        meta_description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      short_description: '',
      description: '',
      icon: '',
      image_url: '',
      is_featured: false,
      is_active: true,
      display_order: 0,
      meta_title: '',
      meta_description: ''
    });
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
      if (editingService) {
        await servicesApi.update(editingService.id, formData);
      } else {
        await servicesApi.create(formData);
      }
      handleCloseModal();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este servicio?')) return;

    try {
      await servicesApi.delete(id);
      fetchServices();
    } catch (err) {
      setError('Error al eliminar el servicio');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await servicesApi.toggleActive(id);
      fetchServices();
    } catch (err) {
      setError('Error al cambiar el estado');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await servicesApi.toggleFeatured(id);
      fetchServices();
    } catch (err) {
      setError('Error al cambiar destacado');
    }
  };

  const iconOptions = [
    { value: 'scale', label: 'Balanza' },
    { value: 'gavel', label: 'Mazo' },
    { value: 'briefcase', label: 'Maletín' },
    { value: 'users', label: 'Familia' },
    { value: 'building', label: 'Edificio' },
    { value: 'file-text', label: 'Documento' },
    { value: 'shield', label: 'Escudo' },
    { value: 'home', label: 'Casa' },
    { value: 'car', label: 'Auto' },
    { value: 'heart', label: 'Corazón' }
  ];

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
        <h1 className="text-2xl font-heading">Gestión de Servicios</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm">
          + Nuevo Servicio
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destacado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No hay servicios registrados. Haga clic en "Nuevo Servicio" para agregar uno.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600">
                          {service.icon === 'scale' && '⚖️'}
                          {service.icon === 'gavel' && '🔨'}
                          {service.icon === 'briefcase' && '💼'}
                          {service.icon === 'users' && '👥'}
                          {service.icon === 'building' && '🏢'}
                          {service.icon === 'file-text' && '📄'}
                          {service.icon === 'shield' && '🛡️'}
                          {service.icon === 'home' && '🏠'}
                          {service.icon === 'car' && '🚗'}
                          {service.icon === 'heart' && '❤️'}
                          {!service.icon && '📋'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(service.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(service.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.is_featured
                          ? 'bg-gold-100 text-gold-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {service.is_featured ? '★ Destacado' : 'Normal'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
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
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre del Servicio *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Descripción Corta</label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className="input"
                  maxLength={300}
                  placeholder="Breve descripción para las tarjetas"
                />
              </div>

              <div>
                <label className="label">Descripción Completa</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  placeholder="Descripción detallada del servicio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Icono</label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Seleccionar icono</option>
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Orden de Visualización</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    className="input"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="label">URL de Imagen</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm">Servicio Activo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-gold-600 rounded focus:ring-gold-500"
                  />
                  <span className="text-sm">Destacado en Inicio</span>
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Meta Título</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="input"
                      maxLength={150}
                    />
                  </div>
                  <div>
                    <label className="label">Meta Descripción</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      className="input"
                      rows={2}
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServicesPage;
