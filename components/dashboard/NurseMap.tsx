"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import MapWrapper from "./MapWrapper";

interface NearbyNurse {
  id: number;
  user_details?: { email: string; };
  specialization?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  location?: { coordinates: [number, number]; };
}

export default function NurseMap() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const [nurses, setNurses] = useState<NearbyNurse[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const didFetch = useRef<boolean>(false);

  const fetchNearbyNurses = useCallback(async (lat: number, lng: number) => {
    try {
      // FIXED: Packages query strings matching the requirements of your PostGIS backend views
      const res = await api.get("accounts/nurses/nearby/", {
        params: { 
          lat: lat.toFixed(6), 
          lng: lng.toFixed(6),
          radius: 25 // Enforces our default search radius barrier limit
        }
      });
      setNurses(Array.isArray(res.data) ? res.data : []);
      setMapCenter([lat, lng]);
    } catch (err) {
      console.error("Discovery Connection Failed:", err);
      toast.error("Spatial Engine Error", {
        description: "Failed to establish real-time data link with proximity registry logs."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const profile = user.profile;
    // FIXED: Stripped unmapped nested parameters to align with your explicit UserProfile type structure
    const lat = profile?.lat;
    const lng = profile?.lng;

    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      if (!didFetch.current) {
        fetchNearbyNurses(Number(lat), Number(lng));
        didFetch.current = true;
      }
    } else {
      setLoading(false);
      // Fallback redirects user to onboarding gateway if profile lacks indexing
      router.replace("/setup");
    }
  }, [user, authLoading, fetchNearbyNurses, router]);

  if (authLoading || loading || !mapCenter) {
    return (
      <div className="h-[600px] w-full bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col items-center justify-center font-sans select-none p-6">
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest animate-pulse">
          Calibrating Proximity Telemetry Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-sm relative bg-zinc-50 border border-zinc-100 group font-sans select-none">
      <MapWrapper 
        mapCenter={mapCenter} 
        nurses={nurses} 
        building={user?.profile?.building || "Primary Residence"} 
        router={router} 
      />
      
      {/* Telemetry Active Hud Panel overlay element */}
      <div className="absolute top-6 left-6 z- bg-zinc-950 px-4 py-3 rounded-2xl shadow-2xl border border-zinc-900 flex items-center gap-3 transition-transform duration-300 group-hover:scale-[1.01]">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Discovery Active</h3>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight mt-1.5 leading-none">
            {nurses.length} Professionals near {user?.profile?.town || "your zone"}
          </p>
        </div>
      </div>
    </div>
  );
}
