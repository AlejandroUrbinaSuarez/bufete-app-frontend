import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  HiCalendar, HiClock, HiUser, HiCheck, HiX, HiEye,
  HiPlus, HiTrash, HiFilter
} from 'react-icons/hi';
import { appointmentsAdminApi, slotsApi } from '../../api/appointments';
import { lawyersApi } from '../../api/services';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  no_show: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
};

export default function ManageAppointmentsPage() {
  const [activeTab, setActiveTab] = useState('appointments');

  // Estado citas
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    lawyer_id: '',
    date_from: null,
    date_to: null,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Estado disponibilidad
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotForm, setSlotForm] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadLawyers();
    if (activeTab === 'appointments') {
      loadAppointments();
      loadStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    if (selectedLawyer) {
      loadSlots(selectedLawyer.id);
    }
  }, [selectedLawyer]);

  const loadLawyers = async () => {
    try {
      const res = await lawyersApi.getAllAdmin();
      setLawyers(res.data.lawyers || res.data);
    } catch (error) {
      console.error('Error cargando abogados:', error);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 15,
        ...filters,
        date_from: filters.date_from?.toISOString().split('T')[0],
        date_to: filters.date_to?.toISOString().split('T')[0],
      };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

      const res = await appointmentsAdminApi.getAll(params);
      setAppointments(res.data.appointments);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Error cargando citas:', error);
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await appointmentsAdminApi.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadSlots = async (lawyerId) => {
    setLoadingSlots(true);
    try {
      const res = await slotsApi.getByLawyer(lawyerId);
      setSlots(res.data);
    } catch (error) {
      console.error('Error cargando slots:', error);
      toast.error('Error al cargar horarios');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentsAdminApi.updateStatus(id, status);
      toast.success('Estado actualizado');
      loadAppointments();
      loadStats();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await appointmentsAdminApi.delete(id);
      toast.success('Cita eliminada');
      loadAppointments();
      loadStats();
    } catch (error) {
      toast.error('Error al eliminar cita');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await slotsApi.create({
        lawyer_id: selectedLawyer.id,
        ...slotForm,
      });
      toast.success('Horario creado');
      loadSlots(selectedLawyer.id);
      setShowSlotModal(false);
      setSlotForm({ day_of_week: 1, start_time: '09:00', end_time: '10:00' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear horario');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await slotsApi.delete(id);
      toast.success('Horario eliminado');
      loadSlots(selectedLawyer.id);
    } catch (error) {
      toast.error('Error al eliminar horario');
    }
  };

  const handleToggleSlot = async (slot) => {
    try {
      await slotsApi.update(slot.id, { is_active: !slot.is_active });
      loadSlots(selectedLawyer.id);
    } catch (error) {
      toast.error('Error al actualizar horario');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Citas</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HiCalendar className="inline w-5 h-5 mr-2" />
            Citas ({stats.total || 0})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'availability'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HiClock className="inline w-5 h-5 mr-2" />
            Disponibilidad
          </button>
        </nav>
      </div>

      {/* Tab: Citas */}
      {activeTab === 'appointments' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <p className="text-2xl font-bold text-yellow-800">{stats.pending || 0}</p>
              <p className="text-sm text-yellow-600">Pendientes</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <p className="text-2xl font-bold text-green-800">{stats.confirmed || 0}</p>
              <p className="text-sm text-green-600">Confirmadas</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <p className="text-2xl font-bold text-blue-800">{stats.today || 0}</p>
              <p className="text-sm text-blue-600">Hoy</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <p className="text-2xl font-bold text-purple-800">{stats.this_week || 0}</p>
              <p className="text-sm text-purple-600">Esta semana</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center gap-2 mb-4">
              <HiFilter className="text-gray-500" />
              <span className="font-medium">Filtros</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={filters.lawyer_id}
                onChange={(e) => setFilters({ ...filters, lawyer_id: e.target.value })}
                className="input-field"
              >
                <option value="">Todos los abogados</option>
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
              <DatePicker
                selected={filters.date_from}
                onChange={(date) => setFilters({ ...filters, date_from: date })}
                placeholderText="Desde fecha"
                className="input-field w-full"
                dateFormat="dd/MM/yyyy"
              />
              <DatePicker
                selected={filters.date_to}
                onChange={(date) => setFilters({ ...filters, date_to: date })}
                placeholderText="Hasta fecha"
                className="input-field w-full"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <button
              onClick={() => setFilters({ status: '', lawyer_id: '', date_from: null, date_to: null })}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>

          {/* Tabla de citas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay citas que coincidan con los filtros
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abogado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(apt.appointment_date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {apt.client?.first_name
                            ? `${apt.client.first_name} ${apt.client.last_name}`
                            : apt.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.client?.email || apt.client_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {apt.lawyer?.photo_url ? (
                            <img src={apt.lawyer.photo_url} alt="" className="w-8 h-8 rounded-full mr-2" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                              <HiUser className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <span className="text-sm">{apt.lawyer?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={apt.status}
                          onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 ${STATUS_COLORS[apt.status]}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="text-primary hover:text-primary-dark mr-3"
                          title="Ver detalles"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Mostrando página {pagination.page} de {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: Disponibilidad */}
      {activeTab === 'availability' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de abogados */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-900 mb-4">Abogados</h3>
            <div className="space-y-2">
              {lawyers.map((lawyer) => (
                <button
                  key={lawyer.id}
                  onClick={() => setSelectedLawyer(lawyer)}
                  className={`w-full p-3 rounded-lg text-left flex items-center ${
                    selectedLawyer?.id === lawyer.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {lawyer.photo_url ? (
                    <img src={lawyer.photo_url} alt="" className="w-10 h-10 rounded-full mr-3" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                      <HiUser className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{lawyer.full_name}</p>
                    <p className={`text-sm ${selectedLawyer?.id === lawyer.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {lawyer.specialization}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Horarios del abogado seleccionado */}
          <div className="md:col-span-2">
            {!selectedLawyer ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Selecciona un abogado para ver y configurar su disponibilidad
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">
                    Horarios de {selectedLawyer.full_name}
                  </h3>
                  <button
                    onClick={() => setShowSlotModal(true)}
                    className="btn-primary flex items-center"
                  >
                    <HiPlus className="w-5 h-5 mr-1" />
                    Agregar Horario
                  </button>
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No hay horarios configurados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {DAYS.map((dayName, dayIndex) => {
                      const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
                      if (daySlots.length === 0) return null;

                      return (
                        <div key={dayIndex} className="border rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{dayName}</h4>
                          <div className="flex flex-wrap gap-2">
                            {daySlots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  slot.is_active
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <span className={slot.is_active ? 'text-green-800' : 'text-gray-500'}>
                                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                                </span>
                                <button
                                  onClick={() => handleToggleSlot(slot)}
                                  className={`p-1 rounded ${
                                    slot.is_active
                                      ? 'text-green-600 hover:bg-green-100'
                                      : 'text-gray-400 hover:bg-gray-200'
                                  }`}
                                  title={slot.is_active ? 'Desactivar' : 'Activar'}
                                >
                                  {slot.is_active ? (
                                    <HiCheck className="w-4 h-4" />
                                  ) : (
                                    <HiX className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  title="Eliminar"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Nuevo Slot */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">Agregar Horario</h3>
            <form onSubmit={handleCreateSlot}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de la semana
                </label>
                <select
                  value={slotForm.day_of_week}
                  onChange={(e) => setSlotForm({ ...slotForm, day_of_week: parseInt(e.target.value) })}
                  className="input-field"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Cita */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">Detalle de Cita</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium">
                    {selectedAppointment.start_time?.slice(0, 5)} - {selectedAppointment.end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">
                  {selectedAppointment.client?.first_name
                    ? `${selectedAppointment.client.first_name} ${selectedAppointment.client.last_name}`
                    : selectedAppointment.client_name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.client?.email || selectedAppointment.client_email}
                </p>
                {(selectedAppointment.client?.phone || selectedAppointment.client_phone) && (
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.client?.phone || selectedAppointment.client_phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Abogado</p>
                <p className="font-medium">{selectedAppointment.lawyer?.full_name}</p>
              </div>
              {selectedAppointment.service && (
                <div>
                  <p className="text-sm text-gray-500">Servicio</p>
                  <p className="font-medium">{selectedAppointment.service.name}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedAppointment.status]}`}>
                  {STATUS_LABELS[selectedAppointment.status]}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
