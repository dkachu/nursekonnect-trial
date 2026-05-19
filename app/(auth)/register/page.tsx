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
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const redirectingRef = useRef<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    is_nurse: false,
    is_patient: false,
  });

  // Verify and route users who are already logged in to their dashboards
  useEffect(() => {
    if (authLoading || redirectingRef.current) return;

    if (user) {
      redirectingRef.current = true;
      const profile = (user as any).profile;
      const hasTown = typeof profile?.town === "string" && profile.town.trim().length > 0;
      const hasBuilding = typeof profile?.building === "string" && profile.building.trim().length > 0;
      const isOnboarded = !!(hasTown && hasBuilding);
      
      if (!isOnboarded) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
      }
    }
  }, [user, authLoading, isNurse, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_nurse && !formData.is_patient) {
      toast.error("Account Type Required", { 
        description: "Please specify whether you are registering as a Healthcare Professional or a Patient." 
      });
      return;
    }

    setLocalLoading(true);

    try {
      await register(
        formData.email.trim(), 
        formData.password, 
        formData.phone_number.trim(), 
        formData.is_nurse, 
        formData.is_patient
      );
      
      toast.success("REGISTRATION COMPLETED", { 
        description: "Your credential profiles have been verified. Launching environment node..." 
      });
    } catch (err: any) {
      // Intercept explicit dictionary validation errors emitted by your backend serializer
      const errorMap = err.response?.data || {};
      const feedbackDetail = errorMap.email?.[0] || errorMap.phone_number?.[0] || errorMap.detail || "The registration parameters provided violate validation filters.";
      toast.error("Registration Issue", { description: feedbackDetail });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
          Opening Secure Care Space...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-8 md:py-16 relative overflow-hidden font-sans select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full space-y-8 relative z-10 p-2">
        <div className="text-center space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest italic">
            Join Our Care Network
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <button 
                type="button"
                disabled={isLoading}
                onClick={() => setFormData({ ...formData, is_nurse: true, is_patient: false })}
                className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all focus:outline-none flex flex-col items-center justify-center h-16 cursor-pointer disabled:cursor-not-allowed",
                    formData.is_nurse 
                      ? "border-blue-600 bg-blue-50/20 text-blue-600 font-black" 
                      : "border-zinc-100 bg-zinc-50/80 text-zinc-400 font-bold hover:bg-zinc-100"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest">NURSE PRO</span>
             </button>

             <button 
                type="button"
                disabled={isLoading}
                onClick={() => setFormData({ ...formData, is_nurse: false, is_patient: true })}
                className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all focus:outline-none flex flex-col items-center justify-center h-16 cursor-pointer disabled:cursor-not-allowed",
                    formData.is_patient 
                      ? "border-blue-600 bg-blue-50/20 text-blue-600 font-black" 
                      : "border-zinc-100 bg-zinc-50/80 text-zinc-400 font-bold hover:bg-zinc-100"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest">PATIENT HUB</span>
             </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Email Address
              </Label>
              <Input
                type="email"
                required
                disabled={isLoading}
                autoComplete="email"
                placeholder="name@example.com"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 transition-all placeholder:text-zinc-300 focus-visible:ring-blue-600"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Mobile Phone Number
              </Label>
              <Input
                type="tel"
                required
                disabled={isLoading}
                autoComplete="tel"
                placeholder="e.g. 0741450193"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 transition-all placeholder:text-zinc-300 focus-visible:ring-blue-600"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Password (Minimum 8 Characters)
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="••••••••••••"
                className="rounded-2xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800 transition-all placeholder:text-zinc-300 focus-visible:ring-blue-600"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-zinc-950 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <span>Registering Workspace...</span> : <span>Establish Connection Node</span>}
          </Button>
        </form>

        <div className="pt-6 border-t border-dashed border-zinc-100 text-center space-y-4">
          <Link 
            href="/login" 
            className="text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors block no-underline hover:underline"
          >
            Already registered? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
