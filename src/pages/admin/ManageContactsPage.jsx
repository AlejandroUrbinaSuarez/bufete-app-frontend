import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HiMail, HiPhone, HiCalendar, HiEye, HiTrash,
  HiReply, HiArchive, HiSearch, HiX, HiClock
} from 'react-icons/hi';
import { contactApi } from '../../api/contact';

const STATUS_LABELS = {
  new: 'Nuevo',
  read: 'Leído',
  responded: 'Respondido',
  archived: 'Archivado'
};

const STATUS_COLORS = {
  new: 'bg-red-100 text-red-800',
  read: 'bg-yellow-100 text-yellow-800',
  responded: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600'
};

const ManageContactsPage = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, responded: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    loadData();
  }, [filter, pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [messagesRes, statsRes] = await Promise.all([
        contactApi.getAll({ status: filter || undefined, page: pagination.page, limit: pagination.limit }),
        contactApi.getStats()
      ]);

      setMessages(messagesRes.data.messages || []);
      setPagination(prev => ({
        ...prev,
        total: messagesRes.data.pagination?.total || 0,
        pages: messagesRes.data.pagination?.pages || 0
      }));
      setStats(statsRes.data || { total: 0, new: 0, read: 0, responded: 0, archived: 0 });
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (msg) => {
    try {
      const res = await contactApi.getById(msg.id);
      setSelectedMessage(res.data);
      setShowModal(true);
      // Refresh list to update status
      if (msg.status === 'new') {
        loadData();
      }
    } catch (error) {
      toast.error('Error al cargar mensaje');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await contactApi.updateStatus(id, status);
      toast.success('Estado actualizado');
      loadData();
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este mensaje?')) return;

    try {
      await contactApi.delete(id);
      toast.success('Mensaje eliminado');
      loadData();
      setShowModal(false);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleOpenResponse = (msg) => {
    setSelectedMessage(msg);
    setResponse('');
    setShowResponseModal(true);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!response.trim() || !selectedMessage) return;

    setSending(true);
    try {
      await contactApi.respond(selectedMessage.id, response.trim());
      toast.success('Respuesta enviada');
      setShowResponseModal(false);
      loadData();
    } catch (error) {
      toast.error('Error al enviar respuesta');
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-gray-900">Mensajes de Contacto</h1>
          <p className="text-gray-600 mt-1">
            {stats.new > 0 ? `${stats.new} mensaje${stats.new !== 1 ? 's' : ''} nuevo${stats.new !== 1 ? 's' : ''}` : 'Gestiona los mensajes recibidos'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setFilter('')}
          className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
            filter === '' ? 'border-primary' : 'border-transparent hover:border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div
          onClick={() => setFilter('new')}
          className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
            filter === 'new' ? 'border-primary' : 'border-transparent hover:border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.new}</p>
          <p className="text-sm text-gray-500">Nuevos</p>
        </div>
        <div
          onClick={() => setFilter('read')}
          className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
            filter === 'read' ? 'border-primary' : 'border-transparent hover:border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
          <p className="text-sm text-gray-500">Leídos</p>
        </div>
        <div
          onClick={() => setFilter('responded')}
          className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer border-2 transition-colors ${
            filter === 'responded' ? 'border-primary' : 'border-transparent hover:border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.responded}</p>
          <p className="text-sm text-gray-500">Respondidos</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <HiMail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay mensajes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remitente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asunto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} className={`hover:bg-gray-50 ${msg.status === 'new' ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{msg.name}</p>
                        <p className="text-sm text-gray-500">{msg.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 truncate max-w-xs">
                        {msg.subject || 'Sin asunto'}
                      </p>
                      {msg.service && (
                        <p className="text-sm text-gray-500">{msg.service.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[msg.status]}`}>
                        {STATUS_LABELS[msg.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewMessage(msg)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg"
                          title="Ver mensaje"
                        >
                          <HiEye className="w-5 h-5" />
                        </button>
                        {msg.status !== 'responded' && (
                          <button
                            onClick={() => handleOpenResponse(msg)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Responder"
                          >
                            <HiReply className="w-5 h-5" />
                          </button>
                        )}
                        {msg.status !== 'archived' && (
                          <button
                            onClick={() => handleUpdateStatus(msg.id, 'archived')}
                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
                            title="Archivar"
                          >
                            <HiArchive className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-outline btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="btn-outline btn-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-heading">Mensaje de Contacto</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Sender Info */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedMessage.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <HiMail className="w-4 h-4 mr-1" />
                        {selectedMessage.email}
                      </span>
                      {selectedMessage.phone && (
                        <span className="flex items-center">
                          <HiPhone className="w-4 h-4 mr-1" />
                          {selectedMessage.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[selectedMessage.status]}`}>
                    {STATUS_LABELS[selectedMessage.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <HiCalendar className="w-4 h-4 mr-1" />
                    {new Date(selectedMessage.created_at).toLocaleString('es-ES')}
                  </span>
                  {selectedMessage.service && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {selectedMessage.service.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">Asunto</p>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Mensaje</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Response (if any) */}
              {selectedMessage.response && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Respuesta enviada</p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.response}</p>
                    {selectedMessage.responded_at && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <HiClock className="w-4 h-4 mr-1" />
                        {new Date(selectedMessage.responded_at).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-2">
              {selectedMessage.status !== 'responded' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleOpenResponse(selectedMessage);
                  }}
                  className="btn-primary flex items-center"
                >
                  <HiReply className="w-4 h-4 mr-2" />
                  Responder
                </button>
              )}
              {selectedMessage.status !== 'archived' && (
                <button
                  onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                  className="btn-outline flex items-center"
                >
                  <HiArchive className="w-4 h-4 mr-2" />
                  Archivar
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex items-center"
              >
                <HiTrash className="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-heading">Responder a {selectedMessage.name}</h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendResponse}>
              <div className="p-6">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium text-gray-900">{selectedMessage.subject || 'Sin asunto'}</p>
                  <p className="text-gray-500 truncate">{selectedMessage.message}</p>
                </div>

                <label className="label">Tu respuesta</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  className="input w-full"
                  placeholder="Escribe tu respuesta..."
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Se enviará a: {selectedMessage.email}
                </p>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending || !response.trim()}
                  className="btn-primary"
                >
                  {sending ? 'Enviando...' : 'Enviar Respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageContactsPage;
