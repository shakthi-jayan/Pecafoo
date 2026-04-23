import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const WebSocketContext = createContext(null);

/**
 * Auto-derives the WebSocket base URL from window.location.
 * - Local dev:   http://localhost:5173  → VITE_WS_BASE_URL (must be set) or ws://localhost:8000
 * - Dev tunnel:  https://xyz.devtunnels.ms → wss://xyz.devtunnels.ms
 * - Production:  https://app.pecafoo.com  → wss://app.pecafoo.com
 */
function getSocketBaseUrl() {
    if (import.meta.env.VITE_WS_BASE_URL) {
        return import.meta.env.VITE_WS_BASE_URL;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;

export function WebSocketProvider({ children }) {
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [socketState, setSocketState] = useState('idle');
    const socketRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef(null);
    const intentionalCloseRef = useRef(false);

    const orderId = useMemo(() => {
        const explicitOrderId = location.state?.activeOrderId;
        if (explicitOrderId) return explicitOrderId;
        const match = location.pathname.match(/^\/orders\/([^/]+)$/);
        return match?.[1] || null;
    }, [location.pathname, location.state]);

    const connect = useCallback(() => {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        if (!tokens.access || !orderId) return;

        
        if (socketRef.current) {
            intentionalCloseRef.current = true;
            socketRef.current.close();
            socketRef.current = null;
        }

        intentionalCloseRef.current = false;
        const socketUrl = `${getSocketBaseUrl()}/ws/orders/${orderId}/?token=${tokens.access}`;
        const ws = new WebSocket(socketUrl);
        socketRef.current = ws;
        setSocketState('connecting');

        ws.onopen = () => {
            setSocketState('connected');
            reconnectAttemptRef.current = 0; 
        };

        ws.onclose = (event) => {
            setSocketState('closed');
            if (socketRef.current === ws) {
                socketRef.current = null;
            }

            
            if (!intentionalCloseRef.current && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.min(
                    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current),
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
                setMessages((previous) => [payload, ...previous].slice(0, 100));
            } catch {
                
            }
        };
    }, [orderId]);

    useEffect(() => {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        if (!tokens.access || !orderId) {
            if (socketRef.current) {
                intentionalCloseRef.current = true;
                socketRef.current.close();
                socketRef.current = null;
            }
            setSocketState('idle');
            reconnectAttemptRef.current = 0;
            return undefined;
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
    }, [orderId, connect]);

    const value = useMemo(() => ({
        socket: socketRef.current,
        socketState,
        messages,
        latestMessage: messages[0] || null,
        reconnectAttempt: reconnectAttemptRef.current,
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
}

export function useWebSocket() {
    return useContext(WebSocketContext);
}
