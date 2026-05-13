"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ShieldCheck, User, Loader2, Phone, Mail, Lock, ArrowRight, Activity } from "lucide-react";
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

  // FIXED: Auto-routing listener intercepts the state change once registration auto-logs the user in
  useEffect(() => {
    if (!authLoading && user) {
      const isConfigured = !!(user.profile?.town || user.profile?.building);
      
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
      toast.error("Role Required", { description: "Classify account as Professional or Recipient." });
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
        toast.success("Identity Synchronised");
      } else {
        toast.error("Handshake Refused", { description: result.error });
      }
    } catch {
      toast.error("Registry Offline", { description: "Handshake timed out." });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  return (
    <div className="bg-background min-h-[95vh] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-12 animate-in fade-in duration-1000 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-zinc-950 text-primary rounded-xl border border-zinc-800 mb-2 shadow-2xl">
             <Activity size={12} className="animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Identity Protocol</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-none italic">NurseKonnekt</h1>
          <p className="text-zinc-500 font-medium text-sm uppercase tracking-widest italic leading-relaxed">Enter the verified digital <br /> healthcare marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
             <div 
                onClick={() => !isLoading && setFormData({ ...formData, is_nurse: true, is_patient: false })}
                className={cn(
                    "cursor-pointer p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center gap-3 relative overflow-hidden",
                    formData.is_nurse ? "border-primary bg-blue-50 shadow-xl" : "border-zinc-50 bg-zinc-50 hover:border-zinc-200",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
             >
                <div className={cn("p-4 rounded-2xl transition-all", formData.is_nurse ? "bg-primary text-white shadow-lg" : "bg-white text-zinc-300")}>
                    <ShieldCheck size={24} />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", formData.is_nurse ? "text-primary" : "text-zinc-400")}>Professional</span>
             </div>

             <div 
                onClick={() => !isLoading && setFormData({ ...formData, is_nurse: false, is_patient: true })}
                className={cn(
                    "cursor-pointer p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center gap-3 relative overflow-hidden",
                    formData.is_patient ? "border-primary bg-blue-50 shadow-xl" : "border-zinc-50 bg-zinc-50 hover:border-zinc-200",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
             >
                <div className={cn("p-4 rounded-2xl transition-all", formData.is_patient ? "bg-primary text-white shadow-lg" : "bg-white text-zinc-300")}>
                    <User size={24} />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", formData.is_patient ? "text-primary" : "text-zinc-400")}>Recipient</span>
             </div>
          </div>

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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1 italic">Contact Phone</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
                <Input
                  type="tel"
                  required
                  disabled={isLoading}
                  autoComplete="tel"
                  placeholder="+254"
                  className="rounded-2xl h-16 pl-12 bg-zinc-50 font-bold focus:ring-primary shadow-inner text-sm border-zinc-100"
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
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
                  autoComplete="new-password"
                  className="rounded-2xl h-16 pl-12 bg-zinc-50 font-bold focus:ring-primary shadow-inner text-sm border-zinc-100"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-zinc-950 hover:bg-primary h-20 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 italic border-none"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Create Enrolment <ArrowRight size={18} /></>}
          </Button>
        </form>

        <div className="pt-8 border-t border-zinc-100 text-center space-y-6">
          <Link href="/login" className="text-zinc-400 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-colors">
            Already Registered? Login
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
