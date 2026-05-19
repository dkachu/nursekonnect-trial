'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useSpatialRegistry = () => {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [telemetryStream, setTelemetryStream] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Secure Guard: Abort socket connection upgrades immediately if the user context is unauthenticated
    if (!user || !user.id) {
      setIsLive(false);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    
    const baseHost = apiUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");

    const socketUrl = `${wsScheme}://${baseHost}/ws/accounts/registry/`;

    console.log(`[Socket] Syncing User #${user.id} with spatial hub: ${socketUrl}`);
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsLive(true);
      console.log('[Socket] Spatial registry tunnel accepted.');
      
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

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted.');
        socketRef.current = null;
      }
    };
  }, [user]);

  return { isLive, telemetryStream };
};
