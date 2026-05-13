"use client";

import React from "react";
import Link from "next/link";
import Hero from "@/components/home/Hero";


export default function HomePage() {
  return (
    <div className="bg-background">
      <Hero />

      <section className="py-24 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto text-center space-y-8 px-6">
          <div className="space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                SECURE PLATFORM REGISTRY
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
              Network Access Gateways
            </h2>
            <p className="text-sm font-bold text-zinc-400 max-w-xl mx-auto uppercase tracking-wide">
              Initialize authorized account enrolment protocols into the clinical care directory.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full bg-blue-600 text-white h-16 px-10 rounded-xl font-black text-xs uppercase tracking-widest border-none transition-colors hover:bg-blue-700">
                JOIN AS PROFESSIONAL
              </button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 h-16 px-10 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white hover:text-zinc-950">
                REGISTER AS RECIPIENT
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
