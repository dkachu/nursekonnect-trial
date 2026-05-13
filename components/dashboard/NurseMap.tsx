"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface NearbyNurse {
  id: number;
  user_details?: { email: string; };
  specialization?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  location?: { coordinates: [number, number]; };
}

const MapWrapper = dynamic(() => import("./MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-zinc-50 rounded-3xl border border-zinc-200 flex flex-col items-center justify-center">
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest animate-pulse">Initializing Telemetry Engine...</p>
    </div>
  ),
});

export default function NurseMap() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const [nurses, setNurses] = useState<NearbyNurse[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const fetchNearbyNurses = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await api.get("accounts/nurses/nearby/", {
        params: { lat, lng }
      });
      setNurses(Array.isArray(res.data) ? res.data : res.data.results || []);
      setMapCenter([lat, lng]);
    } catch (err) {
      console.error("Discovery Connection Failed", err);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    const profile = user.profile;
    const lat = profile?.lat || (profile?.location?.coordinates ? profile.location.coordinates[1] : null);
    const lng = profile?.lng || (profile?.location?.coordinates ? profile.location.coordinates[0] : null);

    if (lat && lng) {
      fetchNearbyNurses(Number(lat), Number(lng));
    }
  }, [user, authLoading, fetchNearbyNurses]);

  if (authLoading || !mapCenter) {
    return (
      <div className="h-[500px] w-full bg-zinc-50 rounded-3xl border border-zinc-200 flex flex-col items-center justify-center">
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest animate-pulse">Calibrating Discovery Zone...</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-xl relative bg-zinc-100">
      <MapWrapper 
        mapCenter={mapCenter} 
        nurses={nurses} 
        building={user?.profile?.building || "Residence"} 
        router={router} 
      />
      <div className="absolute top-6 left-6 z-[1000] bg-zinc-950 px-4 py-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Discovery Active</p>
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter leading-none mt-0.5">
            {nurses.length} Professionals near {user?.profile?.town || "your zone"}
          </p>
        </div>
      </div>
    </div>
  );
}
