"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface SyncHookProps {
  onNewDispatch: () => void;
}

export function useRegistrySync({ onNewDispatch }: SyncHookProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const getSocketUrl = (): string => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/";
    
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    return `${wsScheme}://${baseHost}/ws/api/accounts/registry/`;
  };

  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;

    const url = getSocketUrl();
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "PERSONAL_ALERT" && data.payload) {
          const action = data.payload.action;

          if (action === "NEW_REQUEST") {
            toast.info("NEW CARE DEMAND", {
              description: "An incoming patient request requires immediate clinical evaluation.",
              duration: 8000
            });
          } else if (action === "NURSE_ARRIVED") {
            toast.success("PRACTITIONER ON-SITE", {
              description: "Your assigned nurse has arrived at your verified location.",
              duration: 6000
            });
          } else if (action === "SYNC_REQUIRED") {
            console.info("On-demand telemetry tracking update triggered across network nodes.");
          } else if (action?.startsWith("BOOKING_")) {
            const currentStatus = data.payload.status || "updated";
            toast.success("DISPATCH ENGINE LOG CHANGED", {
              description: `Appointment record status has successfully transitioned to: ${currentStatus.toLowerCase()}.`
            });
          }
          
          if (typeof onNewDispatch === "function") {
            onNewDispatch(); 
          }
        }
      } catch (error) {
        console.error("Failed to decode real-time incoming signal string:", error);
      }
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      socketRef.current = null;

      if (event.code !== 1000 && event.code !== 1001) {
        const maxDelay = 30000;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), maxDelay);
        
        reconnectAttemptsRef.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      }
    };

    socket.onerror = () => {
      console.warn("Real-time network connection dropped. Re-establishing secure link...");
    };
  }, [onNewDispatch]);

  const sendWebSocketMessage = useCallback((payload: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.error("Cannot dispatch transmission payload: Socket tunnel is currently offline.");
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close(1000, "Component context unmounted cleanly.");
      }
    };
  }, [connectWebSocket]);

  return {
    isConnected,
    sendWebSocketMessage
  };
}
