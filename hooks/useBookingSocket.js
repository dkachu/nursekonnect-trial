'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BookingSocketProps {
  onMessageReceived: (data: any) => void;
}

export const useBookingSocket = (onMessageReceived: BookingSocketProps['onMessageReceived']) => {
  // Extract global authentication context parameters to safeguard connection bounds
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const stableOnMessage = useCallback(onMessageReceived, [onMessageReceived]);

  const connectSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Guard: Abort socket connection upgrades immediately if the user context is unauthenticated
    if (!user || !user.id) {
      setIsConnected(false);
      if (socketRef.current) {
        socketRef.current.close(1000, "Session terminated");
        socketRef.current = null;
      }
      return;
    }

    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://${baseHost}/ws/bookings/`;
    
    console.log(`[Booking Socket] Syncing User #${user.id} stream to: ${wsUrl}`);
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
      if (user?.id) {
        console.error("[Booking Socket] Channel error caught:", error);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      socketRef.current = null;

      // Only attempt reconnect logic if user remains logged in and the closure was unhandled
      if (user?.id && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectSocket();
        }, delay);
      }
    };
  }, [stableOnMessage, user]);

  const sendMessage = useCallback((payload: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.error("Cannot dispatch transmission payload: Socket tunnel is currently offline.");
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
        socketRef.current.close(1000, "Component context unmounted cleanly.");
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  return { isConnected, sendMessage };
};
