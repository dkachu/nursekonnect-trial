"use client";

import React, { useState, useEffect, useCallback, useRef } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Activity, ShieldCheck, Radio } from "lucide-react";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import NurseStats from "@/components/dashboard/NurseStats"; 
import { useProfessionalHeartbeat } from "@/hooks/useProfessionalHeartbeat";
import { useRegistrySync } from "@/hooks/useRegistrySync";

interface StatsPayload {
  active_dispatches: number;
  gross_earnings: number;
  total_success: number;
  registry_rating: string | number;
}

export default function NurseProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const didFetchInitial = useRef(false);

  useEffect(() => {
    if (user?.profile) {
      setIsOnline(!!user.profile.is_available);
    }
  }, [user]);

  const { isConnected, sendWebSocketMessage } = useRegistrySync({
    onNewDispatch: () => {
      fetchKPIs();
    }
  });

  useProfessionalHeartbeat({
    isNurse: !!user?.is_nurse,
    isOnline: isOnline,
    isAvailable: isOnline,
    socketConnected: isConnected,
    sendWebSocketMessage: sendWebSocketMessage
  });

  const fetchKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("bookings/active/");
      
      if (Array.isArray(res.data)) {
        const completed = res.data.filter(b => b.status === "completed");
        const earnings = completed.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
        const ratedBookings = completed.filter(b => b.rating !== null && b.rating !== undefined);
        const avgRating = ratedBookings.length 
          ? (ratedBookings.reduce((sum, b) => sum + Number(b.rating), 0) / ratedBookings.length) 
          : "5.0";

        setStats({
          active_dispatches: res.data.filter(b => ["pending", "accepted", "in_progress"].includes(b.status)).length,
          gross_earnings: earnings,
          total_success: completed.length,
          registry_rating: avgRating
        });
      }
    } catch (error) {
      console.error("KPI synchronization failure across registry nodes:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !didFetchInitial.current) {
      fetchKPIs();
      didFetchInitial.current = true;
    }
  }, [user, fetchKPIs]);

  const toggleDeploymentStatus = async () => {
    try {
      const nextStatus = !isOnline;
      await api.put("accounts/profile/update/", { is_available: nextStatus });
      setIsOnline(nextStatus);
      toast.success(nextStatus ? "DEPLOYMENT CHANNEL ACTIVE" : "DEPLOYMENT CHANNEL DEACTIVATED");
    } catch {
      toast.error("Operation Rejected", { description: "Verify compliance locks and retry." });
    }
  };

  const syncLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return toast.error("Hardware Limitation", { description: "GPS hardware module is missing or unauthorized." });
    }
    
    setIsSyncing(true);
    const syncToast = toast.loading("Aligning baseline geographical data points...");
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.put("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Base Coordinates Secured", { id: syncToast });
          await refreshUser();
        } catch {
          toast.error("Synchronization Failed", { id: syncToast });
        } finally {
          setIsSyncing(false);
        }
      },
      (error) => { 
        setIsSyncing(false); 
        toast.error("GPS Access Denied", { id: syncToast, description: error.message }); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Synchronising Registry Handshake...
        </p>
      </div>
    );
  }

  const identityString = user.email || "Practitioner Account";
  const displayName = identityString.includes("@") ? identityString.split("@")[0] : identityString;

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen font-sans bg-white select-none">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-dashed border-zinc-100 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            <Activity size={12} className="animate-pulse" /> Clinical Workspace
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Hello, <span className="text-blue-600 not-italic">{displayName}</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={toggleDeploymentStatus}
            className={`h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 border-none active:scale-[0.98] ${
              isOnline 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border border-zinc-200"
            }`}
          >
            <Radio size={14} className={isOnline ? "animate-spin duration-3000" : ""} />
            <span>{isOnline ? "ONLINE FOR DISPATCH" : "GO ONLINE"}</span>
          </button>

          <button 
            type="button"
            onClick={syncLocation} 
            disabled={isSyncing} 
            className="bg-zinc-950 hover:bg-zinc-800 text-white h-16 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-none cursor-pointer shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={14} /> : "⚡"}
            <span>{isSyncing ? "CALIBRATING MATRICES..." : "SYNC BASE LOCATION"}</span>
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-zinc-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 italic">
            Registry Performance KPI Analytics
          </h2>
        </div>
        <NurseStats stats={stats} loading={statsLoading} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Radio size={16} className="text-zinc-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 italic">
            Active Care Dispatches Queue
          </h2>
        </div>
        <AppointmentsList isNurse={true} useActiveOnly={true} onStatusUpdate={fetchKPIs} />
      </section>
    </main>
  );
}
