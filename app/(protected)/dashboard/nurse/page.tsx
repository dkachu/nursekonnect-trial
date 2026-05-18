"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useRegistrySync } from "@/hooks/useRegistrySync";
import NurseStats from "@/components/dashboard/NurseStats";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import { toast } from "sonner";

interface UserDetails {
  id: number;
  email: string;
  phone_number: string;
  is_nurse: boolean;
}

interface NurseProfile {
  id: number;
  specialization: string;
  years_of_experience: number;
  town: string;
  building: string;
  license_number: string;
  is_verified: boolean;
  is_available: boolean;
  is_online: boolean;
}

interface LiveBooking {
  id: number;
  patient_email: string;
  patient_phone: string;
  service_description: string;
  scheduled_date: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "declined" | "cancelled";
  is_verified_arrival: boolean;
}

export default function NurseDashboardPage() {
  const [profileData, setProfileData] = useState<{ user_details: UserDetails; profile: NurseProfile } | null>(null);
  const [activeDispatches, setActiveDispatches] = useState<LiveBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dispatchesLoading, setDispatchesLoading] = useState<boolean>(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);

  // Sync active booking rows using absolute paths managed via api proxy interceptors
  const fetchActiveDispatches = useCallback(async () => {
    setDispatchesLoading(true);
    try {
      const res = await api.get("bookings/active/");
      setActiveDispatches(res.data || []);
    } catch (err) {
      console.error("Failed to sync structural booking layers:", err);
    } finally {
      setDispatchesLoading(false);
    }
  }, []);

  // Connect backend WebSocket channels to intercept and push live updates
  const { isConnected } = useRegistrySync({
    onNewDispatch: fetchActiveDispatches
  });

  useEffect(() => {
    api.get("accounts/profile/me/")
      .then((res) => {
        setProfileData(res.data);
        setLoading(false);
        fetchActiveDispatches();
      })
      .catch((err) => {
        console.error("Account verification failure:", err);
        toast.error("Handshake Refused", { description: "Re-authenticate to open care console tracks." });
        setLoading(false);
      });
  }, [fetchActiveDispatches]);

  // Patch lifecycle allocation records back to central bookings viewsets
  const handleLifecycleMutation = async (bookingId: number, nextState: string, startSession = false) => {
    setMutatingId(bookingId);
    try {
      const payload = startSession ? { start_session: true } : { status: nextState };
      const res = await api.patch(`bookings/${bookingId}/status/`, payload);

      if (res.status === 200) {
        toast.success("DISPATCH RECORD MUTATED", {
          description: startSession 
            ? "Arrival authenticated. Care timeline session marked live." 
            : `Allocation record state successfully updated to ${nextState}.`
        });
        await fetchActiveDispatches();
      }
    } catch (err) {
      console.error("Lifecycle mutation failed:", err);
      toast.error("State Mutation Refused", { description: "The central core database rejected the lifecycle switch request." });
    } finally {
      setMutatingId(null);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Retrieving Professional Diagnostics Pipeline...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen font-sans bg-white select-none animate-in fade-in-50 duration-200">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-dashed border-zinc-100 pb-8">
        <div className="space-y-2">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Clinical Logistics Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Practitioner Terminal
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl border border-solid text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
            isConnected 
              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
              : "bg-red-50 border-red-100 text-red-700"
          }`}>
            {isConnected ? "Mesh Stream Connected" : "Tunnel Disconnected"}
          </span>
        </div>
      </header>

      <NurseStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-solid border-zinc-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              Incoming Realtime Care Requests Demand Queue
            </h3>
            {dispatchesLoading && <span className="text-[10px] font-bold text-zinc-400 animate-pulse uppercase">Syncing...</span>}
          </div>

          {activeDispatches.length === 0 ? (
            <AppointmentsList />
          ) : (
            <div className="space-y-4">
              {activeDispatches.map((booking) => (
                <div key={booking.id} className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm space-y-4 flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="bg-zinc-100 text-zinc-700 font-mono text-xs px-2 py-0.5 rounded-md font-bold">#ID-{booking.id}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        booking.status === "pending" ? "bg-amber-50 text-amber-700 border border-solid border-amber-100" :
                        booking.status === "accepted" ? "bg-blue-50 text-blue-700 border border-solid border-blue-100" :
                        "bg-purple-50 text-purple-700 border border-solid border-purple-100 animate-pulse"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800 leading-relaxed italic">"{booking.service_description}"</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-500 pt-1">
                      <div>Patient Ref Key: {booking.patient_email}</div>
                      <div>Scheduled: {new Date(booking.scheduled_date).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {booking.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={mutatingId === booking.id}
                          onClick={() => handleLifecycleMutation(booking.id, "accepted")}
                          className="bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 text-white disabled:text-zinc-400 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={mutatingId === booking.id}
                          onClick={() => handleLifecycleMutation(booking.id, "declined")}
                          className="bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-50 text-zinc-700 disabled:text-zinc-400 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === "accepted" && !booking.is_verified_arrival && (
                      <button
                        type="button"
                        disabled={mutatingId === booking.id}
                        onClick={() => handleLifecycleMutation(booking.id, "in_progress", true)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 text-white disabled:text-zinc-400 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all"
                      >
                        Verify Arrival & Start Session
                      </button>
                    )}

                    {booking.status === "in_progress" && (
                      <button
                        type="button"
                        disabled={mutatingId === booking.id}
                        onClick={() => handleLifecycleMutation(booking.id, "completed")}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-100 text-white disabled:text-zinc-400 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all"
                      >
                        End Session & Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-50/50 rounded-2xl border border-solid border-zinc-100 p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
            Node System Profiles
          </h4>
          <div className="space-y-2 text-xs text-zinc-600">
            <p><strong>License Token:</strong> {profileData.profile.license_number}</p>
            <p><strong>Registry Sector:</strong> {profileData.profile.building}, {profileData.profile.town}</p>
            <p><strong>Experience Metrics:</strong> {profileData.profile.years_of_experience} Years</p>
          </div>
        </div>
      </div>
    </main>
  );
}
