"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";

export default function Hero() {
  const { user, loading, isNurse } = useAuth();
  
  // FIXED: Wrapped the setup condition in useMemo to prevent unnecessary re-renders during state hydration
  const needsSetup = useMemo(() => {
    if (!user) return false;
    const profile = user.profile;
    const hasTown = typeof profile?.town === "string" && profile.town.trim().length > 0;
    const hasBuilding = typeof profile?.building === "string" && profile.building.trim().length > 0;
    return !(hasTown && hasBuilding && user.is_synced);
  }, [user]);

  return (
    <section className="bg-background px-6 py-16 md:py-24 text-center w-full min-h-[80vh] flex items-center relative overflow-hidden font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.25em] italic select-none">
          <ShieldCheck size={12} className="animate-pulse" /> Central Health Registry v1.0
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-zinc-900 leading-none tracking-tighter uppercase italic select-none">
          Healthcare Beyond <br className="hidden md:inline" /> Boundaries
        </h1>
        
        <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-2xl mx-auto leading-relaxed uppercase tracking-wide select-none">
          Secure marketplace connecting licensed professionals with Kenyan households for immediate real-time clinical dispatch.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 w-full max-w-xs sm:max-w-md mx-auto">
          {loading ? (
            <div className="h-16 w-full flex items-center justify-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 select-none">
              <Loader2 className="animate-spin text-blue-600 mr-2" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
                Syncing Registry Context...
              </span>
            </div>
          ) : (
            <>
              {user ? (
                <Link 
                  href={needsSetup ? "/setup" : (isNurse ? "/profile" : "/dashboard")} 
                  className="w-full no-underline"
                >
                  <Button 
                    type="button"
                    className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>{needsSetup ? "COMPLETE SPATIAL SYNC" : (isNurse ? "ENTER DEPLOYMENT HUB" : "ENTER CARE DASHBOARD")}</span>
                    <ArrowRight size={12} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full no-underline">
                    <Button 
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all active:scale-[0.99] shadow-lg"
                    >
                      START ENROLMENT
                    </Button>
                  </Link>

                  <Link href="/login" className="w-full no-underline">
                    <Button 
                      type="button"
                      className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.99] shadow-sm"
                    >
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
