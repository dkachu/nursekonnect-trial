"use client";

import Hero from '@/components/home/Hero';
import Link from 'next/link';
import React from 'react';
import { ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-background">
      <Hero />

      <section className="py-32 bg-zinc-950 relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <h2 className="text-[20vw] font-black text-white leading-none tracking-tighter uppercase select-none italic">
                NURSE
            </h2>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-10 px-6 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] italic">
               <ShieldCheck size={16} /> Secure Network Active
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none italic">
              Ready to <span className="text-primary not-italic">Connect</span>
            </h2>
            <p className="text-zinc-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed uppercase tracking-tight italic">
              Access Kenya&apos;s premier healthcare network connecting households with 
              licensed medical expertise in real-time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="group w-full bg-primary text-white px-12 py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 italic">
                <ShieldCheck size={18} />
                Join as Professional
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full bg-zinc-900 border-2 border-zinc-800 text-zinc-400 px-12 py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-zinc-950 transition-all active:scale-95 flex items-center justify-center gap-3 italic">
                <UserPlus size={18} />
                Register as Patient
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
