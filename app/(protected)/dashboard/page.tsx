"use client";

import React, { useState, useEffect, useRef, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { MapPin, Activity, Loader2, Zap, LayoutDashboard, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import PatientStats from "@/components/dashboard/PatientStats";
import BookingModal from "@/components/dashboard/BookingModal";

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
  
  // FIXED: Explicitly typed to prevent the default 'null' type inference from throwing errors on state assignment
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
      console.error("Registry KPI Synchronization Failed.");
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
      toast.error("Proximity scanning failed", { description: "Verify backend spatial configurations." });
    } finally {
      setNursesLoading(false);
    }
  }, [user?.profile?.lat, user?.profile?.lng, radius]);

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
      return toast.error("Hardware Limitation", { description: "GPS hardware module is missing or unauthorized." });
    }
    
    setIsSyncing(true);
    const syncToast = toast.loading("Locking local geographic coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Home Coordinates Locked", { id: syncToast });
          await refreshUser();
          await fetchNearbyNurses(); 
        } catch {
          toast.error("Telemetry Sync Failed", { id: syncToast });
        } finally {
          setIsSyncing(false);
        }
      },
      (error) => { 
        setIsSyncing(false); 
        toast.error("GPS Authorization Denied", { id: syncToast, description: error.message }); 
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
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Synchronising Registry Handshake...
        </p>
      </div>
    );
  }

  const clientName = user.email?.includes("@") ? user.email.split("@")[0] : user.email;

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen font-sans bg-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-dashed border-zinc-100 pb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic select-none">
            <Activity size={12} className="animate-pulse" /> Care Command Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none select-none">
            Hello, <span className="text-blue-600 not-italic">{clientName}</span>
          </h1>
        </div>

        <button 
          onClick={syncLocation} 
          disabled={isSyncing} 
          className="bg-zinc-950 hover:bg-blue-600 text-white px-8 h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-full md:w-auto border-none"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
          {isSyncing ? "LOCKING SATELLITES..." : "UPDATE HOME COORDINATES"}
        </button>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2.5 select-none">
            <MapPin size={16} className="text-blue-600 animate-bounce" />
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 italic">
              Nearby Active Practitioners Available
            </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2.5 rounded-2xl border border-zinc-100 select-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Search Range:</label>
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={nursesLoading}
              className="bg-transparent font-black text-xs outline-none cursor-pointer text-zinc-800"
            >
              <option value={10}>10 KM RADIUS</option>
              <option value={25}>25 KM RADIUS</option>
              <option value={50}>50 KM RADIUS</option>
            </select>
          </div>
        </div>

        {nursesLoading ? (
          <div className="h-48 border border-dashed rounded-[2rem] flex items-center justify-center bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span>Scanning Spherical PostGIS Geometry Tables...</span>
            </div>
          </div>
        ) : nurses.length === 0 ? (
          <div className="bg-zinc-50/50 border border-dashed border-zinc-200 p-12 rounded-[2rem] text-center text-xs text-zinc-400 font-black uppercase tracking-wider">
            No practitioners found within your chosen {radius}km boundary. Expand your search range parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nurses.map((nurse) => {
              const emailStr = nurse.user_details?.email || "Nurse";
              const parsedNurseName = emailStr.includes("@") ? emailStr.split("@") : emailStr;
              const formattedDistance = nurse.distance ? parseFloat(nurse.distance).toFixed(1) : "0.0";
              const specializationTag = nurse.specialization?.replace("_", " ") || "GENERAL PRACTICE";

              return (
                <div key={nurse.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col justify-between gap-6 hover:border-zinc-200 transition-all duration-200 group transform active:scale-[0.995]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="overflow-hidden">
                        <h4 className="font-black text-zinc-900 uppercase text-base tracking-tight truncate max-w-[160px]">{parsedNurseName}</h4>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mt-1">{specializationTag} specialist</span>
                      </div>
                      <span className="bg-zinc-950 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-full shrink-0 select-none">
                        {formattedDistance} KM AWAY
                      </span>
                    </div>
                    
                    <div className="text-[11px] text-zinc-500 space-y-1.5 uppercase font-medium bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                      <p className="truncate"><span className="text-zinc-400 font-bold">BASE:</span> {nurse.building || "Facility Pending"}, {nurse.town}</p>
                      <p><span className="text-zinc-400 font-bold">EXP:</span> {nurse.years_of_experience} Years Verified Experience</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenBooking(nurse.id, emailStr)}
                    className="w-full bg-zinc-50 hover:bg-blue-600 group-hover:bg-zinc-950 group-hover:text-white hover:text-white transition-all h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-none cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    Initiate Deployment Dispatch
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2.5 select-none">
          <LayoutDashboard size={16} className="text-zinc-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 italic">
            Registry Performance Analytics
          </h2>
        </div>
        <PatientStats stats={stats} loading={statsLoading} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2.5 select-none">
          <CalendarDays size={16} className="text-zinc-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 italic">
            Active Deployment Dispatches
          </h2>
        </div>
        <AppointmentsList isNurse={false} useActiveOnly={true} onStatusUpdate={fetchKPIs} />
      </section>

      {selectedNurse && (
        <BookingModal 
          nurseId={selectedNurse.id}
          nurseName={selectedNurse.name}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedNurse(null);
            fetchKPIs();
          }}
        />
      )}
    </main>
  );
}
