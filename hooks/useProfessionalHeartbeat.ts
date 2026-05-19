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
            // Build the absolute backend API endpoint path reliably
            const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
            const cleanUrl = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`;
            const baseApiUrl = cleanUrl.includes('/api/') ? cleanUrl : `${cleanUrl}api/`;
            const targetUrl = `${baseApiUrl}accounts/profile/update/`;

            console.log(`[Heartbeat] Socket dead. Broadcasting HTTP fallback to: ${targetUrl}`);
            
            // Deliver fallback payload across absolute cross-origin layouts using credentials
            fetch(targetUrl, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                town: "Live Telemetry Update",
                building: "Geospatial Pulse Node",
                lat: payload.lat,
                lng: payload.lng,
                is_available: payload.is_available
              }),
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
