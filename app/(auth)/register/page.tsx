"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, ShieldPlus, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loading: authLoading, isNurse } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const redirectingRef = useRef<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    is_nurse: false,
    is_patient: false,
  });

  useEffect(() => {
    if (authLoading || redirectingRef.current) return;

    if (user) {
      redirectingRef.current = true;
      
      // FIXED: Direct lookup schema parsing bypasses union types compile blockers
      const profile = user.profile;
      const hasTown = typeof profile?.town === "string" && profile.town.trim().length > 0;
      const hasBuilding = typeof profile?.building === "string" && profile.building.trim().length > 0;
      const isOnboarded = !!(hasTown && hasBuilding && user.is_synced);
      
      if (!isOnboarded) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/profile" : "/dashboard");
      }
    }
  }, [user, authLoading, isNurse, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_nurse && !formData.is_patient) {
      toast.error("Role Selection Required", { 
        description: "Please specify whether you are registering as a Practitioner or Recipient." 
      });
      return;
    }

    setLocalLoading(true);

    try {
      const result = await register(
        formData.email.trim(), 
        formData.password, 
        formData.phone_number.trim(), 
        formData.is_nurse, 
        formData.is_patient
      );
      
      if (!result.success && result.error) {
        toast.error("Registration Refused", { description: result.error });
      }
    } catch {
      toast.error("Registry Offline", { 
        description: "The registry node rejected the authorization handshake." 
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Synchronising Security Session...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-8 md:py-16 relative overflow-hidden font-sans select-none animate-in fade-in-50 duration-300">
      <div className="max-w-md w-full space-y-8 relative z-10 p-2">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            <ShieldPlus size={14} className="animate-pulse" /> Enrolment Portal Gateway
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Registration
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FIXED: Changed from insecure clickable divs to structural semantic button selectors */}
          <div className="grid grid-cols-2 gap-4">
             <button 
                type="button"
                disabled={isLoading}
                onClick={() => setFormData({ ...formData, is_nurse: true, is_patient: false })}
                className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all focus:outline-none flex flex-col items-center justify-center gap-1.5 h-16 cursor-pointer disabled:cursor-not-allowed",
                    formData.is_nurse 
                      ? "border-blue-600 bg-blue-50/20 text-blue-600 font-black" 
                      : "border-zinc-100 bg-zinc-50/80 text-zinc-400 font-bold hover:bg-zinc-100"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest flex items-center gap-1">
                  {formData.is_nurse && <Check size={10} />} PROFESSIONAL
                </span>
             </button>

             <button 
                type="button"
                disabled={isLoading}
                onClick={() => setFormData({ ...formData, is_nurse: false, is_patient: true })}
                className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all focus:outline-none flex flex-col items-center justify-center gap-1.5 h-16 cursor-pointer disabled:cursor-not-allowed",
                    formData.is_patient 
                      ? "border-blue-600 bg-blue-50/20 text-blue-600 font-black" 
                      : "border-zinc-100 bg-zinc-50/80 text-zinc-400 font-bold hover:bg-zinc-100"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest flex items-center gap-1">
                  {formData.is_patient && <Check size={10} />} RECIPIENT
                </span>
             </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Registry Email Address
              </Label>
              <Input
                type="email"
                required
                disabled={isLoading}
                autoComplete="email"
                placeholder="nursekonnect@gmail.com"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0 transition-all placeholder:text-zinc-300"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Contact Phone Line (SMS Delivery Link)
              </Label>
              <Input
                type="tel"
                required
                disabled={isLoading}
                autoComplete="tel"
                placeholder="07XXXXXXXX"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0 transition-all placeholder:text-zinc-300"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Security Access Password (Min 8 Characters)
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="••••••••••••"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0 transition-all placeholder:text-zinc-300"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>CREATING ENROLMENT PROFILE...</span>
              </>
            ) : (
              <span>CREATE SECURE ENROLMENT</span>
            )}
          </Button>
        </form>

        <div className="pt-6 border-t border-dashed border-zinc-100 text-center space-y-4">
          <Link 
            href="/login" 
            className="text-zinc-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-colors block no-underline hover:underline"
          >
            ALREADY REGISTERED? PROCEED TO LOGIN →
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-zinc-300 select-none">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              NURSEKONNEKT CENTRAL APPOINTMENTS SYSTEMS REGISTRY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
