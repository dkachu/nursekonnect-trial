"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export const useRegistrySync = (onNewDispatch: () => void) => {
  useEffect(() => {
    // Protocol: handle dynamic environment routing for production SSL
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
    
    /*
     * Isolates the naked hostname (e.g., onrender.com) for ASGI bindings
     * Strips the http/https protocol prefix and the trailing /api/ namespace suffix cleanly
     */
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const socketUrl = `${wsScheme}://${baseHost}/ws/registry/`;
    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Broadcast Handler: trigger notification for new registry requests
        if (data.type === "BROADCAST" || data.action === "NEW_REQUEST") {
          toast.info("New Hire Request Detected", {
            description: "A patient in your zone requires clinical assistance."
          });
          onNewDispatch(); 
        }

        // Personal Alert Handler: handle specific handshake updates
        if (data.type === "PERSONAL_ALERT") {
          onNewDispatch();
        }
      } catch {
        console.error("Registry pulse parsing error");
      }
    };

    socket.onerror = () => {
      console.warn("Registry WebSocket pulse offline");
    };

    return () => {
      socket.close();
    };
  }, [onNewDispatch]);
};
