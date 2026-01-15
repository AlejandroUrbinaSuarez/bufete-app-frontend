import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiChatAlt2, HiPaperAirplane, HiFolder,
  HiExternalLink, HiInbox, HiChevronRight
} from 'react-icons/hi';
import { casesApi } from '../../api/cases';
import { useAuth } from '../../context/AuthContext';

const MessagesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) {
      loadMessages(selectedCase.id);
    }
  }, [selectedCase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCases = async () => {
    try {
      const res = await casesApi.getMyCases();
      setCases(res.data || []);

      // Load unread counts
      try {
        const unreadRes = await casesApi.getUnreadCount();
        if (unreadRes.data) {
          const counts = {};
          if (Array.isArray(unreadRes.data)) {
            unreadRes.data.forEach(item => {
              counts[item.case_id] = item.count;
            });
          } else if (typeof unreadRes.data === 'object') {
            Object.assign(counts, unreadRes.data);
          }
          setUnreadCounts(counts);
        }
      } catch (e) {
        console.log('No se pudo cargar conteo de no leídos');
      }
    } catch (error) {
      console.error('Error cargando casos:', error);
      toast.error('Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (caseId) => {
    setLoadingMessages(true);
    try {
      const res = await casesApi.getMessages(caseId);
      setMessages(res.data || []);
      // Clear unread for this case
      setUnreadCounts(prev => ({ ...prev, [caseId]: 0 }));
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      toast.error('Error al cargar mensajes');
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCase) return;

    setSendingMessage(true);
    try {
      const res = await casesApi.sendMessage(selectedCase.id, newMessage.trim());
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const getTotalUnread = () => {
    return Object.values(unreadCounts).reduce((acc, count) => acc + (count || 0), 0);
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-gray-900">Mensajes</h1>
        <p className="text-gray-600 mt-1">
          {getTotalUnread() > 0
            ? `${getTotalUnread()} mensaje${getTotalUnread() !== 1 ? 's' : ''} sin leer`
            : 'Comunicación con tu equipo legal'
          }
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HiInbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes casos activos</h3>
          <p className="text-gray-500">
            Los mensajes aparecerán aquí cuando tengas casos asignados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Cases List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900">Mis Casos</h3>
              </div>
              <div className="divide-y">
                {cases.map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedCase?.id === caseItem.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <HiFolder className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="ml-3 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {caseItem.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {caseItem.case_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        {unreadCounts[caseItem.id] > 0 && (
                          <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
                            {unreadCounts[caseItem.id]}
                          </span>
                        )}
                        <HiChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Area */}
            <div className="md:col-span-2 flex flex-col">
              {!selectedCase ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <HiChatAlt2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Selecciona un caso para ver los mensajes</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Case Header */}
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedCase.title}</h3>
                      <p className="text-sm text-gray-500">{selectedCase.case_number}</p>
                    </div>
                    <Link
                      to={`/portal/casos/${selectedCase.id}`}
                      className="text-primary hover:text-primary-dark flex items-center text-sm"
                    >
                      Ver caso <HiExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <HiChatAlt2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No hay mensajes. ¡Envía el primero!</p>
                      </div>
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
                                {' · '}
                                {new Date(msg.created_at).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 input"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="btn-primary px-4"
                      >
                        <HiPaperAirplane className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
