import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiArrowLeft, HiUser, HiPhone, HiMail, HiClock,
  HiDocumentText, HiChatAlt2, HiPaperAirplane, HiDownload,
  HiUpload, HiCalendar, HiTag, HiClipboardList
} from 'react-icons/hi';
import { casesApi } from '../../api/cases';
import { useAuth } from '../../context/AuthContext';

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

const UPDATE_TYPE_ICONS = {
  status_change: HiTag,
  note: HiClipboardList,
  milestone: HiCalendar,
  document: HiDocumentText,
  meeting: HiClock,
};

const UPDATE_TYPE_COLORS = {
  status_change: 'bg-blue-500',
  note: 'bg-gray-500',
  milestone: 'bg-green-500',
  document: 'bg-purple-500',
  meeting: 'bg-orange-500',
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCase();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCase = async () => {
    try {
      const res = await casesApi.getMyCaseById(id);
      setCaseData(res.data);
    } catch (error) {
      console.error('Error cargando caso:', error);
      toast.error('Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await casesApi.getMessages(id);
      setMessages(res.data || []);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await casesApi.sendMessage(id, newMessage.trim());
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await casesApi.uploadDocument(id, file);
      toast.success('Documento subido');
      loadCase();
    } catch (error) {
      toast.error('Error al subir documento');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await casesApi.downloadDocument(id, doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Error al descargar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Caso no encontrado</p>
        <Link to="/portal/casos" className="text-primary hover:underline mt-4 inline-block">
          Volver a mis casos
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/portal/casos" className="text-primary hover:underline flex items-center mb-4">
          <HiArrowLeft className="w-4 h-4 mr-1" />
          Volver a mis casos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500 font-mono">{caseData.case_number}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[caseData.status]}`}>
                {STATUS_LABELS[caseData.status]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b">
              <nav className="flex">
                {[
                  { id: 'timeline', label: 'Timeline', icon: HiClock },
                  { id: 'messages', label: 'Mensajes', icon: HiChatAlt2 },
                  { id: 'documents', label: 'Documentos', icon: HiDocumentText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Timeline */}
              {activeTab === 'timeline' && (
                <div>
                  {caseData.updates?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay actualizaciones</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-6">
                        {caseData.updates?.map((update) => {
                          const Icon = UPDATE_TYPE_ICONS[update.update_type] || HiClipboardList;
                          return (
                            <div key={update.id} className="relative pl-10">
                              <div className={`absolute left-0 w-8 h-8 rounded-full ${UPDATE_TYPE_COLORS[update.update_type]} flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900">{update.description}</p>
                                <div className="mt-2 text-sm text-gray-500 flex items-center gap-4">
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
                                    <span>por {update.creator.first_name} {update.creator.last_name}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Messages */}
              {activeTab === 'messages' && (
                <div className="flex flex-col h-96">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No hay mensajes. ¡Envía el primero!
                      </p>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              {!isOwn && (
                                <p className="text-xs font-medium mb-1 opacity-75">
                                  {msg.sender?.first_name} {msg.sender?.last_name}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 input-field"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="btn-primary px-4"
                    >
                      <HiPaperAirplane className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}

              {/* Documents */}
              {activeTab === 'documents' && (
                <div>
                  <div className="mb-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-outline flex items-center"
                    >
                      <HiUpload className="w-5 h-5 mr-2" />
                      {uploading ? 'Subiendo...' : 'Subir documento'}
                    </button>
                  </div>

                  {caseData.documents?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay documentos</p>
                  ) : (
                    <div className="space-y-3">
                      {caseData.documents?.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <HiDocumentText className="w-10 h-10 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.original_name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(doc.created_at).toLocaleDateString('es-ES')} ·{' '}
                                {doc.uploader?.first_name} {doc.uploader?.last_name}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <HiDownload className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info del Caso */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Información del Caso</h3>
            <div className="space-y-3 text-sm">
              {caseData.description && (
                <div>
                  <p className="text-gray-500 mb-1">Descripción</p>
                  <p className="text-gray-900">{caseData.description}</p>
                </div>
              )}
              {caseData.service && (
                <div>
                  <p className="text-gray-500 mb-1">Servicio</p>
                  <p className="text-gray-900">{caseData.service.name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-1">Fecha de inicio</p>
                <p className="text-gray-900">
                  {caseData.start_date
                    ? new Date(caseData.start_date).toLocaleDateString('es-ES')
                    : new Date(caseData.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Abogado asignado */}
          {caseData.lawyer && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Abogado Asignado</h3>
              <div className="flex items-center mb-4">
                {caseData.lawyer.photo_url ? (
                  <img
                    src={caseData.lawyer.photo_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <HiUser className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="ml-4">
                  <p className="font-bold text-gray-900">{caseData.lawyer.full_name}</p>
                  <p className="text-sm text-gray-600">{caseData.lawyer.specialization}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {caseData.lawyer.email && (
                  <a
                    href={`mailto:${caseData.lawyer.email}`}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <HiMail className="w-4 h-4 mr-2" />
                    {caseData.lawyer.email}
                  </a>
                )}
                {caseData.lawyer.phone && (
                  <a
                    href={`tel:${caseData.lawyer.phone}`}
                    className="flex items-center text-gray-600 hover:text-primary"
                  >
                    <HiPhone className="w-4 h-4 mr-2" />
                    {caseData.lawyer.phone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
