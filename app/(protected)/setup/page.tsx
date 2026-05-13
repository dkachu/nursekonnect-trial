"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import NurseProfileForm from "@/components/dashboard/NurseProfileForm";
import PatientProfileForm from "@/components/dashboard/PatientProfileForm";

export default function ProfileSetupPage() {
  const { user, loading, isNurse, isSynced } = useAuth();
  const router = useRouter();

  const isConfigured = useMemo(() => {
    if (!user?.profile) return false;
    return !!(user.profile.town?.trim() && user.profile.building?.trim() && isSynced);
  }, [user, isSynced]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
        return;
      }

      if (isConfigured) {
        router.replace(isNurse ? "/profile" : "/dashboard");
      }
    }
  }, [user, loading, isNurse, isConfigured, router]);

  if (loading || !user || isConfigured) {
    return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-6 lg:py-24 space-y-12 min-h-screen">
      <header className="border-b pb-6 text-left">
        <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-widest">PHASE 02</span>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase mt-1">
          Final Synchronization
        </h1>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide mt-2">
          {isNurse 
            ? "Validate professional credentials and lock GPS telemetry coordinates for visibility." 
            : "Synchronize physical residence coordinates to enable real-time practitioner discovery."}
        </p>
      </header>

      <section className="bg-white border rounded-3xl p-6 shadow-sm">
        {isNurse ? (
          <NurseProfileForm initialData={user.profile} />
        ) : (
          <PatientProfileForm initialData={user.profile} />
        )}
      </section>

      <footer className="text-center pt-6">
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          Clinical and spatial registry data is encrypted in transit via secure handshake protocols.
        </p>
      </footer>
    </main>
  );
}
