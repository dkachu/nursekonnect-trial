"use client";

import React, { useState } from "react";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransitMapProps {
  currentBooking: {
    id: number | string;
    patient_user_id: number;
    patient_name: string;
  } | null;
}

export default function TransitMap({ currentBooking }: TransitMapProps) {
  const [isTransitActive, setIsTransitActive] = useState(false);

  // Bind the live tracking hook to the current active patient target
  const { coordinates, isStreaming } = useLocationTracker(
    currentBooking?.patient_user_id ?? null,
    isTransitActive && !!currentBooking
  );

  return (
    <Card className="w-full max-w-md mx-auto rounded-[2rem] border-zinc-100 shadow-xl overflow-hidden bg-white">
      <div className="bg-emerald-600 h-2 w-full" />
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-lg font-black uppercase tracking-tight text-zinc-950">
          Transit Dispatch System
        </CardTitle>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
          Active Node: {currentBooking ? `#${currentBooking.id}` : "No Active Route"}
        </p>
      </CardHeader>
      
      <CardContent className="p-6 pt-2 space-y-6">
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              GPS Telemetry Stream
            </span>
            <div className="flex items-center space-x-1.5">
              <span className={`h-2 w-2 rounded-full ${isStreaming ? "bg-green-500 animate-pulse" : "bg-zinc-300"}`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${isStreaming ? "text-green-600" : "text-zinc-400"}`}>
                {isStreaming ? "Streaming Live" : "Offline"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs font-bold text-zinc-800">
            <div>
              <span className="block text-[9px] text-zinc-400 uppercase font-sans tracking-wide">Latitude</span>
              {coordinates.lat ? coordinates.lat.toFixed(6) : "—"}
            </div>
            <div>
              <span className="block text-[9px] text-zinc-400 uppercase font-sans tracking-wide">Longitude</span>
              {coordinates.lng ? coordinates.lng.toFixed(6) : "—"}
            </div>
          </div>
        </div>

        {currentBooking && (
          <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl">
            <p className="text-xs font-semibold text-blue-900 leading-relaxed">
              En Route to <span className="font-black">{currentBooking.patient_name}</span>. Keep this page open to maintain active location updates for the patient.
            </p>
          </div>
        )}

        <Button
          disabled={!currentBooking}
          onClick={() => setIsTransitActive((prev) => !prev)}
          className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer border-none text-white ${
            isTransitActive 
              ? "bg-rose-600 hover:bg-rose-700" 
              : "bg-blue-600 hover:bg-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400"
          }`}
        >
          {isTransitActive ? "Terminate Journey Stream" : "Commence Journey Transit"}
        </Button>
      </CardContent>
    </Card>
  );
}
