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

  // Instantiates WebSocket and establishes client lifecycle handling
  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;

    // Normalize protocol and host to form matching ws endpoint cleanly
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    // Align exactly with your Django channels routing paths
    const url = `${wsScheme}://${baseHost}/ws/accounts/registry/`;

    console.log(`[Registry Sync] Connecting to mesh stream at: ${url}`);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handles structured backend envelopes cleanly
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

    // Exponential backoff strategy to safely handle connection drops
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

  // Safe outbound wrapper ensuring thread pipeline sanity
  const sendWebSocketMessage = useCallback((payload: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.error("Cannot dispatch transmission payload: Socket tunnel is currently offline.");
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    // Prevent active connection memory leaks during unmounts
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
