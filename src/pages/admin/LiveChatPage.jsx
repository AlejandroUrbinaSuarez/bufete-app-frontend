import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  HiChat, HiUser, HiMail, HiClock, HiX,
  HiPaperAirplane, HiRefresh, HiCheckCircle
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLORS = {
  waiting: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  waiting: 'En espera',
  active: 'Activo',
  closed: 'Cerrado',
};

const LiveChatPage = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Conectar socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Agente conectado');
      setIsConnected(true);

      // Unirse como agente
      newSocket.emit('agent:join', {
        agentId: user.id,
        agentName: `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Agente desconectado');
      setIsConnected(false);
    });

    // Lista de sesiones
    newSocket.on('agent:sessions_list', (sessionsList) => {
      setSessions(sessionsList);
    });

    // Nueva sesión de chat
    newSocket.on('chat:new_session', (session) => {
      setSessions((prev) => [session, ...prev]);
      toast.info(`Nuevo chat de ${session.visitorName}`);
    });

    // Sesión tomada por otro agente
    newSocket.on('agent:session_taken', (data) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: 'active', assignedTo: data.agentName }
            : s
        )
      );
    });

    // Sesión cerrada
    newSocket.on('agent:session_closed', (data) => {
      setSessions((prev) =>
        prev.filter((s) => s.sessionId !== data.sessionId)
      );
      if (selectedSession?.sessionId === data.sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    });

    // Historial de sesión
    newSocket.on('agent:session_history', (data) => {
      setMessages(data.messages || []);
      setSelectedSession({
        sessionId: data.sessionId,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        status: 'active'
      });
    });

    // Nuevo mensaje
    newSocket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    // Agente se unió
    newSocket.on('chat:agent_joined', (data) => {
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    // Visitante desconectado
    newSocket.on('chat:visitor_disconnected', (data) => {
      if (selectedSession?.sessionId === data.sessionId) {
        toast.warning('El visitante se ha desconectado');
      }
    });

    // Indicador de escritura
    newSocket.on('chat:typing', (data) => {
      if (data.senderType === 'visitor') {
        setIsTyping(data.isTyping);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tomar sesión
  const takeSession = useCallback((session) => {
    if (!socket) return;

    socket.emit('agent:take_session', {
      sessionId: session.sessionId,
      agentId: user.id,
      agentName: `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
    });

    // Actualizar lista local
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === session.sessionId
          ? { ...s, status: 'active' }
          : s
      )
    );
  }, [socket, user]);

  // Enviar mensaje
  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (!socket || !selectedSession || !inputValue.trim()) return;

    socket.emit('agent:message', {
      sessionId: selectedSession.sessionId,
      message: inputValue.trim()
    });

    setInputValue('');
  }, [socket, selectedSession, inputValue]);

  // Cerrar sesión
  const closeSession = useCallback(() => {
    if (!socket || !selectedSession) return;

    if (!window.confirm('¿Estás seguro de cerrar este chat?')) return;

    socket.emit('agent:close_session', {
      sessionId: selectedSession.sessionId
    });

    setSessions((prev) =>
      prev.filter((s) => s.sessionId !== selectedSession.sessionId)
    );
    setSelectedSession(null);
    setMessages([]);
  }, [socket, selectedSession]);

  // Formatear hora
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear fecha
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat en Vivo</h1>
          <p className="text-gray-600">
            {isConnected ? (
              <span className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Conectado
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Desconectado
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {sessions.filter(s => s.status === 'waiting').length} en espera
        </div>
      </div>

      {/* Container principal */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Lista de sesiones */}
        <div className="w-80 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-900">Conversaciones</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <HiChat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay chats activos</p>
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSession?.sessionId === session.sessionId
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : ''
                    }`}
                    onClick={() => {
                      if (session.status === 'waiting') {
                        takeSession(session);
                      } else if (session.assignedTo) {
                        // Ver historial sin tomar
                        setSelectedSession(session);
                        socket?.emit('agent:take_session', {
                          sessionId: session.sessionId,
                          agentId: user.id,
                          agentName: `${user.firstName || user.first_name}`
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <HiUser className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.visitorName}
                          </p>
                          {session.visitorEmail && (
                            <p className="text-xs text-gray-500">
                              {session.visitorEmail}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[session.status]}`}>
                        {STATUS_LABELS[session.status]}
                      </span>
                    </div>
                    {session.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {session.lastMessage}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      <HiClock className="inline w-3 h-3 mr-1" />
                      {formatDate(session.createdAt)}
                    </p>
                    {session.assignedTo && (
                      <p className="text-xs text-primary mt-1">
                        <HiCheckCircle className="inline w-3 h-3 mr-1" />
                        {session.assignedTo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <HiUser className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedSession.visitorName}
                    </p>
                    {selectedSession.visitorEmail && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <HiMail className="w-3 h-3 mr-1" />
                        {selectedSession.visitorEmail}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeSession}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 flex items-center"
                >
                  <HiX className="w-4 h-4 mr-1" />
                  Cerrar Chat
                </button>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === 'agent' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.senderType === 'agent'
                          ? 'bg-primary text-white rounded-br-none'
                          : msg.senderType === 'visitor'
                          ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                          : 'bg-gray-50 text-gray-500 text-center w-full text-sm italic'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderType === 'agent'
                            ? 'text-white/70'
                            : 'text-gray-400'
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
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

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Escribe un mensaje..."
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 transition-colors flex items-center"
                >
                  <HiPaperAirplane className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            // Sin sesión seleccionada
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <HiChat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Selecciona una conversación</p>
                <p className="text-sm">
                  O espera a que lleguen nuevos chats
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
