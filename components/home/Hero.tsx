"use client";

import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center text-center px-6 font-sans select-none">
      <div className="max-w-2xl space-y-6">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-3 py-1.5 rounded-full">
          On-Demand Telemetry Network
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
          Clinical Dispatch <br className="hidden sm:inline" /> 
          <span className="text-blue-600 not-italic font-sans font-black">Synchronized.</span>
        </h1>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide leading-relaxed max-w-md mx-auto">
          Connecting verified medical practitioners with regional home care recipients via real-time PostGIS geospatial telemetry.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs mx-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 h-14 bg-zinc-950 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-[0.98] no-underline"
          >
            Access Hub
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 h-14 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] no-underline"
          >
            Join Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
