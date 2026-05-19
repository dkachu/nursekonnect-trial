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

    // Explicitly parse base domain paths cleanly without route configuration pollution
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    // Establish WebSocket protocols based on browser infrastructure security
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    
    // Direct traffic to match your Django ASGI routing structure explicitly
    const wsUrl = `${wsScheme}://${baseHost}/ws/bookings/`;
    
    console.log(`[Booking Socket] Opening stream to: ${wsUrl}`);
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
        console.error("[Booking Socket] Frame parsing error:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("[Booking Socket] Channel error caught:", error);
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
