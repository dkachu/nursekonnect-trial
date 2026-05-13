"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
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

  useEffect(() => {
    if (isNurse && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setNurseCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Telemetry Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isNurse]);

  const fetchLedger = useCallback(async () => {
    try {
      const endpoint = useActiveOnly ? "bookings/active/" : "bookings/";
      const res = await api.get(endpoint);
      setAppointments(res.data);
    } catch {
      toast.error("Synchronization Failed");
    } finally {
      setLoading(false);
    }
  }, [useActiveOnly]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleStatusMutation = async (bookingId: number, nextStatus: string) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`bookings/${bookingId}/status/`, { status: nextStatus });
      toast.success("Record State Mutated");
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      toast.error("Operation Rejected", { description: err.response?.data?.error });
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
      toast.success("Arrival Authenticated");
      fetchLedger();
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      toast.error("Authentication Refused", { description: err.response?.data?.error });
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
      toast.error("Submission Denied");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;

  return (
    <div className="space-y-6">
      {appointments.length === 0 ? (
        <div className="bg-zinc-50 border border-dashed rounded-3xl p-12 text-center text-zinc-400 font-bold text-xs uppercase">
          No Registered Records Found
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

          const name = isNurse ? apt.patient_email?.split('@')[0] : apt.nurse_name?.split('@')[0];

          return (
            <div key={apt.id} className={cn("bg-white border rounded-[2rem] p-8 shadow-sm flex flex-col lg:flex-row justify-between gap-6", isArchived && "opacity-60 grayscale")}>
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">NK-ID: {apt.id} [{apt.status}]</span>
                  <h4 className="text-xl font-black text-zinc-900 uppercase">{name}</h4>
                </div>
                <p className="text-xs text-zinc-600 bg-zinc-50 p-4 rounded-xl font-medium">"{apt.service_description}"</p>
                <div className="text-xs text-zinc-500 font-bold uppercase">
                  <span>Schedule: {new Date(apt.scheduled_date).toLocaleString("en-KE")}</span>
                  {travelMeta && <span className="block text-emerald-600">Proximity: {travelMeta.distance} KM ({travelMeta.eta} MINS)</span>}
                </div>
                {apt.patient_location_data && (
                  <div className="text-[11px] text-zinc-500 font-bold bg-zinc-50 p-4 rounded-xl border border-dashed">
                    LOCATION: {apt.patient_location_data.building}, {apt.patient_location_data.town} | CONTACT: {apt.patient_location_data.phone}
                  </div>
                )}
                {apt.nurse_contact_data && (
                  <div className="text-[11px] text-zinc-500 font-bold bg-zinc-50 p-4 rounded-xl border border-dashed">
                    CLINICAL REGISTRY: {apt.nurse_contact_data.specialization} [{apt.nurse_contact_data.license}] | PHONE: {apt.nurse_contact_data.phone}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end lg:w-48">
                {actionLoading === apt.id ? (
                  <div className="text-zinc-400 text-xs font-bold">PROCESSING...</div>
                ) : (
                  <>
                    {isNurse && isPending && (
                      <div className="flex flex-col gap-2 w-full">
                        <button onClick={() => handleStatusMutation(apt.id, "accepted")} className="bg-zinc-950 text-white h-11 text-xs font-bold rounded-xl uppercase">Accept</button>
                        <button onClick={() => handleStatusMutation(apt.id, "declined")} className="bg-zinc-100 text-zinc-500 h-11 text-xs font-bold rounded-xl uppercase">Decline</button>
                      </div>
                    )}
                    {isNurse && isAccepted && (
                      <button onClick={() => handleVerifyArrival(apt.id)} className="w-full bg-blue-600 text-white h-12 text-xs font-bold rounded-xl uppercase">Verify Proximity Arrival</button>
                    )}
                    {isNurse && isInProgress && (
                      <button onClick={() => handleStatusMutation(apt.id, "completed")} className="w-full bg-emerald-600 text-white h-12 text-xs font-bold rounded-xl uppercase">Complete Session</button>
                    )}
                    {!isNurse && (isPending || isAccepted) && (
                      <button onClick={() => handleStatusMutation(apt.id, "cancelled")} className="w-full bg-zinc-100 text-zinc-400 h-12 text-xs font-bold rounded-xl uppercase">Cancel Request</button>
                    )}
                    {needsReview && (
                      <div className="w-full space-y-3 bg-blue-50 p-4 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-blue-600 block uppercase mb-1">Evaluate Session Care Quality</span>
                        <div className="flex gap-2 justify-center">
                          {/* FIXED: Replaced dead array syntax wrapper with solid structural iteration array */}
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={cn("cursor-pointer text-lg", (ratingInput[apt.id] || 0) >= s ? "text-amber-400" : "text-zinc-300")} onClick={() => setRatingInput({ ...ratingInput, [apt.id]: s })}>★</span>
                          ))}
                        </div>
                        <button onClick={() => handleSubmitRating(apt.id)} className="w-full bg-blue-600 text-white h-9 text-xs font-bold rounded-xl uppercase">Submit</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
