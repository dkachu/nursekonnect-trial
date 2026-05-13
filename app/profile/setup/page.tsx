"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ShieldCheck, Navigation, MapPin, ShieldAlert, Activity, Loader2 } from "lucide-react";

// Registry Profile Components
import NurseProfileForm from "@/components/dashboard/NurseProfileForm";
import PatientProfileForm from "@/components/dashboard/PatientProfileForm";

/**
 * NURSEKONNEKT PROFILE SETUP
 * Enforces mandatory metadata synchronization before hub entry.
 */
export default function ProfileSetupPage() {
  const { user, loading, isNurse, isSynced } = useAuth();
  const router = useRouter();

  /**
   * Configuration Audit
   * FIXED: Explicit type-safe verification checking parameters directly 
   * inside the nested user.profile layer to satisfy TypeScript and pass Vercel.
   */
  const isConfigured = useMemo(() => {
    if (!user?.profile) return false;
    return !!(user.profile.town && user.profile.building && isSynced);
  }, [user, isSynced]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (isConfigured) {
        // Handshake verified: redirect to active professional or recipient workspace
        const target = isNurse ? "/profile" : "/dashboard";
        router.replace(target);
      }
    }
  }, [user, loading, isNurse, isConfigured, router]);

  if (loading || !user || isConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground" size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">authorising registry...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 lg:p-24 space-y-16 animate-in fade-in duration-1000 min-h-screen">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 text-primary font-black text-[10px] uppercase tracking-[0.4em] italic bg-blue-50 w-fit px-4 py-1.5 rounded-full border border-blue-100">
            {isNurse ? <ShieldCheck size={14}/> : <MapPin size={14}/>} 
            {isNurse ? "Phase 02: Credentialing & GPS" : "Phase 02: Zone Activation"}
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.8] italic">
            Final Sync
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-xl leading-relaxed uppercase tracking-tight italic">
            {isNurse 
              ? "Validate NCK license and lock professional coordinates for visibility." 
              : "Synchronise residence coordinates to enable real-time discovery."}
          </p>
        </div>

        <div className="px-8 py-5 bg-zinc-950 rounded-3xl shadow-2xl flex items-center gap-4 border border-zinc-800">
            <div className="relative">
               {isNurse ? <ShieldAlert size={18} className="text-primary" /> : <Navigation size={18} className="text-primary" />}
               <span className="absolute -top-1 -right-1 flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Authenticated</span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">
                    {isNurse ? "Professional" : "Recipient"}
                </span>
            </div>
        </div>
      </header>

      {/* Dynamic Registry Form Injector */}
      <section className="bg-zinc-50 p-1 rounded-[4.2rem] border border-zinc-100 shadow-2xl overflow-hidden">
        <div className="bg-white p-2 md:p-8 rounded-[4rem] shadow-sm">
            {isNurse ? (
              <NurseProfileForm initialData={user.profile} />
            ) : (
              <PatientProfileForm initialData={user.profile} />
            )}
        </div>
      </section>

      <footer className="text-center py-10 space-y-6">
        <div className="flex items-center justify-center gap-6 opacity-20 grayscale">
            <div className="h-[1px] w-24 bg-zinc-400" />
            <ShieldCheck size={24} />
            <div className="h-[1px] w-24 bg-zinc-400" />
        </div>
        <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest leading-relaxed italic">
            Clinical and location data is secured via end-to-end handshake protocol.
        </p>
      </footer>
    </main>
  );
}
