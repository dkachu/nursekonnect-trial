'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export const useBookingSocket = (onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const stableOnMessage = useCallback(onMessageReceived, [onMessageReceived]);

  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production';
    const wsUrl = isProd
      ? `wss://${process.env.NEXT_PUBLIC_API_DOMAIN}/ws/bookings/`
      : `ws://127.0.0.1:10000/ws/bookings/`;
    
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (stableOnMessage) stableOnMessage(data);
      } catch (err) {
        console.error(err);
      }
    };

    ws.onerror = (error) => {
      console.error(error);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectSocket();
        }, delay);
      }
    };
  }, [stableOnMessage]);

  const sendMessage = useCallback((payload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  return { isConnected, sendMessage };
};
