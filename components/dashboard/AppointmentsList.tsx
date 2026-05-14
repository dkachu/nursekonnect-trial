"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBookingSocket } from "@/hooks/useBookingSocket";

const calculateTravelInfo = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  service_description: string;
  patient_location_data?: { lat: number; lng: number; town: string; building: string; phone: string; };
  nurse_contact_data?: { phone: string; license: string; specialization: string; verified_on_site: boolean; };
}

interface AppointmentsListProps {
  isNurse: boolean;
  useActiveOnly?: boolean; 
  onStatusUpdate?: () => void; 
}

export default function AppointmentsList({ isNurse, useActiveOnly, onStatusUpdate }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [nurseCoords, setNurseCoords] = useState<{lat: number, lng: number} | null>(null);
  const [ratingInput, setRatingInput] = useState<Record<number, number>>({});
  const registrySocketRef = useRef<WebSocket | null>(null);

  const fetchLedger = useCallback(async () => {
    try {
      const endpoint = useActiveOnly ? "bookings/active/" : "bookings/";
      const res = await api.get(endpoint);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Synchronization Failed");
    } finally {
      setLoading(false);
    }
  }, [useActiveOnly]);

  const handleIncomingSocketSignals = useCallback((message: any) => {
    if (["NEW_DISPATCH_REQUESTED", "BOOKING_CONFIRMED", "LOCATION_UPDATED"].includes(message.type)) {
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    }
  }, [fetchLedger, onStatusUpdate]);

  useBookingSocket(handleIncomingSocketSignals);

  useEffect(() => {
    if (isNurse && "geolocation" in navigator) {
      const isProd = process.env.NEXT_PUBLIC_NODE_ENV === "production";
      const wsUrl = isProd
        ? `wss://${process.env.NEXT_PUBLIC_API_DOMAIN}/ws/registry/`
        : `ws://127.0.0.1:10000/ws/registry/`;

      const regSocket = new WebSocket(wsUrl);
      registrySocketRef.current = regSocket;

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setNurseCoords(currentCoords);

          const activeAcceptedJob = appointments.find(a => a.status === "accepted");
          if (activeAcceptedJob && regSocket.readyState === WebSocket.OPEN) {
            regSocket.send(JSON.stringify({
              action: "TRANSMIT_LOCATION_DATA",
              patient_id: activeAcceptedJob.id, 
              coordinates: currentCoords
            }));
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        regSocket.close();
      };
    }
  }, [isNurse, appointments]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleStatusMutation = async (bookingId: number, nextStatus: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`bookings/${bookingId}/status/`, { status: nextStatus });
      toast.success("State Changed");
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      toast.error("Rejected", { description: err.response?.data?.error });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyArrival = async (bookingId: number) => {
    if (!nurseCoords) {
      toast.error("Telemetry Required");
      return;
    }
    setActionLoading(bookingId);
    try {
      await api.patch(`bookings/${bookingId}/status/`, {
        start_session: true,
        lat: nurseCoords.lat,
        lng: nurseCoords.lng
      });
      toast.success("Arrival Verified");
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      toast.error("Refused", { description: err.response?.data?.error });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitRating = async (bookingId: number) => {
    const stars = ratingInput[bookingId];
    if (!stars) return;
    setActionLoading(bookingId);
    try {
      await api.patch(`bookings/${bookingId}/status/`, { rating: stars, status: "completed" });
      toast.success("Evaluation Saved");
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    } catch {
      toast.error("Denied");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;

  return (
    <div className="space-y-6 w-full">
      {appointments.length === 0 ? (
        <div className="bg-zinc-50 border border-dashed rounded-[2rem] p-12 text-center text-zinc-400 font-black text-[10px] uppercase tracking-wider">
          No Records Found
        </div>
      ) : (
        appointments.map((apt) => {
          const isPending = apt.status === "pending";
          const isAccepted = apt.status === "accepted";
          const isCompleted = apt.status === "completed";
          const isInProgress = apt.status === "in_progress";
          const needsReview = isCompleted && !apt.rating && !isNurse;
          const isArchived = (isCompleted && (apt.rating || isNurse)) || apt.status === "cancelled" || apt.status === "declined";
          
          let travelMeta = null;
          if (isNurse && isAccepted && nurseCoords && apt.patient_location_data?.lat) {
            travelMeta = calculateTravelInfo(nurseCoords.lat, nurseCoords.lng, apt.patient_location_data.lat, apt.patient_location_data.lng);
          }

          const name = isNurse 
            ? (apt.patient_email?.includes("@") ? apt.patient_email.split('@')[0] : apt.patient_email)
            : (apt.nurse_name?.includes("@") ? apt.nurse_name.split('@')[0] : apt.nurse_name);

          return (
            <div key={apt.id} className={cn("bg-white border border-zinc-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col lg:flex-row justify-between gap-6", isArchived && "opacity-60 grayscale bg-zinc-50/50 shadow-none")}>
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">NK-ID: #{apt.id}</span>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", 
                      isAccepted && "bg-emerald-50 text-emerald-600",
                      isPending && "bg-amber-50 text-amber-600",
                      isInProgress && "bg-blue-50 text-blue-600",
                      isCompleted && "bg-zinc-100 text-zinc-600"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-zinc-900 uppercase tracking-tight pt-1">{name}</h4>
                </div>
                
                <p className="text-xs text-zinc-600 bg-zinc-50 p-4 rounded-2xl font-medium leading-relaxed border border-zinc-100/50">
                  "{apt.service_description}"
                </p>
                
                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider space-y-1">
                  <div>Schedule: <span className="text-zinc-700 font-mono font-bold">{new Date(apt.scheduled_date).toLocaleString("en-KE")}</span></div>
                  {travelMeta && <div className="text-emerald-600">Transit Radar: {travelMeta.distance} KM ({travelMeta.eta} MINS)</div>}
                </div>
                
                {apt.patient_location_data && isNurse && (
                  <div className="text-[11px] text-zinc-600 font-medium bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-200">
                    Town: {apt.patient_location_data.building}, {apt.patient_location_data.town} | Contact: {apt.patient_location_data.phone}
                  </div>
                )}
                
                {apt.nurse_contact_data && !isNurse && (
                  <div className="text-[11px] text-zinc-600 font-medium bg-zinc-50 p-4 rounded-2xl border border-dashed border-zinc-200">
                    Registry: {apt.nurse_contact_data.specialization} [{apt.nurse_contact_data.license}] | Phone: {apt.nurse_contact_data.phone}
                  </div>
                )}

                {needsReview && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingInput({ ...ratingInput, [apt.id]: star })}
                          className="border-none bg-transparent p-0 cursor-pointer text-zinc-300 font-bold text-lg"
                        >
                          ★
                        </button>
                      ))}
                      {ratingInput[apt.id] && (
                        <button 
                          onClick={() => handleSubmitRating(apt.id)}
                          className="ml-3 h-8 px-4 bg-zinc-950 text-white font-black text-[9px] uppercase tracking-widest rounded-lg border-none cursor-pointer hover:bg-blue-600"
                        >
                          Submit Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end lg:w-52 border-t lg:border-t-0 border-zinc-100 pt-4 lg:pt-0">
                {actionLoading === apt.id ? (
                  <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Processing...
                  </div>
                ) : (
                  <div className="w-full space-y-2">
                    {isNurse && isPending && (
                      <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={() => handleStatusMutation(apt.id, "accepted")} 
                          className="bg-zinc-950 hover:bg-emerald-600 text-white h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer w-full"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusMutation(apt.id, "declined")} 
                          className="bg-zinc-50 hover:bg-zinc-100 text-zinc-400 h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer w-full"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {isNurse && isAccepted && (
                      <button 
                        onClick={() => handleVerifyArrival(apt.id)} 
                        className="w-full bg-blue-600 hover:bg-zinc-950 text-white h-14 text-[10px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer"
                      >
                        Verify Arrival
                      </button>
                    )}
                    {isNurse && isInProgress && (
                      <button 
                        onClick={() => handleStatusMutation(apt.id, "completed")} 
                        className="w-full bg-emerald-600 hover:bg-zinc-950 text-white h-14 text-[10px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer"
                      >
                        Complete Session
                      </button>
                    )}
                    {!isNurse && isPending && (
                      <button 
                        onClick={() => handleStatusMutation(apt.id, "cancelled")} 
                        className="w-full bg-zinc-50 hover:bg-rose-50 text-zinc-400 h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl border-none cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
