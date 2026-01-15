import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HiPlus, HiPencil, HiTrash, HiEye, HiSearch,
  HiFilter, HiRefresh, HiX, HiUser, HiClock,
  HiTag, HiClipboardList, HiCalendar, HiDocumentText
} from 'react-icons/hi';
import { casesApi } from '../../api/cases';
import { servicesApi } from '../../api/services';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-gray-100 text-gray-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  on_hold: 'En Espera',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const UPDATE_TYPES = [
  { value: 'status_change', label: 'Cambio de estado', icon: HiTag },
  { value: 'note', label: 'Nota', icon: HiClipboardList },
  { value: 'milestone', label: 'Hito', icon: HiCalendar },
  { value: 'document', label: 'Documento', icon: HiDocumentText },
  { value: 'meeting', label: 'Reunión', icon: HiClock },
];

const ManageCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    lawyer_id: '',
    service_id: '',
    status: 'pending',
    priority: 'medium',
    confidentiality_level: 'normal',
    start_date: '',
    expected_end_date: '',
  });

  // Update form state
  const [updateData, setUpdateData] = useState({
    update_type: 'note',
    description: '',
    is_internal: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesRes, usersRes, servicesRes] = await Promise.all([
        casesApi.admin.getAll(),
        casesApi.admin.getUsers ? casesApi.admin.getUsers() : Promise.resolve({ data: [] }),
        servicesApi.getAll(),
      ]);

      // El backend devuelve {cases: [...], pagination: {...}}
      setCases(casesRes.data?.cases || casesRes.data || []);

      // Separate clients and lawyers from users
      const users = usersRes.data || [];
      setClients(users.filter(u => u.role === 'client'));
      setLawyers(users.filter(u => u.role === 'lawyer' || u.role === 'admin'));

      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setEditingCase(null);
    setFormData({
      title: '',
      description: '',
      client_id: '',
      lawyer_id: '',
      service_id: '',
      status: 'pending',
      priority: 'medium',
      confidentiality_level: 'normal',
      start_date: new Date().toISOString().split('T')[0],
      expected_end_date: '',
    });
    setShowModal(true);
  };

  const openEditModal = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      title: caseItem.title || '',
      description: caseItem.description || '',
      client_id: caseItem.client_id || '',
      lawyer_id: caseItem.lawyer_id || '',
      service_id: caseItem.service_id || '',
      status: caseItem.status || 'pending',
      priority: caseItem.priority || 'medium',
      confidentiality_level: caseItem.confidentiality_level || 'normal',
      start_date: caseItem.start_date?.split('T')[0] || '',
      expected_end_date: caseItem.expected_end_date?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const openDetailModal = async (caseItem) => {
    try {
      const res = await casesApi.admin.getById(caseItem.id);
      setSelectedCase(res.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Error al cargar detalles del caso');
    }
  };

  const openUpdateModal = (caseItem) => {
    setSelectedCase(caseItem);
    setUpdateData({
      update_type: 'note',
      description: '',
      is_internal: false,
    });
    setShowUpdateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCase) {
        await casesApi.admin.update(editingCase.id, formData);
        toast.success('Caso actualizado');
      } else {
        await casesApi.admin.create(formData);
        toast.success('Caso creado');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateData.description.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setSaving(true);
    try {
      await casesApi.admin.addUpdate(selectedCase.id, updateData);
      toast.success('Actualización agregada');
      setShowUpdateModal(false);
      loadData();
    } catch (error) {
      toast.error('Error al agregar actualización');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este caso?')) return;

    try {
      await casesApi.admin.delete(id);
      toast.success('Caso eliminado');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el caso');
    }
  };

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.case_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.client?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.client?.last_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Casos</h1>
          <p className="text-gray-600 mt-1">
            {cases.length} casos en total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="btn-ghost p-2" title="Actualizar">
            <HiRefresh className="w-5 h-5" />
          </button>
          <button onClick={openCreateModal} className="btn-primary flex items-center">
            <HiPlus className="w-5 h-5 mr-2" />
            Nuevo Caso
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, título o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron casos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Caso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Abogado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{caseItem.title}</p>
                      <p className="text-sm text-gray-500 font-mono">{caseItem.case_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <HiUser className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {caseItem.client?.first_name} {caseItem.client?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{caseItem.client?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {caseItem.lawyer ? (
                        <p className="text-sm text-gray-900">
                          {caseItem.lawyer.first_name} {caseItem.lawyer.last_name}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[caseItem.status]}`}>
                        {STATUS_LABELS[caseItem.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[caseItem.priority]}`}>
                        {PRIORITY_LABELS[caseItem.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {caseItem.start_date
                        ? new Date(caseItem.start_date).toLocaleDateString('es-ES')
                        : new Date(caseItem.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetailModal(caseItem)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
                          title="Ver detalles"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openUpdateModal(caseItem)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                          title="Agregar actualización"
                        >
                          <HiClipboardList className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(caseItem)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 rounded-lg"
                          title="Editar"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(caseItem.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                          title="Eliminar"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingCase ? 'Editar Caso' : 'Nuevo Caso'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Caso *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abogado Asignado
                  </label>
                  <select
                    name="lawyer_id"
                    value={formData.lawyer_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Sin asignar</option>
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.first_name} {lawyer.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio
                  </label>
                  <select
                    name="service_id"
                    value={formData.service_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Seleccionar servicio</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidencialidad
                  </label>
                  <select
                    name="confidentiality_level"
                    value={formData.confidentiality_level}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="normal">Normal</option>
                    <option value="confidential">Confidencial</option>
                    <option value="highly_confidential">Altamente Confidencial</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Estimada de Cierre
                  </label>
                  <input
                    type="date"
                    name="expected_end_date"
                    value={formData.expected_end_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
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

      {/* Add Update Modal */}
      {showUpdateModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Agregar Actualización</h2>
                <p className="text-sm text-gray-500">{selectedCase.case_number}</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Actualización
                </label>
                <select
                  name="update_type"
                  value={updateData.update_type}
                  onChange={handleUpdateChange}
                  className="input-field"
                >
                  {UPDATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={updateData.description}
                  onChange={handleUpdateChange}
                  rows="4"
                  className="input-field"
                  placeholder="Describe la actualización..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_internal"
                  name="is_internal"
                  checked={updateData.is_internal}
                  onChange={handleUpdateChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="is_internal" className="ml-2 text-sm text-gray-700">
                  Solo visible para el equipo (no visible para el cliente)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Agregando...' : 'Agregar Actualización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500 font-mono">
                    {selectedCase.case_number}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[selectedCase.status]}`}>
                    {STATUS_LABELS[selectedCase.status]}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedCase.title}</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="font-medium">
                    {selectedCase.client?.first_name} {selectedCase.client?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedCase.client?.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Abogado Asignado</p>
                  {selectedCase.lawyer ? (
                    <>
                      <p className="font-medium">
                        {selectedCase.lawyer.first_name} {selectedCase.lawyer.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedCase.lawyer.email}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">Sin asignar</p>
                  )}
                </div>
              </div>

              {selectedCase.description && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-600">{selectedCase.description}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Timeline de Actualizaciones</h3>
                {selectedCase.updates?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCase.updates.map((update) => (
                      <div key={update.id} className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          update.update_type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                          update.update_type === 'milestone' ? 'bg-green-100 text-green-600' :
                          update.update_type === 'meeting' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <HiClipboardList className="w-4 h-4" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-900">{update.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              {new Date(update.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {update.creator && (
                              <span>por {update.creator.first_name}</span>
                            )}
                            {update.is_internal && (
                              <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                                Interno
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay actualizaciones</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openUpdateModal(selectedCase);
                }}
                className="btn-outline"
              >
                Agregar Actualización
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedCase);
                }}
                className="btn-primary"
              >
                Editar Caso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCasesPage;
