"use client";

import { useEffect, useRef } from "react";

interface HeartbeatHookProps {
  isNurse: boolean;
  isOnline: boolean;
  isAvailable: boolean;
  socketConnected: boolean;
  sendWebSocketMessage: (data: object) => void;
}

export function useProfessionalHeartbeat({
  isNurse,
  isOnline,
  isAvailable,
  socketConnected,
  sendWebSocketMessage,
}: HeartbeatHookProps) {
  const stateRef = useRef({ isAvailable, socketConnected });

  useEffect(() => {
    stateRef.current = { isAvailable, socketConnected };
  }, [isAvailable, socketConnected]);

  useEffect(() => {
    if (typeof window === "undefined" || !isNurse || !isOnline) return;
    if (!("geolocation" in navigator)) {
      console.error("Browser platform architecture lacks operational Geolocation layers.");
      return;
    }

    const transmitPulse = () => {
      const geoOptions: PositionOptions = { 
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

          // Routes payload data over the active socket thread if connected, using HTTP only as fallback
          if (stateRef.current.socketConnected) {
            sendWebSocketMessage(payload);
          } else {
            fetch("/api/accounts/profile/update/", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, heartbeat: true })
            }).catch(() => console.warn("Background telemetry HTTP fallback transmission failed."));
          }
        },
        (error) => {
          console.warn(`Geospatial lock verification interrupted: ${error.message}`);
        },
        geoOptions
      );
    };

    transmitPulse();
    const pulseInterval = setInterval(transmitPulse, 300000); // 5-minute telemetry sync balance

    return () => clearInterval(pulseInterval);
  }, [isNurse, isOnline, sendWebSocketMessage]);
}
