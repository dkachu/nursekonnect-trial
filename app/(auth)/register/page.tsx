"use client";

import { useState, useEffect } from "react";
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
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    is_nurse: false,
    is_patient: false,
  });

  useEffect(() => {
    if (!authLoading && user) {
      const profile = user.profile || user;
      const isConfigured = !!(profile?.town?.trim() || profile?.building?.trim());
      
      if (!isConfigured) {
        router.replace("/setup");
      } else {
        router.replace(isNurse ? "/profile" : "/dashboard");
      }
    }
  }, [user, authLoading, isNurse, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_nurse && !formData.is_patient) {
      toast.error("Role Required", { description: "Select an account classification to proceed." });
      return;
    }

    setLocalLoading(true);

    try {
      const result = await register(
        formData.email, 
        formData.password, 
        formData.phone_number, 
        formData.is_nurse, 
        formData.is_patient
      );
      
      if (result.success) {
        toast.success("Identity Enrolled");
      } else {
        toast.error("Registration Refused", { description: result.error });
      }
    } catch {
      toast.error("Registry Offline");
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading && !user) {
    return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;
  }

  return (
    <div className="bg-background min-h-[95vh] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ACCOUNT CREATION LAYER</span>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">REGISTRATION</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div 
                onClick={() => !isLoading && setFormData({ ...formData, is_nurse: true, is_patient: false })}
                className={cn(
                    "cursor-pointer p-4 rounded-xl border-2 text-center transition-all",
                    formData.is_nurse ? "border-blue-600 bg-blue-50/40 text-blue-600 font-black" : "border-zinc-100 bg-zinc-50 text-zinc-400 font-bold"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest">PROFESSIONAL</span>
             </div>

             <div 
                onClick={() => !isLoading && setFormData({ ...formData, is_nurse: false, is_patient: true })}
                className={cn(
                    "cursor-pointer p-4 rounded-xl border-2 text-center transition-all",
                    formData.is_patient ? "border-blue-600 bg-blue-50/40 text-blue-600 font-black" : "border-zinc-100 bg-zinc-50 text-zinc-400 font-bold"
                )}
             >
                <span className="text-[10px] uppercase tracking-widest">RECIPIENT</span>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Registry Email</Label>
              <Input
                type="email"
                required
                disabled={isLoading}
                autoComplete="email"
                className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Contact Phone</Label>
              <Input
                type="tel"
                required
                disabled={isLoading}
                autoComplete="tel"
                placeholder="+254"
                className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Security Pin</Label>
              <Input
                type="password"
                required
                disabled={isLoading}
                autoComplete="new-password"
                className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100 text-zinc-800"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-xl font-black text-xs uppercase tracking-widest border-none transition-colors"
          >
            {isLoading ? "CREATING ENROLMENT..." : "CREATE ENROLMENT"}
          </Button>
        </form>

        <div className="pt-6 border-t border-zinc-100 text-center space-y-4">
          <Link href="/login" className="text-zinc-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-colors block">
            ALREADY REGISTERED? LOGIN
          </Link>
          <div>
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">NURSEKONNEKT CENTRAL APP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
