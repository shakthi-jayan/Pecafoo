import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../App';

const WebSocketContext = createContext(null);

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

function getWsBaseUrl() {
    return import.meta.env.VITE_WS_BASE_URL || 'wss://api.pecafoo.com/ws';
}

export const WebSocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
    const [socketState, setSocketState] = useState('idle');
    const socketRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef(null);
    const intentionalCloseRef = useRef(false);

    const connect = useCallback(() => {
        const tokens = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
        if (!tokens.access || !user?.id) return;

        if (socketRef.current) {
            intentionalCloseRef.current = true;
            socketRef.current.close();
            socketRef.current = null;
        }

        intentionalCloseRef.current = false;
        const ws = new WebSocket(`${getWsBaseUrl()}/restaurant/${user.id}/?token=${tokens.access}`);
        socketRef.current = ws;
        setSocketState('connecting');

        ws.onopen = () => {
            setSocketState('connected');
            reconnectAttemptRef.current = 0;
        };

        ws.onclose = () => {
            setSocketState('closed');
            if (socketRef.current === ws) socketRef.current = null;

            if (!intentionalCloseRef.current && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current), 30000);
                reconnectAttemptRef.current += 1;
                setSocketState('reconnecting');
                reconnectTimerRef.current = setTimeout(connect, delay);
            }
        };

        ws.onerror = () => setSocketState('error');

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                setMessages(prev => [payload, ...prev].slice(0, 100));
            } catch {
                // ignore malformed frames
            }
        };
    }, [user?.id]);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                intentionalCloseRef.current = true;
                socketRef.current.close();
                socketRef.current = null;
            }
            setSocketState('idle');
            return;
        }

        connect();

        return () => {
            intentionalCloseRef.current = true;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user, connect]);

    const value = useMemo(() => ({
        socket: socketRef.current,
        socketState,
        messages,
        latestMessage: messages[0] || null,
        send: (payload) => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify(payload));
            }
        },
    }), [messages, socketState]);

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
