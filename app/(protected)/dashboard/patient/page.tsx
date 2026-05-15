"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Loader2, Activity, ShieldAlert, MapPin, Users, Send } from "lucide-react";
import { NurseProfile } from "@/types/nurse";
import NurseCard from "@/components/dashboard/NurseCard";
import { useRegistrySync } from "@/hooks/useRegistrySync";
import { toast } from "sonner";

interface UserDetails {
  id: number;
  email: string;
  phone_number: string;
  is_patient: boolean;
}

interface PatientProfile {
  blood_group: string;
  allergies: string;
  medical_history: string;
  town: string;
  building: string;
}

export default function PatientDashboardPage() {
  const [data, setData] = useState<{ user_details: UserDetails; profile: PatientProfile } | null>(null);
  const [nurses, setNurses] = useState<NurseProfile[]>([]);
  const [nursesLoading, setNursesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allocationRequestingId, setAllocationRequestingId] = useState<number | null>(null);

  // Fallback function passed to useRegistrySync to capture and re-verify nearby records on changes
  const handleIncomingTelemetryUpdate = useCallback(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setNursesLoading(true);
        api.get(`/api/accounts/nurses/nearby/`, {
          params: { lat: pos.coords.latitude, lng: pos.coords.longitude, radius: 5000 }
        }).then(res => setNurses(res.data)).catch(console.error).finally(() => setNursesLoading(false));
      });
    }
  }, []);

  // Initialize the live asynchronous global updates socket link channel hook natively
  const { sendWebSocketMessage } = useRegistrySync({
    onNewDispatch: handleIncomingTelemetryUpdate
  });

  const fetchNearbyNurses = useCallback(async (latitude: number, longitude: number) => {
    setNursesLoading(true);
    try {
      const res = await api.get(`/api/accounts/nurses/nearby/`, {
        params: { lat: latitude, lng: longitude, radius: 5000 }
      });
      setNurses(res.data);
    } catch (err) {
      console.error("Geospatial fetch failure:", err);
      toast.error("Registry Sync Failure", { description: "Could not retrieve clinical nodes in this sector." });
    } finally {
      setNursesLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/api/accounts/profile/me/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
        
        if (typeof window !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              fetchNearbyNurses(pos.coords.latitude, pos.coords.longitude);
            },
            (geoErr) => {
              console.warn("GPS tracking access missing, using fallback:", geoErr.message);
              fetchNearbyNurses(-0.6972, 36.9328); // Fallback to Kigumo
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load secure patient diagnostic matrix.");
        setLoading(false);
      });
  }, [fetchNearbyNurses]);

  // FIXED: Fully wired transactional handler links action buttons to backend mutations and socket broadcasts
  const handleDispatchAllocation = async (nurse: NurseProfile) => {
    setAllocationRequestingId(nurse.id);
    const clinicianName = nurse.user_details.email.split("@")[0];

    const allocationPayload = {
      nurse: nurse.id,
      service_description: `Emergency medical home care request dispatch allocated to practitioner node reference ${nurse.license_number}.`,
      scheduled_date: new Date().toISOString().split("T")[0] // Maps standard format YYYY-MM-DD
    };

    try {
      // 1. Dispatch structural database entry creation pass
      const res = await api.post("/api/bookings/", allocationPayload);

      if (res.status === 201 || res.status === 200) {
        toast.success("CARE DISPATCH ALLOCATED", {
          description: `Direct allocation link established securely with practitioner: ${clinicianName}`
        });

        // 2. Programmatically broadcast immediate socket alarm packet to trigger audio-visual prompts on clinician's terminal
        sendWebSocketMessage({
          type: "PERSONAL_ALERT",
          payload: {
            action: "NEW_REQUEST",
            booking_id: res.data.id,
            patient_name: data?.user_details.email.split("@")[0] || "Patient Node ID",
            service_description: allocationPayload.service_description
          }
        });
      }
    } catch (err: any) {
      console.error("Care request dispatch failed:", err);
      const errorDetail = err.response?.data?.error || "The routing engine refused the transaction assignment.";
      toast.error("Allocation Request Refused", { description: errorDetail });
    } finally {
      setAllocationRequestingId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Retrieving Personal Diagnostics Pipeline...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-2 font-sans p-6">
        <ShieldAlert className="text-red-500" size={32} />
        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Error: {error}</p>
      </div>
    );
  }

  const identityString = data.user_details.email || "Patient Account";
  const displayName = identityString.includes("@") ? identityString.split("@")[0] : identityString;

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen font-sans bg-white select-none">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-dashed border-zinc-100 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            <Activity size={12} className="animate-pulse" /> Patient Care Station
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Welcome, <span className="text-blue-600 not-italic">{displayName}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-zinc-50 border border-solid border-zinc-200 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-wider">
              <ShieldAlert size={14} className="text-blue-600" /> Identity Overview
            </div>
            <div className="space-y-2 text-sm text-zinc-600">
              <p><strong>Account Ref:</strong> <span className="text-zinc-900 font-mono">{data.user_details.id}</span></p>
              <p><strong>Primary Node:</strong> <span className="text-zinc-900">{data.user_details.phone_number}</span></p>
              <p><strong>Secure Email:</strong> <span className="text-zinc-900 break-all">{data.user_details.email}</span></p>
            </div>
          </section>

          <section className="bg-white border border-solid border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-wider">
              <Activity size={14} className="text-blue-600" /> Critical Medical Profile
            </div>
            <div className="space-y-2 text-sm text-zinc-600">
              <p><strong>Blood Group:</strong> <span className="text-zinc-900 font-bold">{data.profile.blood_group || "Not Indexed"}</span></p>
              <p><strong>Allergies:</strong> <span className="text-zinc-900">{data.profile.allergies || "None Declared"}</span></p>
              <p><strong>History:</strong> <span className="text-zinc-900 line-clamp-3">{data.profile.medical_history || "No Chronic Incidents Recorded"}</span></p>
              <div className="pt-2 border-t border-solid border-zinc-100 flex items-start gap-1.5 text-zinc-500">
                <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />
                <p className="text-xs font-medium"><strong>Home:</strong> {data.profile.building ? `${data.profile.building}, ` : ""}{data.profile.town || "No Address Saved"}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-solid border-zinc-100 pb-4">
            <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-wider">
              <Users size={14} className="text-blue-600" /> Verified Practitioners Within 5KM
            </div>
            {nursesLoading && <Loader2 className="animate-spin text-zinc-400" size={14} />}
          </div>

          {nursesLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="animate-spin mx-auto text-blue-600" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scanning geographical sector channels...</p>
            </div>
          ) : nurses.length === 0 ? (
            <div className="py-24 border border-dashed border-zinc-200 bg-zinc-50 rounded-2xl text-center p-8 space-y-2">
              <MapPin className="mx-auto text-zinc-300" size={28} />
              <p className="text-sm font-bold text-zinc-700">No Practitioners Available</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">There are currently no active nurse practitioner dispatches registered within a 5 kilometer radius of your matching sector position coordinates grid loop.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nurses.map((nurse) => (
                <NurseCard 
                  key={nurse.id} 
                  nurse={nurse} 
                  onSelect={allocationRequestingId === nurse.id ? undefined : handleDispatchAllocation} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
