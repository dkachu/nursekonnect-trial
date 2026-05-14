"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { MapPin, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NearbyNurseItem {
  id: number;
  specialization: string;
  years_of_experience: number;
  distance?: string;
  is_verified?: boolean;
  user_details?: {
    email: string;
  };
}

export default function NearbyNursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [nurses, setNurses] = useState<NearbyNurseItem[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [radius, setRadius] = useState<number>(25); // Default search radius boundary in KM
  const didFetch = useRef<boolean>(false);

  const fetchNurses = useCallback(async (lat: number, lng: number) => {
    setFetching(true);
    try {
      // Passes mandatory query coordinates matching our backend PostGIS constraints
      const res = await api.get("accounts/nurses/nearby/", {
        params: {
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          radius: radius
        }
      });
      setNurses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Discovery Engine Connection Failure:", error);
      toast.error("Discovery Sync Failed", { 
        description: "Failed to establish real-time synchronization link with spatial telemetry feeds." 
      });
    } finally {
      // FIXED: Cleared out 'bits' typo, establishing safe native 'finally' execution paths
      setFetching(false);
    }
  }, [radius]);

  // Coordinates data lookup sequences across authorization lifetimes
  useEffect(() => {
    if (authLoading || !user) return;

    const lat = user.profile?.lat;
    const lng = user.profile?.lng;

    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      fetchNurses(Number(lat), Number(lng));
      didFetch.current = true;
    } else {
      setFetching(false);
    }
  }, [user, authLoading, fetchNurses]);

  if (authLoading || fetching) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Scanning Proximity Registry...
        </p>
      </div>
    );
  }

  const hasCoordinates = user?.profile?.lat && user?.profile?.lng;
  if (!nurses.length && !hasCoordinates) {
    return (
      <div className="max-w-xl mx-auto p-8 md:p-12 mt-24 text-center space-y-6 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl max-w-md animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none">Zone Sync Required</h2>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wide leading-relaxed">
            Your residential location coordinates are not yet indexed within the central registry ledger.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/setup')} 
          className="w-full bg-blue-600 hover:bg-zinc-950 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-lg active:scale-[0.99] cursor-pointer"
        >
          COMPLETE DISCOVERY SYNC
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen font-sans bg-white select-none">
      {/* Structural Metric Header Strip */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-dashed border-zinc-100 pb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-600 block uppercase tracking-widest">DISCOVERY FEED LIVE</span>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight uppercase leading-none">
            Local Practitioners
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Radial Ranger Search Parameter Controller Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-2xl border border-zinc-100">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Search Range:</label>
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-transparent font-black text-xs outline-none cursor-pointer text-zinc-800 border-none"
            >
              <option value={10}>10 KM RADIUS</option>
              <option value={25}>25 KM RADIUS</option>
              <option value={50}>50 KM RADIUS</option>
            </select>
          </div>

          <div className="bg-zinc-950 px-5 py-3.5 rounded-2xl text-left border border-zinc-900 flex items-center gap-3 shadow-md">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block leading-none">RADIAL LIMIT CEILING</span>
              <span className="text-xs font-black text-white block mt-1 uppercase tracking-tight">
                {nurses.length} ACTIVE DISCOVERED
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Layout Canvas */}
      {nurses.length === 0 ? (
        <div className="bg-zinc-50/50 border border-dashed border-zinc-200 p-12 rounded-[2.5rem] text-center text-xs text-zinc-400 font-black uppercase tracking-wider">
          No medical practitioners discovered within your local geographic area grid. Try increasing your range limits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nurses.map((nurse) => {
            const { id, user_details, specialization, distance, years_of_experience, is_verified } = nurse;
            const emailStr = user_details?.email || "professional@registry.com";
            const displayName = emailStr.includes("@") ? emailStr.split('@')[0] : emailStr;
            const distanceVal = distance ? parseFloat(distance).toFixed(1) : "0.0";
            const cleanSpecialization = specialization?.replace('_', ' ') || "GENERAL PRACTICE";

            return (
              <div key={id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm hover:border-zinc-200 transition-all duration-200 flex flex-col justify-between gap-6 transform active:scale-[0.995] group">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4 border-b border-dashed border-zinc-100 pb-4">
                    <div className="overflow-hidden">
                      <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight truncate max-w-[150px]">{displayName}</h3>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">{cleanSpecialization} SPECIALIST</p>
                    </div>
                    {is_verified && (
                      <span className="bg-zinc-950 text-white text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 select-none">
                        VETTED
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-zinc-500 space-y-1.5 uppercase bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                    <p className="flex items-center gap-1.5"><MapPin size={10} className="text-zinc-400" /> RANGE PROXIMITY: <span className="text-zinc-800 font-mono font-black">{distanceVal} KM</span></p>
                    <p>💼 TENURE HISTORY: <span className="text-zinc-800 font-black">{years_of_experience || 0} YRS PRACTICE</span></p>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (!id) return toast.error("Synchronization Error", { description: "Invalid registry pointer token." });
                    router.push(`/nurses/${id}/`); 
                  }}
                  className="w-full bg-zinc-50 hover:bg-zinc-950 group-hover:bg-blue-600 group-hover:text-white text-zinc-800 hover:text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest mt-8 border-none transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>INSPECT PROFILE PORTFOLIO</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 duration-200" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
