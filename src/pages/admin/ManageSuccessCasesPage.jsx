import { useState, useEffect } from 'react';
import { successCasesApi } from '../../api/blog';
import { servicesApi } from '../../api/services';

const ManageSuccessCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    result: '',
    service_id: '',
    image_url: '',
    year: new Date().getFullYear(),
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
      const [casesRes, servicesRes] = await Promise.all([
        successCasesApi.getAllAdmin(),
        servicesApi.getAllAdmin()
      ]);
      setCases(casesRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (caseItem = null) => {
    if (caseItem) {
      setEditingCase(caseItem);
      setFormData({
        title: caseItem.title || '',
        description: caseItem.description || '',
        result: caseItem.result || '',
        service_id: caseItem.service_id || '',
        image_url: caseItem.image_url || '',
        year: caseItem.year || new Date().getFullYear(),
        is_featured: caseItem.is_featured || false,
        is_active: caseItem.is_active !== false,
        display_order: caseItem.display_order || 0
      });
    } else {
      setEditingCase(null);
      setFormData({
        title: '',
        description: '',
        result: '',
        service_id: '',
        image_url: '',
        year: new Date().getFullYear(),
        is_featured: false,
        is_active: true,
        display_order: cases.length
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCase(null);
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
      if (editingCase) {
        await successCasesApi.update(editingCase.id, formData);
      } else {
        await successCasesApi.create(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el caso');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este caso de éxito?')) return;

    try {
      await successCasesApi.delete(id);
      fetchData();
    } catch (err) {
      setError('Error al eliminar el caso');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await successCasesApi.toggleActive(id);
      fetchData();
    } catch (err) {
      setError('Error al cambiar el estado');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await successCasesApi.toggleFeatured(id);
      fetchData();
    } catch (err) {
      setError('Error al cambiar destacado');
    }
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
        <h1 className="text-2xl font-heading">Casos de Éxito</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm">
          + Nuevo Caso
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No hay casos de éxito. Haga clic en "Nuevo Caso" para agregar uno.
                </td>
              </tr>
            ) : (
              cases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {caseItem.image_url && (
                        <img
                          src={caseItem.image_url}
                          alt=""
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{caseItem.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{caseItem.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.service?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.year || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(caseItem.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caseItem.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {caseItem.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFeatured(caseItem.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caseItem.is_featured
                          ? 'bg-gold-100 text-gold-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {caseItem.is_featured ? 'Destacado' : 'Normal'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(caseItem)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(caseItem.id)}
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
                {editingCase ? 'Editar Caso de Éxito' : 'Nuevo Caso de Éxito'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Título del Caso *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  placeholder="Descripción del caso (sin datos sensibles)"
                />
              </div>

              <div>
                <label className="label">Resultado Obtenido</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="Ej: Sentencia favorable, indemnización de $X, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="label">Año</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="input"
                    min={1990}
                    max={new Date().getFullYear()}
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

              <div className="grid grid-cols-2 gap-4">
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
                  <span className="text-sm">Destacado</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : editingCase ? 'Actualizar' : 'Crear Caso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSuccessCasesPage;
