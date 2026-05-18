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

  // Structural route guard redirecting authenticated sessions to correct nodes
  useEffect(() => {
    if (authLoading || redirectingRef.current) return;

    if (user) {
      redirectingRef.current = true;
      const profile = (user as any).profile;
      const hasTown = typeof profile?.town === "string" && profile.town.trim().length > 0;
      const hasBuilding = typeof profile?.building === "string" && profile.building.trim().length > 0;
      const isOnboarded = !!(hasTown && hasBuilding && (user as any).is_synced);
      
      if (!isOnboarded) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
      }
    }
  }, [user, authLoading, isNurse, router]);

  // Transmits payload records back to AuthContext validation routines
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_nurse && !formData.is_patient) {
      toast.error("Role Selection Required", { 
        description: "Please specify whether you are registering as a Professional or Recipient." 
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
      
      if (result && result.success) {
        toast.success("Account Enrolled", { description: "Redirecting to validation terminal..." });
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else if (result && result.error) {
        toast.error("Registration Refused", { description: result.error });
      }
    } catch (err) {
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
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
          Synchronising Security Session...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-8 md:py-16 relative overflow-hidden font-sans select-none animate-in fade-in-50 duration-300">
      <div className="max-w-md w-full space-y-8 relative z-10 p-2">
        <div className="text-center space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest shifted-tracking-wide italic">
            Enrolment Portal Gateway
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Registration
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <span className="text-[10px] uppercase tracking-widest">
                  PROFESSIONAL
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
                <span className="text-[10px] uppercase tracking-widest">
                  RECIPIENT
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
            className="w-full bg-blue-600 hover:bg-zinc-950 h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.99] flex items-center justify-center text-white border-none cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>ENROLLING ACCOUNT RECORD...</span>
            ) : (
              <span>CREATE ACCOUNT IDENTITY</span>
            )}
          </Button>
        </form>

        <div className="pt-6 border-t border-dashed border-zinc-100 text-center space-y-4">
          <Link 
            href="/login" 
            className="text-zinc-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors block no-underline hover:underline"
          >
            ← RETURN TO LOGIN TERMINAL
          </Link>
        </div>
      </div>
    </div>
  );
}
