'use client';

import { useEffect, useState, useRef } from 'react';

export const useSpatialRegistry = () => {
  const [isLive, setIsLive] = useState(false);
  const [telemetryStream, setTelemetryStream] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // SSR Protection Guard: Terminates execution if compiled on server layers
    if (typeof window === 'undefined') return;

    // Normalize protocol and base host matching your shared API configuration
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api/';
    
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const socketUrl = `${wsScheme}://${baseHost}/ws/api/accounts/registry/`;

    console.log(`[Socket] Syncing with spatial hub: ${socketUrl}`);
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsLive(true);
      console.log('[Socket] Spatial registry tunnel accepted.');
      
      // Request client coordinates from native browser sensor blocks once open
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const initializationPacket = {
              action: 'TRANSMIT_LOCATION_DATA',
              coordinates: { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              }
            };
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(initializationPacket));
            }
          },
          (err) => console.warn('[Sensor] Initialization position blocked:', err.message),
          { enableHighAccuracy: true }
        );
      }
    };

    socket.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        console.log('[Socket] Signal pulse intercepted:', incomingData);
        setTelemetryStream((prev) => [...prev, incomingData]);
      } catch (err) {
        console.error('[Socket] Failed to parse payload stream:', err);
      }
    };

    socket.onclose = (error) => {
      setIsLive(false);
      console.log(`[Socket] Tunnel closed cleanly. Code: ${error.code}`);
    };

    socket.onerror = (err) => {
      console.error('[Socket] Wire boundary tracking exception:', err);
    };

    // Structural cleanup mapping to prevent active connection leaks
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted.');
      }
    };
  }, []);

  return { isLive, telemetryStream };
};
