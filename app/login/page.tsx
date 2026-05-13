"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Lock, Loader2, ShieldCheck, ArrowRight, Activity, Zap } from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, loading: authLoading, isNurse } = useAuth();

  // Extract the callback parameter appended by the Next.js edge middleware
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    /**
     * Registry Guard Logic
     * Explicitly checks the user.profile key block to satisfy 
     * the strict UserProfile type definition contract and pass Vercel checks.
     */
    if (!authLoading && user) {
      // 1. If a secure callback path exists from a middleware intercept, honor it immediately
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      // 2. Standard initial entry-point dashboard evaluation routing fallback
      const isConfigured = !!(user.profile?.town || user.profile?.building);
      if (!isConfigured) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/profile" : "/dashboard");
      }
    }
  }, [user, authLoading, isNurse, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Identity Verified");
      }
    } catch {
      toast.error("Registry Offline", { description: "Handshake timed out." });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-primary" size={48} />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-950" size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">authorising...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-md w-full space-y-12 animate-in fade-in duration-1000 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-zinc-950 text-primary rounded-xl border border-zinc-800 mb-2 shadow-2xl">
             <ShieldCheck size={12} className="text-primary" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">NK-REGISTRY V1.0</span>
          </div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Authentication</h1>
          <p className="text-zinc-500 font-medium text-sm uppercase tracking-widest italic">Verify credentials to access network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 italic">Registry Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
                <Input 
                  type="email" 
                  required 
                  disabled={isLoading}
                  autoComplete="email"
                  className="rounded-2xl h-16 pl-12 bg-zinc-50 font-bold focus:ring-primary shadow-inner text-sm italic border-zinc-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 italic">Security Pin</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
                <Input 
                  type="password" 
                  required 
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="rounded-2xl h-16 pl-12 bg-zinc-50 font-bold focus:ring-primary shadow-inner text-sm border-zinc-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-primary h-20 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 italic"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Enter Hub <ArrowRight size={18} /></>}
          </Button>
        </form>

        <div className="pt-8 border-t border-zinc-100 text-center space-y-6">
          <Link href="/register" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-4 decoration-2">
            New Enrolment
          </Link>
          <div className="flex items-center justify-center gap-3 text-zinc-300 grayscale opacity-40">
             <Activity size={14} />
             <p className="text-[9px] font-black uppercase tracking-[0.4em]">NurseKonnekt</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js App Router requires useSearchParams to be wrapped in a Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
