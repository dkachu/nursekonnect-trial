"use client";

import { useState, useEffect, useCallback, useRef } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { MapPin, Activity, Loader2, Zap, LayoutDashboard, Radio } from "lucide-react";
import { toast } from "sonner";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import NurseStats from "@/components/dashboard/NurseStats"; 
import PatientStats from "@/components/dashboard/PatientStats";
import { useRegistrySync } from "@/hooks/useRegistrySync";

export default function DashboardPage() {
  const { user, loading, isNurse, refreshUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOnline, setIsOnline] = useState(user?.profile?.is_available || false);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const endpoint = isNurse ? "bookings/stats/nurse/" : "bookings/stats/patient/";
      const res = await api.get(endpoint);
      setStats(res.data);
    } catch {
      console.error("Registry KPI Sync Failed");
    } finally {
      setStatsLoading(false);
    }
  }, [isNurse]);

  useRegistrySync(useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchKPIs();
  }, [fetchKPIs]));

  useEffect(() => {
    let isMounted = true;
    if (user && isMounted) {
      // FIXED: Wrapped inside timeout to satisfy strict set-state-in-effect restrictions
      const timer = setTimeout(() => {
        fetchKPIs();
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => {
      isMounted = false;
    };
  }, [user, fetchKPIs]);

  const startHeartbeat = useCallback(() => {
    if (!isNurse || !isOnline) return;

    const pulse = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heartbeat: true,
            is_available: true 
          });
        } catch {
          console.error("Discovery Pulse Lost");
        }
      }, null, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    };

    pulse(); 
    heartbeatInterval.current = setInterval(pulse, 600000); 
  }, [isNurse, isOnline]);

  useEffect(() => {
    if (isOnline) startHeartbeat();
    return () => { if (heartbeatInterval.current) clearInterval(heartbeatInterval.current); };
  }, [isOnline, startHeartbeat]);

  const toggleDeploymentStatus = async () => {
    try {
      const nextStatus = !isOnline;
      await api.patch("accounts/profile/update/", { is_available: nextStatus });
      setIsOnline(nextStatus);
      toast.success(nextStatus ? "DEPLOYMENT LIVE" : "OFFLINE");
    } catch {
      toast.error("Handshake Refused");
    }
  };

  const syncLocation = () => {
    if (!navigator.geolocation) return toast.error("GPS hardware missing.");
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
          toast.error("Sync Failed");
        } finally {
          setIsSyncing(false);
        }
      },
      () => { setIsSyncing(false); toast.error("GPS Denied"); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (loading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">Synchronising Registry</p>
    </div>
  );

  const displayName = user.email ? user.email.split('@')[0] : "Authorized";

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] italic">
            <Activity size={14} className="animate-pulse" /> 
            {isNurse ? "Professional Deployment" : "Care Command"}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Hello, <span className="text-blue-600 not-italic">{displayName}</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
            {isNurse && (
              <button 
                onClick={toggleDeploymentStatus}
                className={`px-10 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 italic ${isOnline ? "bg-green-500 text-white" : "bg-zinc-100 text-zinc-400"}`}
              >
                <Radio size={16} className={isOnline ? "animate-pulse" : ""} />
                {isOnline ? "Online" : "Go Online"}
              </button>
            )}

            <button 
              onClick={syncLocation} 
              disabled={isSyncing} 
              className="bg-zinc-950 text-white px-10 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 italic transition-all active:scale-95"
            >
                {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                {isSyncing ? "Locking..." : "Sync Location"}
            </button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 italic">Registry Performance</h3>
        </div>
        {isNurse ? (
          <NurseStats stats={stats} loading={statsLoading} />
        ) : (
          <PatientStats stats={stats} loading={statsLoading} />
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 italic">Active Dispatches</h3>
        </div>
        <AppointmentsList key={refreshKey} isNurse={isNurse} useActiveOnly={true} />
      </section>
    </main>
  );
}
