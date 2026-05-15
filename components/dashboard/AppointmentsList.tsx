"use client";

import React from "react";
import { Calendar, AlertCircle } from "lucide-react";

export default function AppointmentsList() {
  return (
    <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm select-none font-sans">
      <div className="flex items-center gap-2 border-b border-solid border-zinc-100 pb-4 mb-6">
        <Calendar size={16} className="text-blue-600" />
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
          Dispatched Service Line Allocations
        </h3>
      </div>
      
      <div className="py-12 border border-dashed border-zinc-100 bg-zinc-50/50 rounded-xl text-center px-4 space-y-2">
        <AlertCircle size={24} className="mx-auto text-zinc-300" />
        <p className="text-xs font-bold text-zinc-600 uppercase tracking-wide">
          Queue Perimeter Empty
        </p>
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider max-w-xs mx-auto leading-normal">
          No live care requests or pending patient matching logs detected in your immediate radius zone.
        </p>
      </div>
    </div>
  );
}
