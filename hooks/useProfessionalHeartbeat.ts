"use client";

import { useEffect, useRef } from "react";

export function useProfessionalHeartbeat({
  isNurse,
  isOnline,
  isAvailable,
  socketConnected,
  sendWebSocketMessage,
}) {
  const stateRef = useRef({ isAvailable, socketConnected });

  useEffect(() => {
    stateRef.current = { isAvailable, socketConnected };
  }, [isAvailable, socketConnected]);

  useEffect(() => {
    if (typeof window === "undefined" || !isNurse || !isOnline) return;
    if (!("geolocation" in navigator)) {
      console.error("Browser geolocation modules missing.");
      return;
    }

    const transmitPulse = () => {
      const geoOptions = { 
        enableHighAccuracy: false, 
        timeout: 20000, 
        maximumAge: 60000 
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const payload = {
            action: "HEARTBEAT",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            is_available: stateRef.current.isAvailable,
            timestamp: new Date().toISOString()
          };

          if (stateRef.current.socketConnected) {
            sendWebSocketMessage(payload);
          } else {
            const apiDomain = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api/";
            const targetUrl = `${apiDomain.replace(/\/$/, "")}/accounts/profile/update/`;

            // Deliver fallback payload across absolute cross-origin layouts using cookies
            fetch(targetUrl, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, heartbeat: true }),
              credentials: "include"
            }).catch(() => console.warn("HTTP telemetry backup push dropped."));
          }
        },
        (error) => {
          console.warn(`Telemetry lock tracking interrupted: ${error.message}`);
        },
        geoOptions
      );
    };

    transmitPulse();
    const pulseInterval = setInterval(transmitPulse, 300000);

    return () => clearInterval(pulseInterval);
  }, [isNurse, isOnline, sendWebSocketMessage]);
}
