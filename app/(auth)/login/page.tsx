"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

function LoginContent() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, loading: authLoading, isNurse } = useAuth();
  const redirectingRef = useRef<boolean>(false);
  
  const sessionExpired = searchParams.get("session") === "expired";
  const redirectParam = searchParams.get("redirect");

  // Catch expired login states cleanly using clear healthcare wording
  useEffect(() => {
    if (sessionExpired && !redirectingRef.current) {
      toast.error("Session Timeout", { 
        description: "Your secure login period has ended. Please sign in again to protect your secure health account information." 
      });
    }
  }, [sessionExpired]);

  // Handle active user redirects to the proper member boards
  useEffect(() => {
    if (authLoading || redirectingRef.current) return;

    if (user) {
      redirectingRef.current = true;
      if (redirectParam) {
        router.replace(decodeURIComponent(redirectParam));
        return;
      }

      const profile = user.profile;
      const hasTown = typeof profile?.town === "string" && profile.town.trim().length > 0;
      const hasBuilding = typeof profile?.building === "string" && profile.building.trim().length > 0;
      const isOnboarded = !!(hasTown && hasBuilding);
      
      if (!isOnboarded) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
      }
    }
  }, [user, authLoading, isNurse, router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Input Required", { description: "Please populate all fields before authenticating." });
      return;
    }

    setLocalLoading(true);
    
    try {
      // ✅ Enforce explicit parameter delivery to ensure Axios calculates Content-Length accurately
      await login(cleanEmail, password);
      
      toast.success("AUTHORIZATION GRANTED", {
        description: "Identity verified successfully. Routing to your secure workspace node..."
      });
    } catch (err: any) {
      // Catch backend validation error payloads directly from the server response
      const serverMessage = err.response?.data?.detail || "We could not verify your details. Please check your spelling and try again.";
      toast.error("Sign In Issue", { description: serverMessage });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Opening Secure Care Space...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-8 md:py-16 relative overflow-hidden font-sans select-none">
      <div className="max-w-md w-full space-y-8 relative z-10 p-2">
        <div className="text-center space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Secure Member Portal
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Sign In
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Your Email Address
              </Label>
              <Input 
                type="email" 
                required 
                disabled={isLoading}
                autoComplete="email"
                placeholder="name@nursekonnect.com"
                className="rounded-2xl h-14 border-zinc-100 bg-zinc-50 font-bold text-sm text-zinc-800 transition-all placeholder:text-zinc-300 focus-visible:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Your Password
              </Label>
              <Input 
                type="password" 
                required 
                disabled={isLoading}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="rounded-2xl h-14 border-zinc-100 bg-zinc-50 font-bold text-sm text-zinc-800 transition-all placeholder:text-zinc-300 focus-visible:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Verifying Details...</span>
            ) : (
              <span>Access Care Account</span>
            )}
          </Button>
        </form>

        <div className="pt-6 border-t border-dashed border-zinc-100 text-center space-y-4">
          <Link 
            href="/register" 
            className="text-blue-600 font-black text-xs uppercase tracking-widest hover:text-zinc-950 transition-colors block no-underline hover:underline"
          >
            Create a New Account
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-zinc-300 select-none">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              NurseKonnect On-Demand Health Network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 animate-pulse">
          Loading Care Space...
        </p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
