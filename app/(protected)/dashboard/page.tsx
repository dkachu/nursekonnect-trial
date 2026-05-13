"use client";

import { useState, useEffect, useCallback } from "react"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { MapPin, Activity, Loader2, Zap, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import PatientStats from "@/components/dashboard/PatientStats";

interface Nurse {
  id: number;
  user_details: { email: string; phone_number: string };
  specialization: string;
  years_of_experience: number;
  town: string;
  building: string;
  distance: string;
}

export default function PatientDashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Nearby Nurse Discovery States
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [nursesLoading, setNursesLoading] = useState(false);
  const [radius, setRadius] = useState<number>(25); // Default search radius in km

  const fetchKPIs = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("bookings/stats/patient/");
      setStats(res.data);
    } catch {
      console.error("Registry KPI Sync Failed");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchNearbyNurses = useCallback(async () => {
    setNursesLoading(true);
    try {
      // Queries your GeoDjango NearbyNurseView endpoint
      const res = await api.get(`accounts/nurses/nearby/?radius=${radius}`);
      setNurses(res.data);
    } catch {
      toast.error("Proximity scanning failed");
    } finally {
      setNursesLoading(false);
    }
  }, [radius]);

  useEffect(() => {
    if (user) {
      fetchKPIs();
      fetchNearbyNurses();
    }
  }, [user, fetchKPIs, fetchNearbyNurses]);

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
          fetchNearbyNurses(); // Refresh list after coordinate update
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

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">Synchronising Registry</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] italic">
            <Activity size={14} className="animate-pulse" /> Care Command Center
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Hello, <span className="text-blue-600 not-italic">{user.email?.split('@')[0]}</span>
          </h1>
        </div>

        <button 
          onClick={syncLocation} 
          disabled={isSyncing} 
          className="bg-zinc-950 text-white px-10 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 italic transition-all active:scale-95"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
          {isSyncing ? "Locking..." : "Update Home Coordinates"}
        </button>
      </header>

      {/* NEW SECTION: GeoDjango Proximity Discovery Feed */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-blue-600 animate-bounce" />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 italic">Nearby Practitioners Available</h3>
          </div>
          <div className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-2xl">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Range:</label>
            <select 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-transparent font-bold text-xs outline-none cursor-pointer"
            >
              <option value={10}>10 KM</option>
              <option value={25}>25 KM</option>
              <option value={50}>50 KM</option>
            </select>
          </div>
        </div>

        {nursesLoading ? (
          <div className="h-32 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
        ) : nurses.length === 0 ? (
          <div className="bg-zinc-50 border p-8 rounded-3xl text-center text-sm text-zinc-400 font-medium uppercase italic">
            No practitioners found within {radius}km. Try expanding your search range.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nurses.map((nurse) => (
              <div key={nurse.id} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase text-sm leading-tight">{nurse.user_details.email.split('@')[0]}</h4>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{nurse.specialization} specialist</p>
                  </div>
                  <span className="bg-zinc-950 text-white text-[9px] font-black px-3 py-1 rounded-full">{nurse.distance} KM away</span>
                </div>
                <div className="text-xs text-zinc-500 space-y-1 uppercase font-medium">
                  <p>📍 {nurse.building}, {nurse.town}</p>
                  <p>💼 {nurse.years_of_experience} Years Experience</p>
                </div>
                <button className="w-full bg-zinc-100 hover:bg-blue-600 hover:text-white transition-colors h-11 rounded-xl font-black text-[9px] uppercase tracking-widest">
                  Initiate Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 italic">Registry Performance</h3>
        </div>
        <PatientStats stats={stats} loading={statsLoading} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-zinc-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900 italic">Active Care Dispatches</h3>
        </div>
        <AppointmentsList isNurse={false} useActiveOnly={true} />
      </section>
    </main>
  );
}
