import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo
} from 'react';
import { useAuth } from '../App';

const WebSocketContext = createContext(null);

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

function getWsBaseUrl() {
    if (import.meta.env.VITE_WS_BASE_URL) {
        return import.meta.env.VITE_WS_BASE_URL;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
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
        // ✅ FIX: correct key
        const tokens = JSON.parse(
            localStorage.getItem('restaurant_tokens') || '{}'
        );

        if (!tokens?.access || !user?.id) return;

        // cleanup old socket
        if (socketRef.current) {
            intentionalCloseRef.current = true;
            socketRef.current.close();
            socketRef.current = null;
        }

        intentionalCloseRef.current = false;

        const wsUrl = `${getWsBaseUrl()}/ws/restaurant/${user.id}/?token=${tokens.access}`;
        const ws = new WebSocket(wsUrl);

        socketRef.current = ws;
        setSocketState('connecting');

        ws.onopen = () => {
            setSocketState('connected');
            reconnectAttemptRef.current = 0;
        };

        ws.onclose = () => {
            setSocketState('closed');

            if (socketRef.current === ws) {
                socketRef.current = null;
            }

            // 🔁 Auto reconnect (exponential backoff)
            if (
                !intentionalCloseRef.current &&
                reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS
            ) {
                const delay = Math.min(
                    BASE_RECONNECT_DELAY *
                        Math.pow(2, reconnectAttemptRef.current),
                    30000
                );

                reconnectAttemptRef.current += 1;
                setSocketState('reconnecting');

                reconnectTimerRef.current = setTimeout(() => {
                    connect();
                }, delay);
            }
        };

        ws.onerror = () => {
            setSocketState('error');
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                setMessages((prev) => [payload, ...prev].slice(0, 100));
            } catch {
                // ignore malformed messages
            }
        };
    }, [user?.id]);

    useEffect(() => {
        // 🚫 Not logged in → ensure socket closed
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

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user, connect]);

    const send = useCallback((payload) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(payload));
        }
    }, []);

    const value = useMemo(
        () => ({
            socket: socketRef.current,
            socketState,
            messages,
            latestMessage: messages[0] || null,
            send
        }),
        [messages, socketState, send]
    );

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
