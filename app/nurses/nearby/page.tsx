"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Navigation, Loader2, ArrowRight, ShieldCheck, AlertCircle, Activity, Zap } from "lucide-react";
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
        toast.error("Registry Offline", { description: "Sync with local network failed." });
      } finally {
        setFetching(false);
      }
    };
    fetchNurses();
  }, [user, authLoading]);

  if (authLoading || fetching) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white transition-all">
      <div className="relative">
        <Loader2 className="animate-spin text-primary" size={48} />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950" size={16} />
      </div>
      <div className="text-center space-y-2">
        <p className="font-black text-zinc-900 uppercase tracking-[0.4em] text-[11px] italic">Discovery Mode</p>
        <p className="font-bold text-zinc-400 uppercase tracking-widest text-[9px] animate-pulse">Scanning local registry...</p>
      </div>
    </div>
  );

  const profile = user?.profile || user;
  if (!nurses.length && !profile?.town) {
    return (
      <div className="max-w-xl mx-auto p-16 mt-24 text-center space-y-8 bg-white rounded-[3.5rem] border border-zinc-100 shadow-2xl">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} className="text-amber-500" />
        </div>
        <div className="space-y-2">
            <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">Zone Sync Required</h2>
            <p className="text-zinc-500 font-medium text-sm">Residence coordinates are not yet indexed in the central ledger.</p>
        </div>
        <Button onClick={() => router.push('/setup')} className="bg-zinc-950 hover:bg-primary text-white rounded-2xl h-20 px-12 font-black uppercase text-[11px] tracking-widest w-full shadow-xl">Complete Sync</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 animate-in fade-in duration-1000 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b pb-16">
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-primary font-black text-[10px] uppercase tracking-[0.4em] italic">
                <Activity size={14} className="animate-pulse" /> Service Marketplace Active
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase leading-none italic">
                Local <br /><span className="text-primary not-italic">Expertise</span>
            </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-950 px-8 py-5 rounded-[2rem] shadow-2xl border border-zinc-800">
            <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Discovery Radius</p>
                <p className="text-2xl font-black text-white tracking-tighter italic">50.0 <span className="text-[10px] text-zinc-500 uppercase ml-1">KM</span></p>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800 rotate-[20deg]" />
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{nurses.length} Professionals</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
        {nurses.map((nurse) => {
          const { id, user_details, specialization, distance, years_of_experience, is_verified } = nurse;
          const email = user_details?.email || "professional@registry.com";
          const displayName = email.split('@')[0];

          return (
            <div key={id} className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-700 group flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 bg-zinc-950 rounded-[1.8rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl uppercase transition-all group-hover:bg-primary italic">
                    {displayName ? displayName[0].toUpperCase() : "N"}
                  </div>
                  {is_verified && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-zinc-900 capitalize tracking-tighter italic leading-none">{displayName}</h3>
                  <p className="text-primary font-black text-[11px] uppercase tracking-[0.2em] italic">{specialization?.replace('_', ' ')} specialist</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                   <div className="bg-zinc-900 px-5 py-2.5 rounded-full flex items-center gap-3 border border-zinc-800 shadow-lg">
                      <Navigation size={12} className="text-primary fill-primary" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
                        {distance ? parseFloat(distance).toFixed(1) : "0.0"} KM
                      </span>
                   </div>
                   <div className="px-5 py-2.5 bg-zinc-50 rounded-full border border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{years_of_experience || 0} YRS Exp.</span>
                   </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (!id) return toast.error("Handshake Error");
                  router.push(`/nurses/${id}/`); 
                }}
                className="w-full bg-zinc-50 group-hover:bg-primary text-zinc-950 group-hover:text-white h-24 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.4em] mt-12 transition-all italic border-none shadow-sm active:scale-95"
              >
                Inspect Portfolio <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
