import { useState, useEffect, useRef } from 'react';
import { HiChat, HiX, HiPaperAirplane, HiUser } from 'react-icons/hi';
import { useChat } from '../../context/ChatContext';

const ChatWidget = () => {
  const {
    isOpen,
    isConnected,
    sessionId,
    messages,
    status,
    isTyping,
    toggleChat,
    startChat,
    sendMessage,
    sendTyping,
    resetChat,
    setIsOpen
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mostrar formulario o chat según estado
  useEffect(() => {
    if (sessionId && status !== 'idle') {
      setShowForm(false);
    }
  }, [sessionId, status]);

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    startChat(formData.name, formData.email);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const handleNewChat = () => {
    resetChat();
    setShowForm(true);
    setFormData({ name: '', email: '' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-primary hover:bg-primary-dark'
        }`}
      >
        {isOpen ? (
          <HiX className="w-6 h-6 text-white" />
        ) : (
          <HiChat className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden max-h-[500px]">
          {/* Header */}
          <div className="bg-primary text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">Chat en Vivo</h3>
                <p className="text-xs text-white/80">
                  {!isConnected
                    ? 'Conectando...'
                    : status === 'waiting'
                    ? 'Esperando agente...'
                    : status === 'active'
                    ? 'Conectado con un agente'
                    : status === 'closed'
                    ? 'Chat cerrado'
                    : 'Inicia una conversación'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 flex flex-col min-h-0">
            {showForm && status === 'idle' ? (
              // Formulario inicial
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4">
                  Por favor, ingresa tu información para iniciar el chat.
                </p>
                <form onSubmit={handleStartChat} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isConnected}
                    className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:bg-gray-400 transition-colors"
                  >
                    Iniciar Chat
                  </button>
                </form>
              </div>
            ) : (
              // Área de mensajes
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === 'visitor' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.senderType === 'visitor'
                            ? 'bg-primary text-white rounded-br-none'
                            : msg.senderType === 'agent'
                            ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                            : 'bg-gray-50 text-gray-600 text-center w-full text-xs italic'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderType === 'visitor'
                              ? 'text-white/70'
                              : 'text-gray-400'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Indicador de escribiendo */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input de mensaje */}
                {status !== 'closed' ? (
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-t flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Escribe un mensaje..."
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 transition-colors"
                    >
                      <HiPaperAirplane className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  // Chat cerrado
                  <div className="p-3 border-t text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      El chat ha finalizado
                    </p>
                    <button
                      onClick={handleNewChat}
                      className="text-sm text-primary hover:underline"
                    >
                      Iniciar nuevo chat
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
