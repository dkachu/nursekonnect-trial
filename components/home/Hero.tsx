"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; 
import { Activity, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

/**
 * NURSEKONNEKT REGISTRY HERO
 * Optimized for production spatial handshakes and role-based routing.
 */
const Hero = () => {
  const { user, loading, isNurse } = useAuth();
  
  /**
   * Registry Guard Logic
   * Ensures users are routed to /setup if profile town/building is missing.
   */
  const profile = user?.profile || user;
  const needsSetup = user && !profile?.town && !profile?.building;

  return (
    <section className="bg-background px-6 py-20 text-center w-full min-h-[85vh] flex items-center relative overflow-hidden">
      {/* Registry spatial grid overlay using theme border color */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Status Handshake Pulse */}
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
          <Activity size={12} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
            Central Health Registry v1.0
          </span>
        </div>

        {/* Industrial Typography */}
        <h1 className="text-6xl md:text-9xl font-black text-foreground leading-[0.85] tracking-tighter uppercase italic">
          Healthcare <br /><span className="text-primary not-italic">Beyond Boundaries</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-tight italic">
          Secure marketplace connecting licensed professionals with 
          Kenyan households for immediate clinical dispatch.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-4">
          {loading ? (
            <div className="h-20 px-12 flex items-center gap-4 bg-muted rounded-3xl border border-border animate-pulse">
              <Loader2 className="animate-spin text-primary" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400">Syncing Registry...</span>
            </div>
          ) : (
            <>
              {user ? (
                <Link href={needsSetup ? "/setup" : (isNurse ? "/profile" : "/dashboard")}>
                  <Button className="h-20 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl bg-zinc-950 hover:bg-primary text-white transition-all shadow-2xl active:scale-95 italic gap-4">
                    {needsSetup ? "Complete Spatial Sync" : (isNurse ? "Deployment Hub" : "Care Dashboard")}
                    <ShieldCheck size={20} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="h-20 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl bg-primary hover:bg-zinc-950 text-white transition-all shadow-xl active:scale-95 italic gap-3">
                      Start Enrolment <ArrowRight size={20} />
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button variant="outline" className="h-20 px-12 text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl border-2 border-border hover:bg-muted transition-all active:scale-95 italic gap-3">
                      Registry Login <ShieldCheck size={20} className="text-primary" />
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
