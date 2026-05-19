'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useLocationTracker = (patientId: number | string | null, isActive = false) => {
  // Extract global authentication context parameters to safeguard connection bounds
  const { user } = useAuth();
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [isStreaming, setIsStreaming] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const geoWatcherRef = useRef<number | null>(null);

  // Parse websocket route configuration using unified api variables
  const connectRegistrySocket = useCallback(() => {
    if (typeof window === 'undefined' || !patientId || !isActive || !user || !user.id) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsScheme}://${baseHost}/ws/accounts/registry/`;

    console.log(`[Socket] Syncing User #${user.id} location with registry: ${wsUrl}`);
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
  }, [patientId, isActive, user]);

  // Track high-accuracy hardware sensor readings streams
  const startLocationWatcher = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator) || !isActive || !user || !user.id) return;

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
  }, [patientId, isActive, user]);

  useEffect(() => {
    // Secure Guard: Block socket instantiation and sensor pooling if user context is empty
    if (isActive && patientId && user && user.id) {
      connectRegistrySocket();
      startLocationWatcher();
    } else {
      setIsStreaming(false);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = None;
      }
    }

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
  }, [isActive, patientId, user, connectRegistrySocket, startLocationWatcher]);

  return { coordinates, isStreaming };
};
