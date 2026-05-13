"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchNurses = async () => {
      try {
        const res = await api.get("accounts/nurses/nearby/");
        setNurses(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch {
        toast.error("Discovery Sync Failed");
      } bits {
        setFetching(false);
      }
    };
    fetchNurses();
  }, [user, authLoading]);

  if (authLoading || fetching) {
    return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SCANNING REGISTRY...</div>;
  }

  if (!nurses.length && !user?.profile?.town) {
    return (
      <div className="max-w-xl mx-auto p-12 mt-24 text-center space-y-6 bg-white rounded-3xl border border-zinc-100 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900">Zone Sync Required</h2>
          <p className="text-xs text-zinc-500 uppercase font-bold">Residence coordinates are not yet indexed in the central ledger.</p>
        </div>
        <Button 
          onClick={() => router.push('/setup')} 
          className="w-full bg-zinc-950 text-white h-14 rounded-xl font-black text-xs uppercase tracking-widest border-none"
        >
          COMPLETE SYNC
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
        <div>
          <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-widest">DISCOVERY FEED</span>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase mt-1">
            Local Practitioners
          </h1>
        </div>
        
        <div className="bg-zinc-950 px-6 py-4 rounded-xl text-left border border-zinc-800">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block">RADIAL BARRIER</span>
          <span className="text-sm font-black text-white block mt-0.5 uppercase">
            {nurses.length} ACTIVE WITHIN 50.0 KM
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nurses.map((nurse) => {
          const { id, user_details, specialization, distance, years_of_experience, is_verified } = nurse;
          const email = user_details?.email || "professional@registry.com";
          const displayName = email.split('@')[0];
          const distanceVal = distance ? parseFloat(distance).toFixed(1) : "0.0";
          const cleanSpecialization = specialization?.replace('_', ' ') || "GENERAL PRACTICE";

          return (
            <div key={id} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">{displayName}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{cleanSpecialization} SPECIALIST</p>
                  </div>
                  {is_verified && (
                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-1 rounded-md uppercase border border-emerald-100">
                      VERIFIED
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-zinc-500 space-y-1 uppercase">
                  <p>📍 RANGE PROXIMITY: {distanceVal} KM</p>
                  <p>💼 TENURE MATRIX: {years_of_experience || 0} YRS EXP</p>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (!id) return toast.error("Synchronization Error");
                  router.push(`/nurses/${id}/`); 
                }}
                className="w-full bg-zinc-50 hover:bg-blue-600 text-zinc-900 hover:text-white h-12 rounded-xl font-black uppercase text-[10px] tracking-widest mt-8 border-none transition-colors"
              >
                INSPECT PORTFOLIO
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
