"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function useRegistrySync(onNewDispatch: () => void) {
  useEffect(() => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
    
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const socketUrl = `${wsScheme}://${baseHost}/ws/registry/`;
    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "PERSONAL_ALERT" && data.payload) {
          const action = data.payload.action;

          if (action === "NEW_REQUEST") {
            toast.info("NEW TASK RECEIVED", {
              description: "A patient care request requires clinical evaluation."
            });
          } else if (action === "NURSE_ARRIVED") {
            toast.success("PRACTITIONER ON-SITE", {
              description: "Your assigned nurse has arrived at your location."
            });
          } else if (action?.startsWith("BOOKING_")) {
            toast.success("DISPATCH RECORD STATE CHANGED");
          }
          
          onNewDispatch(); 
        }
      } catch {
        console.error("Pulse decoding loop failure");
      }
    };

    socket.onerror = () => {
      console.warn("Telemetry socket fallback stream active");
    };

    return () => {
      socket.close();
    };
  }, [onNewDispatch]);
}
