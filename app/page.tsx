"use client";

import React from "react";
import Link from "next/link";
import Hero from "@/components/marketing/Hero";


export default function HomePage() {
  return (
    <div className="bg-background min-h-screen w-full select-none font-sans antialiased">
      {/* Dynamic Telemetry Network Presentation Layer */}
      <Hero />

      {/* Gateway Entry Panel Section */}
      <section className="py-16 md:py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-blue-600 rounded-full opacity-5 blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 px-6 relative z-10">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 select-none">
                SECURE PLATFORM REGISTRY HANDSHAKE
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              Network Access Gateways
            </h2>
            <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-xl mx-auto uppercase tracking-wide leading-relaxed">
              Initialize authorized account enrolment protocols into the centralized clinical care directory infrastructure.
            </p>
          </div>
          
          {/* Action Links Trigger Strip */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 w-full max-w-md mx-auto sm:max-w-none">
            <Link 
              href="/register" 
              className="w-full sm:w-auto no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-2xl"
            >
              <button 
                type="button"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-lg"
              >
                JOIN AS PROFESSIONAL
              </button>
            </Link>

            <Link 
              href="/register" 
              className="w-full sm:w-auto no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-2xl"
            >
              <button 
                type="button"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-white hover:text-zinc-950 text-zinc-400 h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest border border-zinc-800 transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-sm"
              >
                REGISTER AS RECIPIENT
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
