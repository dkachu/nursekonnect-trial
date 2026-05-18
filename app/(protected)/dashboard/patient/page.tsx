"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
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

  // Polls nearby clinicians dynamically when network notification sockets fire
  const handleIncomingTelemetryUpdate = useCallback(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setNursesLoading(true);
        api.get(`accounts/nurses/nearby/`, {
          params: { lat: pos.coords.latitude, lng: pos.coords.longitude, radius: 5000 }
        })
        .then(res => setNurses(res.data || []))
        .catch(console.error)
        .finally(() => setNursesLoading(false));
      });
    }
  }, []);

  // Connect backend message broker triggers cleanly to matching UI tracking parameters
  const { sendWebSocketMessage } = useRegistrySync({
    onNewDispatch: handleIncomingTelemetryUpdate
  });

  const fetchNearbyNurses = useCallback(async (latitude: number, longitude: number) => {
    setNursesLoading(true);
    try {
      const res = await api.get(`accounts/nurses/nearby/`, {
        params: { lat: latitude, lng: longitude, radius: 5000 }
      });
      setNurses(res.data || []);
    } catch (err) {
      console.error("Geospatial fetch failure:", err);
      toast.error("Registry Sync Failure", { description: "Could not retrieve clinical nodes in this sector." });
    } finally {
      setNursesLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("accounts/profile/me/")
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
              fetchNearbyNurses(-0.6972, 36.9328); 
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

  // Handle manual allocation dispatches back to backend database tables
  const handleDispatchAllocation = async (nurse: NurseProfile) => {
    setAllocationRequestingId(nurse.id);
    const clinicianName = nurse.user_details.email.split("@")[0];

    const allocationPayload = {
      nurse: nurse.id,
      service_description: `Emergency medical home care request dispatch allocated to practitioner node reference ${nurse.license_number}.`,
      scheduled_date: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await api.post("bookings/", allocationPayload);

      if (res.status === 201 || res.status === 200) {
        toast.success("CARE DISPATCH ALLOCATED", {
          description: `Direct allocation link established securely with practitioner: ${clinicianName}`
        });

        // Push nested envelope directly down the websocket wire to spark sound and banner cues on nurse screen
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
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Retrieving Personal Diagnostics Pipeline...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-2 font-sans p-6">
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
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Patient Care Station
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Welcome, <span className="text-blue-600 not-italic">{displayName}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-zinc-50 border border-solid border-zinc-200 p-6 rounded-2xl space-y-4">
            <h4 className="text-zinc-900 font-black text-xs uppercase tracking-wider">Identity Overview</h4>
            <div className="space-y-2 text-sm text-zinc-600">
              <p><strong>Account Ref:</strong> <span className="text-zinc-900 font-mono">{data.user_details.id}</span></p>
              <p><strong>Primary Node:</strong> <span className="text-zinc-900">{data.user_details.phone_number}</span></p>
              <p><strong>Secure Email:</strong> <span className="text-zinc-900 break-all">{data.user_details.email}</span></p>
            </div>
          </section>

          <section className="bg-white border border-solid border-zinc-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <h4 className="text-zinc-900 font-black text-xs uppercase tracking-wider">Critical Medical Profile</h4>
            <div className="space-y-2 text-sm text-zinc-600">
              <p><strong>Blood Group:</strong> <span className="text-zinc-900 font-bold">{data.profile.blood_group || "Not Indexed"}</span></p>
              <p><strong>Allergies:</strong> <span className="text-zinc-900">{data.profile.allergies || "None Registered"}</span></p>
              <p><strong>Medical History:</strong> <span className="text-zinc-900 line-clamp-3">{data.profile.medical_history || "Clear"}</span></p>
              <p><strong>Home Sector:</strong> <span className="text-zinc-900">{data.profile.building}, {data.profile.town}</span></p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-solid border-zinc-100 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Clinical Nodes Responding In Your Sector
            </h3>
            {nursesLoading && <span className="text-[10px] font-bold text-zinc-400 animate-pulse uppercase">Scanning PostGIS...</span>}
          </div>

          {nurses.length === 0 ? (
            <div className="py-20 border border-dashed border-zinc-200 rounded-2xl text-center bg-zinc-50/50">
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">No Medical Responders Available</p>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Expanding query parameters outside 5km perimeter coordinates filter...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nurses.map((nurse) => (
                <NurseCard 
                  key={nurse.id} 
                  nurse={nurse} 
                  onSelect={allocationRequestingId === null ? handleDispatchAllocation : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
