"use client";

import { useEffect } from "react";
import api from "@/lib/api";

export function useProfessionalHeartbeat(isNurse: boolean, isOnline: boolean) {
  useEffect(() => {
    if (!isNurse || !isOnline) return;

    const pulse = () => {
      const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await api.patch("accounts/profile/update/", {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              heartbeat: true,
              is_available: true 
            });
          } catch { 
            console.error("Pulse transmission failed"); 
          }
        },
        () => console.warn("GPS synchronization lost"),
        geoOptions
      );
    };

    pulse();
    const interval = setInterval(pulse, 600000); 
    return () => clearInterval(interval);
  }, [isNurse, isOnline]);
}
