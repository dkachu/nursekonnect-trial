"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBookingSocket } from "@/hooks/useBookingSocket";
import api from "@/lib/api";

interface BookingItem {
  id: number;
  scheduled_date: string;
  service_description: string;
  status: string;
  patient_name?: string;
  nurse_name?: string;
}

export default function AppointmentsList() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronizes data array states using your Axios fallback interface
  const fetchActiveBookings = useCallback(async () => {
    try {
      const res = await api.get("bookings/active/");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to sync booking data rows:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Intercepts live asynchronous stream frames emitted by your BookingConsumer
  const handleLiveSocketUpdate = useCallback((message: any) => {
    console.log("[Socket] Intercepted real-time dispatch trace:", message);
    
    // Forces runtime data refresh if an active assignment shifts status profiles
    if (message.type) {
      fetchActiveBookings();
    }
  }, [fetchActiveBookings]);

  // Initializes real-time websocket tracking matrix loop connections
  const { isConnected } = useBookingSocket(handleLiveSocketUpdate);

  useEffect(() => {
    fetchActiveBookings();
  }, [fetchActiveBookings]);

  if (loading) {
    return (
      <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm font-sans text-center">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
          Parsing allocation matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm select-none font-sans">
      <div className="flex items-center justify-between border-b border-solid border-zinc-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
            Dispatched Service Line Allocations
          </h3>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? "Channel Live" : "Channel Stalled"}
        </span>
      </div>
      
      {bookings.length === 0 ? (
        <div className="py-12 border border-dashed border-zinc-100 bg-zinc-50/50 rounded-xl text-center px-4 space-y-2">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
            Queue Perimeter Empty
          </p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider max-w-xs mx-auto leading-normal">
            No live care requests or pending patient matching logs detected in your immediate radius zone.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-4 border border-solid border-zinc-100 rounded-xl bg-zinc-50/30 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  ID: {booking.id} | {booking.service_description}
                </p>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  Scheduled execution bounds: {new Date(booking.scheduled_date).toLocaleString()}
                </p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                booking.status === "pending" ? "bg-amber-100 text-amber-800" :
                booking.status === "accepted" ? "bg-blue-100 text-blue-800" :
                "bg-zinc-100 text-zinc-800"
              }`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
