"use client";

import { useState, useEffect, Suspense } from "react";
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
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (!authLoading && user) {
      if (callbackUrl) {
        router.replace(callbackUrl);
        return;
      }

      const profile = user.profile || user;
      const isConfigured = !!(profile?.town?.trim() || profile?.building?.trim());
      
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
        toast.success("Authentication Verified");
      }
    } catch {
      toast.error("Handshake Timeout");
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SECURITY PROTOCOL LAYER</span>
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">AUTHENTICATION</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Registry Email</Label>
              <Input 
                type="email" 
                required 
                disabled={isLoading}
                autoComplete="email"
                className="rounded-xl h-14 border-zinc-100 bg-zinc-50 focus:ring-blue-600 font-bold text-sm text-zinc-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Security Pin</Label>
              <Input 
                type="password" 
                required 
                disabled={isLoading}
                autoComplete="current-password"
                className="rounded-xl h-14 border-zinc-100 bg-zinc-50 focus:ring-blue-600 font-bold text-sm text-zinc-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-xl font-black text-xs uppercase tracking-widest border-none transition-colors"
          >
            {isLoading ? "VERIFYING..." : "ENTER HUB"}
          </Button>
        </form>

        <div className="pt-6 border-t border-zinc-100 text-center space-y-4">
          <Link href="/register" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline block">
            NEW ENROLMENT
          </Link>
          <div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">NURSEKONNEKT CENTRAL APP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="text-center p-12 text-zinc-400 font-bold text-xs">LOADING ENTRY HUB...</div>
    }>
      <LoginContent />
    </Suspense>
  );
}
