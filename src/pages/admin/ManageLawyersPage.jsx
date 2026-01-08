import { useState, useEffect } from 'react';
import { lawyersApi, servicesApi } from '../../api/services';

const ManageLawyersPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    specialty: '',
    bar_number: '',
    photo_url: '',
    bio: '',
    experience_years: '',
    education: '',
    languages: '',
    email: '',
    phone: '',
    linkedin_url: '',
    is_active: true,
    display_order: 0,
    service_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lawyersRes, servicesRes] = await Promise.all([
        lawyersApi.getAllAdmin(),
        servicesApi.getAllAdmin()
      ]);
      setLawyers(lawyersRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lawyer = null) => {
    if (lawyer) {
      setEditingLawyer(lawyer);
      setFormData({
        full_name: lawyer.full_name || '',
        specialty: lawyer.specialty || '',
        bar_number: lawyer.bar_number || '',
        photo_url: lawyer.photo_url || '',
        bio: lawyer.bio || '',
        experience_years: lawyer.experience_years || '',
        education: lawyer.education || '',
        languages: lawyer.languages || '',
        email: lawyer.email || '',
        phone: lawyer.phone || '',
        linkedin_url: lawyer.linkedin_url || '',
        is_active: lawyer.is_active !== false,
        display_order: lawyer.display_order || 0,
        service_ids: lawyer.services?.map(s => s.id) || []
      });
    } else {
      setEditingLawyer(null);
      setFormData({
        full_name: '',
        specialty: '',
        bar_number: '',
        photo_url: '',
        bio: '',
        experience_years: '',
        education: '',
        languages: '',
        email: '',
        phone: '',
        linkedin_url: '',
        is_active: true,
        display_order: lawyers.length,
        service_ids: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLawyer(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      };

      if (editingLawyer) {
        await lawyersApi.update(editingLawyer.id, data);
      } else {
        await lawyersApi.create(data);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el abogado');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este abogado?')) return;

    try {
      await lawyersApi.delete(id);
      fetchData();
    } catch (err) {
      setError('Error al eliminar el abogado');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await lawyersApi.toggleActive(id);
      fetchData();
    } catch (err) {
      setError('Error al cambiar el estado');
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
        <h1 className="text-2xl font-heading">Gestión de Abogados</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm">
          + Nuevo Abogado
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
                Abogado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experiencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lawyers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No hay abogados registrados. Haga clic en "Nuevo Abogado" para agregar uno.
                </td>
              </tr>
            ) : (
              lawyers.map((lawyer) => (
                <tr key={lawyer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-primary-100">
                        {lawyer.photo_url ? (
                          <img
                            src={lawyer.photo_url}
                            alt={lawyer.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-600 text-lg font-semibold">
                            {lawyer.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lawyer.full_name}</div>
                        <div className="text-sm text-gray-500">{lawyer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lawyer.specialty || '-'}</div>
                    {lawyer.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lawyer.services.slice(0, 2).map(s => (
                          <span key={s.id} className="badge-primary text-xs">
                            {s.name}
                          </span>
                        ))}
                        {lawyer.services.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{lawyer.services.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lawyer.experience_years ? `${lawyer.experience_years} años` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(lawyer.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lawyer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {lawyer.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(lawyer)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(lawyer.id)}
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
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-heading">
                {editingLawyer ? 'Editar Abogado' : 'Nuevo Abogado'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre Completo *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Especialidad</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ej: Derecho Civil y Familia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">N° Colegiado</label>
                  <input
                    type="text"
                    name="bar_number"
                    value={formData.bar_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Años de Experiencia</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="input"
                    min={0}
                  />
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
                <label className="label">Biografía</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="Breve descripción profesional"
                />
              </div>

              <div>
                <label className="label">Formación Académica</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                  placeholder="Universidad, títulos, certificaciones..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Idiomas</label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    className="input"
                    placeholder="Español, Inglés, Francés..."
                  />
                </div>
                <div>
                  <label className="label">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div>
                <label className="label">Áreas de Práctica</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {services.map(service => (
                    <label
                      key={service.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                        formData.service_ids.includes(service.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.service_ids.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm">{service.name}</span>
                    </label>
                  ))}
                </div>
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
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm">Perfil Activo (visible en la web)</span>
                  </label>
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
                  {saving ? 'Guardando...' : editingLawyer ? 'Actualizar' : 'Crear Abogado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLawyersPage;
