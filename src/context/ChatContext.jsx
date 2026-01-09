import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const STORAGE_KEY = 'chat_session';

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, waiting, active, closed
  const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '' });

  const typingTimeoutRef = useRef(null);

  // Inicializar socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Conectado al servidor de chat');
      setIsConnected(true);

      // Intentar reconectar a sesión existente
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        const { sessionId: savedId } = JSON.parse(savedSession);
        newSocket.emit('chat:reconnect', { sessionId: savedId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de chat');
      setIsConnected(false);
    });

    // Eventos del chat
    newSocket.on('chat:started', (data) => {
      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      setStatus('waiting');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId: data.sessionId,
        visitorId: data.visitorId
      }));
    });

    newSocket.on('chat:reconnected', (data) => {
      setSessionId(data.sessionId);
      setMessages(data.messages || []);
      setStatus(data.status);
    });

    newSocket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    newSocket.on('chat:agent_joined', (data) => {
      setStatus('active');
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    newSocket.on('chat:closed', (data) => {
      setStatus('closed');
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      localStorage.removeItem(STORAGE_KEY);
    });

    newSocket.on('chat:typing', (data) => {
      if (data.senderType === 'agent') {
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on('chat:error', (data) => {
      console.error('Error de chat:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Conectar socket cuando se abre el chat
  useEffect(() => {
    if (isOpen && socket && !socket.connected) {
      socket.connect();
    }
  }, [isOpen, socket]);

  // Iniciar chat
  const startChat = useCallback((name, email) => {
    if (!socket || !socket.connected) return;

    setVisitorInfo({ name, email });
    const savedSession = localStorage.getItem(STORAGE_KEY);
    const visitorId = savedSession ? JSON.parse(savedSession).visitorId : null;

    socket.emit('chat:start', {
      name,
      email,
      visitorId
    });
  }, [socket]);

  // Enviar mensaje
  const sendMessage = useCallback((message) => {
    if (!socket || !sessionId || !message.trim()) return;

    socket.emit('chat:visitor_message', {
      sessionId,
      message: message.trim()
    });
  }, [socket, sessionId]);

  // Indicar que está escribiendo
  const sendTyping = useCallback((isTyping) => {
    if (!socket || !sessionId) return;

    // Debounce para evitar spam de eventos
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('chat:typing', {
      sessionId,
      isTyping,
      senderType: 'visitor'
    });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing', {
          sessionId,
          isTyping: false,
          senderType: 'visitor'
        });
      }, 3000);
    }
  }, [socket, sessionId]);

  // Abrir/cerrar widget
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Reiniciar chat (después de cerrar)
  const resetChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setStatus('idle');
    setVisitorInfo({ name: '', email: '' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    // Estado
    isConnected,
    isOpen,
    sessionId,
    messages,
    status,
    isTyping,
    visitorInfo,
    // Acciones
    toggleChat,
    startChat,
    sendMessage,
    sendTyping,
    resetChat,
    setIsOpen
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
};

export default ChatContext;
