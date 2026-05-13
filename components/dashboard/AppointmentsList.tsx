"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Clock, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const calculateTravelInfo = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const etaMinutes = Math.round((distance / 28) * 60);
  return { distance: distance.toFixed(1), eta: etaMinutes };
};

interface BookingRecord {
  id: number;
  status: string;
  session_started_at?: string;
  rating?: number;
  patient_email?: string;
  nurse_name?: string;
  scheduled_date: string;
  patient_location_data?: {
    lat: number;
    lng: number;
  };
}

interface AppointmentsListProps {
  isNurse: boolean;
  useActiveOnly?: boolean; 
  onStatusUpdate?: () => void; 
}

export default function AppointmentsList({ isNurse, useActiveOnly, onStatusUpdate }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [nurseCoords, setNurseCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (isNurse && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setNurseCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error("Registry GPS Lock Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isNurse]);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const endpoint = useActiveOnly ? "bookings/active/" : "bookings/";
        const res = await api.get(endpoint);
        setAppointments(res.data);
        if (onStatusUpdate) onStatusUpdate();
      } catch {
        toast.error("Ledger Sync Failed");
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [useActiveOnly, onStatusUpdate]);

  if (loading) return (
    <div className="flex justify-center p-12 italic text-[10px] font-black uppercase text-zinc-400 tracking-widest">
      <Loader2 className="animate-spin mr-2" size={14} /> Synchronising Ledger...
    </div>
  );

  return (
    <div className="space-y-6">
      {appointments.length === 0 ? (
        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[2.5rem] p-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">No Active Dispatches in Registry</p>
        </div>
      ) : (
        appointments.map((apt) => {
          const isAccepted = apt.status === "accepted";
          const isDeclined = apt.status === "declined";
          const isCompleted = apt.status === "completed";
          const hasStarted = !!apt.session_started_at; 
          
          const needsReview = isCompleted && !apt.rating && !isNurse;
          const isArchived = (isCompleted && (apt.rating || isNurse)) || apt.status === "cancelled" || isDeclined;
          
          let travelMeta = null;
          if (isNurse && isAccepted && nurseCoords && apt.patient_location_data?.lat) {
            travelMeta = calculateTravelInfo(
              nurseCoords.lat, 
              nurseCoords.lng, 
              apt.patient_location_data.lat, 
              apt.patient_location_data.lng
            );
          }

          return (
            <div key={apt.id} className={cn(
                "bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500",
                isArchived && "bg-zinc-50/50 grayscale opacity-70",
                needsReview && "border-blue-200 ring-4 ring-blue-50/50"
            )}>
              <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white italic shadow-lg", isNurse ? "bg-zinc-950" : "bg-blue-600")}>
                      {isNurse ? (apt.patient_email || "P").toUpperCase().charAt(0) : (apt.nurse_name || "N").toUpperCase().charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none italic">ID: NK-{String(apt.id).padStart(4, '0')}</p>
                        {hasStarted && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[7px] font-black uppercase rounded-full animate-pulse">On-Site</span>
                        )}
                      </div>
                      <h4 className="text-xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
                        {isNurse ? apt.patient_email?.split('@')[0] : apt.nurse_name?.split('@')[0]}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                      <Clock size={14} className="text-blue-600" />
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        {new Date(apt.scheduled_date).toLocaleString("en-KE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </span>
                    </div>
                    {travelMeta && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                        <Navigation size={14} className="text-emerald-600 animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                          {travelMeta.distance} KM away ({travelMeta.eta} MINS)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
