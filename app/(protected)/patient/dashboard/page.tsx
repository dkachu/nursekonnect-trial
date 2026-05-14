"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import PatientStats from "@/components/dashboard/PatientStats";
import BookingModal from "@/components/dashboard/BookingModal";
import { useBookingSocket } from "@/hooks/useBookingSocket";

interface Nurse {
  id: number;
  user_details: { email: string; phone_number: string };
  specialization: string;
  years_of_experience: number;
  town: string;
  building: string;
  distance: string;
}

interface PatientStatsPayload {
  total_care_sessions: number;
  active_requests: number;
  pending_reviews: number;
}

export default function PatientDashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<PatientStatsPayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [nursesLoading, setNursesLoading] = useState(false);
  const [radius, setRadius] = useState<number>(25);
  const [selectedNurse, setSelectedNurse] = useState<{ id: number; name: string } | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const didFetchInitial = useRef(false);

  const fetchKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("bookings/active/");
      if (Array.isArray(res.data)) {
        setStats({
          total_care_sessions: res.data.filter(b => b.status === "completed").length,
          active_requests: res.data.filter(b => ["pending", "accepted", "in_progress"].includes(b.status)).length,
          pending_reviews: res.data.filter(b => b.status === "completed" && !b.rating).length
        });
      }
    } catch {
      console.error("KPI Sync Failed.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchNearbyNurses = useCallback(async () => {
    const profileLat = user?.profile?.lat;
    const profileLng = user?.profile?.lng;

    if (!profileLat || !profileLng || isNaN(Number(profileLat)) || isNaN(Number(profileLng))) {
      return;
    }

    setNursesLoading(true);
    try {
      const res = await api.get("accounts/nurses/nearby/", {
        params: {
          lat: Number(profileLat).toFixed(6),
          lng: Number(profileLng).toFixed(6),
          radius: radius
        }
      });
      setNurses(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Scanning failed");
    } finally {
      setNursesLoading(false);
    }
  }, [user?.profile?.lat, user?.profile?.lng, radius]);

  const handleLiveUpdates = useCallback((message: any) => {
    if (["NEW_DISPATCH_REQUESTED", "BOOKING_CONFIRMED", "LOCATION_UPDATED"].includes(message.type)) {
      fetchKPIs();
      if (message.type === "BOOKING_CONFIRMED") {
        toast.info("Dispatch Acknowledged");
      }
    }
  }, [fetchKPIs]);

  const { isConnected } = useBookingSocket(handleLiveUpdates);

  useEffect(() => {
    if (user && !didFetchInitial.current) {
      fetchKPIs();
      fetchNearbyNurses();
      didFetchInitial.current = true;
    }
  }, [user, fetchKPIs, fetchNearbyNurses]);

  useEffect(() => {
    if (user && didFetchInitial.current) {
      fetchNearbyNurses();
    }
  }, [radius, fetchNearbyNurses, user]);

  const syncLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return toast.error("Hardware Limitation");
    }
    
    setIsSyncing(true);
    const syncToast = toast.loading("Locking coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Coordinates Locked", { id: syncToast });
          await refreshUser();
          await fetchNearbyNurses(); 
        } catch {
          toast.error("Sync Failed", { id: syncToast });
        } finally {
          setIsSyncing(false);
        }
      },
      (error) => { 
        setIsSyncing(false); 
        toast.error("Denied", { id: syncToast, description: error.message }); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleOpenBooking = (nurseId: number, email: string) => {
    const cleanName = email.includes("@") ? email.split("@")[0] : email;
    setSelectedNurse({ id: nurseId, name: cleanName.toUpperCase() });
    setIsBookingOpen(true);
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Syncing...
        </p>
      </div>
    );
  }

  const clientName = user.email?.includes("@") ? user.email.split("@")[0] : user.email;

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen font-sans bg-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-zinc-100 pb-12">
        <div className="space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest italic">
            Care Command Center {isConnected ? "• LIVE" : "• SYNCING"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Hello, <span className="text-blue-600 not-italic">{clientName}</span>
          </h1>
        </div>

        <button 
          onClick={syncLocation} 
          disabled={isSyncing} 
          className="bg-zinc-950 hover:bg-blue-600 text-white px-8 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-auto border-none"
        >
          {isSyncing ? "LOCKING SATELLITES..." : "UPDATE HOME COORDINATES"}
        </button>
      </header>

      <PatientStats stats={stats} loading={statsLoading} />

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 italic">
              Nearby Active Practitioners Available
            </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-2xl border border-zinc-100">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Search Range:</label>
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={nursesLoading}
              className="bg-transparent font-black text-xs outline-none cursor-pointer text-zinc-800 border-none"
            >
              <option value={10}>10 KM RADIUS</option>
              <option value={25}>25 KM RADIUS</option>
              <option value={50}>50 KM RADIUS</option>
            </select>
          </div>
        </div>

        {nursesLoading ? (
          <div className="h-48 border border-dashed border-zinc-200 rounded-[2rem] flex items-center justify-center bg-zinc-50/50">
            <span className="text-zinc-400 font-bold text-xs uppercase">Scanning...</span>
          </div>
        ) : nurses.length === 0 ? (
          <div className="h-48 border border-dashed border-zinc-200 rounded-[2rem] flex flex-col items-center justify-center bg-zinc-50/50 p-6 text-center">
            <p className="text-xs font-black text-zinc-400 uppercase tracking-wide">No Practitioners Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nurses.map((nurse) => {
              const nurseName = nurse.user_details?.email?.split("@")[0] || "Practitioner";
              return (
                <div key={nurse.id} className="border border-zinc-100 rounded-[2rem] p-6 space-y-6 bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                      {nurse.specialization}
                    </span>
                    <h3 className="text-lg font-black uppercase text-zinc-900 tracking-tight pt-2">
                      {nurseName}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">
                      Experience: {nurse.years_of_experience} Years
                    </p>
                  </div>
                  
                  <div className="text-[11px] font-medium text-zinc-500 space-y-1 bg-zinc-50 p-4 rounded-xl font-mono">
                    <p>Town: {nurse.town}</p>
                    <p>Block: {nurse.building}</p>
                    <p className="text-blue-600 font-bold">Distance: {nurse.distance}</p>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(nurse.id, nurse.user_details?.email)}
                    className="w-full h-12 bg-zinc-950 hover:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer"
                  >
                    Request Dispatch
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AppointmentsList isNurse={false} />

      <BookingModal 
        nurseId={selectedNurse?.id}
        nurseName={selectedNurse?.name || ""}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          fetchKPIs();
        }}
      />
    </main>
  );
}
