'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export const useLocationTracker = (patientId, isActive = false) => {
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [isStreaming, setIsStreaming] = useState(false);
  
  const socketRef = useRef(null);
  const geoWatcherRef = useRef(null);

  // Parse websocket route configuration using unified api variables
  const connectRegistrySocket = useCallback(() => {
    if (typeof window === 'undefined' || !patientId || !isActive) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    
    // Direct traffic to match your Django ASGI routing structure without extra route pollution
    const wsUrl = `${wsScheme}://${baseHost}/ws/accounts/registry/`;

    console.log(`[Socket] Connecting to spatial registry: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[Socket] Spatial link accepted.');
      setIsStreaming(true);
    };

    ws.onclose = () => {
      setIsStreaming(false);
      console.log('[Socket] Spatial link closed.');
    };

    ws.onerror = (err) => {
      console.error('[Socket] Thread error encountered:', err);
    };
  }, [patientId, isActive]);

  // Track high-accuracy hardware sensor readings streams
  const startLocationWatcher = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !isActive) return;

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    geoWatcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoordinates(currentCoords);

        // Emit formatted packet structure to matching backend registry consumers
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              action: 'TRANSMIT_LOCATION_DATA',
              patient_id: patientId,
              coordinates: currentCoords,
            })
          );
        }
      },
      (error) => {
        console.error(`[Sensor] GPS capture exception: ${error.message}`);
      },
      geoOptions
    );
  }, [patientId, isActive]);

  useEffect(() => {
    if (isActive && patientId) {
      connectRegistrySocket();
      startLocationWatcher();
    }

    // Teardown connections and sensors to block component memory leaks
    return () => {
      if (geoWatcherRef.current !== null && typeof window !== 'undefined') {
        navigator.geolocation.clearWatch(geoWatcherRef.current);
        geoWatcherRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsStreaming(false);
    };
  }, [isActive, patientId, connectRegistrySocket, startLocationWatcher]);

  return { coordinates, isStreaming };
};
