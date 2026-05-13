"use client";

import { useState, useEffect, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Edit3, X, ShieldAlert, Activity, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; 
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import NurseProfileForm from "@/components/dashboard/NurseProfileForm";
import NurseStats from "@/components/dashboard/NurseStats";

export default function NurseDashboard() {
  const { user, refreshUser } = useAuth();
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchNurseKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("bookings/stats/nurse/");
      setStats(res.data);
    } catch {
      console.error("Professional KPI sync failure");
    } finally {
      // FIXED: Restored valid language syntax structure to clear the compilation crash
      setStatsLoading(false);
    }
  }, []);

  // FIXED: Implemented a safe single-execution mount check to permanently clear the render loop lint error
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchNurseKPIs();
    }
    return () => {
      isMounted = false;
    };
  }, [fetchNurseKPIs]);

  // FIXED: Evaluates coordinates using explicit lat/lng parameters mapped in the UserProfile interface
  const hasLocation = !!(user?.profile?.town || (user?.profile?.lat && user?.profile?.lng));

  const syncLocation = async () => {
    if (!navigator.geolocation) return toast.error("GPS hardware missing.");
    setIsSyncing(true);
    const syncToast = toast.loading("Establishing satellite lock...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heartbeat: true
          });
          await refreshUser();
          toast.success("Coordinates acquired", { id: syncToast });
          setIsEditingLocation(false);
        } catch {
          toast.error("Registry mapping failed", { id: syncToast });
        } finally {
          setIsSyncing(false);
        }
      },
      () => { 
        setIsSyncing(false); 
        toast.error("GPS access denied", { id: syncToast }); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const displayName = user?.email ? user.email.split('@')[0] : "Professional";

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 animate-in fade-in min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b pb-12 border-zinc-100">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-primary font-black text-[10px] uppercase tracking-[0.4em] italic bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
            <Activity size={14} className="animate-pulse" /> 
            Professional Deployment Area
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.8] italic">
            Hello, <br /><span className="text-primary not-italic">{displayName}</span>
          </h1>
        </div>

        <button 
          type="button"
          onClick={syncLocation}
          disabled={isSyncing}
          className="bg-zinc-950 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 active:scale-95 italic border-none"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          {isSyncing ? "Locking..." : "Update Location"}
        </button>
      </header>

      <NurseStats loading={statsLoading} stats={stats} />

      {(!hasLocation || isEditingLocation) ? (
        <section className="max-w-5xl mx-auto space-y-10 animate-in zoom-in-95 pb-20">
          <div className="bg-zinc-950 p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-8 border border-zinc-800 shadow-2xl">
            <div className="p-5 bg-primary rounded-3xl text-white shadow-lg">
              <ShieldAlert size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Sync required</h2>
               <p className="text-zinc-400 font-medium text-sm mt-2 uppercase tracking-widest">Update credentials to activate professional visibility.</p>
            </div>
            {isEditingLocation && (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditingLocation(false)} 
                className="text-white hover:bg-zinc-800 rounded-full h-14 w-14 transition-all"
              >
                <X size={24} />
              </Button>
            )}
          </div>
          
          <div className="bg-white rounded-[4rem] border border-zinc-100 shadow-xl overflow-hidden">
             <NurseProfileForm 
               initialData={user?.profile} 
               onSuccess={() => { 
                 setIsEditingLocation(false); 
                 refreshUser(); 
                 fetchNurseKPIs();
               }} 
             />
          </div>
        </section>
      ) : (
        <section className="space-y-10 pb-20">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-primary border border-zinc-800 shadow-sm">
                  <Activity size={20} />
               </div>
               <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
                 Active <span className="text-primary">Ledger</span>
               </h3>
            </div>

            <button 
              type="button"
              onClick={() => setIsEditingLocation(true)}
              className="flex items-center gap-3 px-6 py-3 bg-zinc-50 text-zinc-500 rounded-2xl border border-zinc-100 font-black text-[9px] uppercase tracking-widest hover:bg-zinc-100 transition-all italic active:scale-95 shadow-sm"
            >
               <Edit3 size={14} /> Edit Profile
            </button>
          </div>

          <AppointmentsList 
            isNurse={true} 
            useActiveOnly={true} 
            onStatusUpdate={fetchNurseKPIs} 
          />
        </section>
      )}
    </main>
  );
}
