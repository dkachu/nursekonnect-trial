'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export const useLocationTracker = (patientId, isActive = false) => {
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [isStreaming, setIsStreaming] = useState(false);
  
  const socketRef = useRef(null);
  const geoWatcherRef = useRef(null);

  // 1. Establish the dedicated Spatial Registry Socket tunnel
  const connectRegistrySocket = useCallback(() => {
    if (typeof window === 'undefined' || !patientId || !isActive) return;

    // Prevent duplicate active connections
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production';
    const wsUrl = isProd
      ? `wss://${process.env.NEXT_PUBLIC_API_DOMAIN}/ws/registry/`
      : `ws://127.0.0.1:10000/ws/registry/`;

    console.log(`📡 [Telemetry] Connecting to Spatial Registry Hub: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('✅ [Telemetry] Spatial Registry socket open.');
      setIsStreaming(true);
    };

    ws.onclose = () => {
      setIsStreaming(false);
      console.log('🔌 [Telemetry] Spatial Registry socket disconnected.');
    };

    ws.onerror = (err) => {
      console.error('❌ [Telemetry] Socket error:', err);
    };
  }, [patientId, isActive]);

  // 2. High-Accuracy Geolocation Stream Watcher loop
  const startLocationWatcher = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !isActive) return;

    const geoOptions = {
      enableHighAccuracy: true, // Forces physical GPS modules instead of approximate IP tower parsing
      timeout: 10000,           // Throw error if hardware takes longer than 10s to acquire lock
      maximumAge: 0,            // Prevent returning stale coordinates from memory cache
    };

    geoWatcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCoordinates(currentCoords);
        console.log(`📍 [GPS] Telemetry Updated: [Lat: ${currentCoords.lat}, Lng: ${currentCoords.lng}]`);

        // 3. Emit the updated matrix data to the RegistryConsumer mapping target
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            json.stringify({
              action: 'TRANSMIT_LOCATION_DATA',
              patient_id: patientId,
              coordinates: currentCoords,
            })
          );
        }
      },
      (error) => {
        console.error(`❌ [GPS] Sensor capture error (Code ${error.code}):`, error.message);
      },
      geoOptions
    );
  }, [patientId, isActive]);

  useEffect(() => {
    if (isActive && patientId) {
      connectRegistrySocket();
      startLocationWatcher();
    }

    // 4. Memory Leak Teardown Protection: Clears telemetry sensors and sockets completely
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
