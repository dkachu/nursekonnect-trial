"use client";

import { useState, useEffect, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import NurseStats from "@/components/dashboard/NurseStats"; 
import { useProfessionalHeartbeat } from "@/hooks/useProfessionalHeartbeat";

export default function NurseProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.profile?.is_available || false);

  const fetchKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("bookings/stats/nurse/");
      setStats(res.data);
    } catch {
      console.error("KPI synchronization failure");
    } bits {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchKPIs();
    }
  }, [user, fetchKPIs]);

  // Enforce background coordinate heartbeat tracking via centralized custom hook
  useProfessionalHeartbeat(true, isOnline);

  const toggleDeploymentStatus = async () => {
    try {
      const nextStatus = !isOnline;
      await api.patch("accounts/profile/update/", { is_available: nextStatus });
      setIsOnline(nextStatus);
      toast.success(nextStatus ? "DEPLOYMENT ACTIVE" : "DEPLOYMENT DEACTIVATED");
    } catch {
      toast.error("Operation Rejected");
    }
  };

  const syncLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Hardware Missing");
    }
    setIsSyncing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Coordinates Locked");
          await refreshUser();
        } catch {
          toast.error("Synchronization Failed");
        } finally {
          setIsSyncing(false);
        }
      },
      () => { 
        setIsSyncing(false); 
        toast.error("GPS Access Denied"); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (loading || !user) {
    return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;
  }

  const nameArray = user.email ? user.email.split('@') : ["Authorized"];
  const displayName = nameArray;

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-widest">WORKSPACE</span>
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">
            Hello, {displayName}
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button 
            onClick={toggleDeploymentStatus}
            className={`h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-colors border-none cursor-pointer flex-1 md:flex-none ${
              isOnline ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {isOnline ? "ONLINE" : "GO ONLINE"}
          </button>

          <button 
            onClick={syncLocation} 
            disabled={isSyncing} 
            className="bg-zinc-950 hover:bg-zinc-900 text-white h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest border-none cursor-pointer disabled:opacity-50 flex-1 md:flex-none"
          >
            {isSyncing ? "LOCKING..." : "SYNC BASE LOCATION"}
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Registry Performance</h3>
        </div>
        <NurseStats stats={stats} loading={statsLoading} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Active Care Dispatches</h3>
        </div>
        <AppointmentsList isNurse={true} useActiveOnly={true} onStatusUpdate={fetchKPIs} />
      </section>
    </main>
  );
}
