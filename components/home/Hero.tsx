"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 

export default function Hero() {
  const { user, loading, isNurse } = useAuth();
  
  const profile = user?.profile || user;
  
  // FIXED: Restructured conditional query logic to ensure both critical location constraints match database expectations
  const needsSetup = user && (!profile?.town?.trim() || !profile?.building?.trim());

  return (
    <section className="bg-background px-6 py-20 text-center w-full min-h-[85vh] flex items-center relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            CENTRAL HEALTH REGISTRY v1.0
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-foreground leading-none tracking-tighter uppercase">
          Healthcare Beyond Boundaries
        </h1>
        
        <p className="text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-wide">
          Secure marketplace connecting licensed professionals with 
          Kenyan households for immediate clinical dispatch.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          {loading ? (
            <div className="h-16 px-10 flex items-center bg-zinc-50 rounded-xl border">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 animate-pulse">Syncing Registry...</span>
            </div>
          ) : (
            <>
              {user ? (
                <Link href={needsSetup ? "/setup" : (isNurse ? "/profile" : "/dashboard")}>
                  <Button className="h-16 px-10 text-xs font-black uppercase tracking-widest rounded-xl bg-zinc-950 text-white border-none">
                    {needsSetup ? "COMPLETE SPATIAL SYNC" : (isNurse ? "DEPLOYMENT HUB" : "CARE DASHBOARD")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="h-16 px-10 text-xs font-black uppercase tracking-widest rounded-xl bg-blue-600 text-white border-none">
                      START ENROLMENT
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button className="h-16 px-10 text-xs font-black uppercase tracking-widest rounded-xl border bg-white text-zinc-800 border-zinc-200">
                      REGISTRY LOGIN
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
}
