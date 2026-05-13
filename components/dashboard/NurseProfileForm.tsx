"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2, CheckCircle2, MapPin, ShieldCheck, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";

interface NurseProfilePayload {
  license_number?: string;
  kra_pin?: string;
  specialization?: string;
  years_of_experience?: number;
  town?: string;
  building?: string;
}

interface NurseFormProps {
  initialData: NurseProfilePayload | null | undefined;
  onSuccess?: () => void;
}

export default function NurseProfileForm({ initialData, onSuccess }: NurseFormProps) {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasInitialized = useRef(false);

  const [formData, setFormData] = useState({
    license_number: "",
    kra_pin: "",
    specialization: "general",
    years_of_experience: 0,
    town: "",
    building: "",
  });

  // FIXED: Implemented a strict useRef barrier layout protection gate. This guarantees that 
  // form population triggers exactly once on component mount, eliminating cascading render loops.
  useEffect(() => {
    if (initialData && !hasInitialized.current) {
      setFormData({
        license_number: initialData.license_number || "",
        kra_pin: initialData.kra_pin || "",
        specialization: initialData.specialization || "general",
        years_of_experience: initialData.years_of_experience || 0,
        town: initialData.town || "",
        building: initialData.building || "",
      });
      hasInitialized.current = true;
    }
  }, [initialData]);

  const handleGPSSync = () => {
    if (!navigator.geolocation) return toast.error("GPS hardware missing.");
    setIsSyncing(true);
    const syncToast = toast.loading("Establishing Satellite Handshake...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.patch("accounts/profile/update/", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heartbeat: true 
          });
          const updated = await refreshUser();
          if (updated?.profile) {
            setFormData(f => ({ 
              ...f, 
              town: updated.profile?.town || f.town, 
              building: updated.profile?.building || f.building 
            }));
          }
          toast.success("GPS Lock Synchronised", { id: syncToast });
        } catch (err) { 
          toast.error("Registry mapping refused.", { id: syncToast }); 
          print(err);
        } finally { 
          setIsSyncing(false); 
        }
      },
      () => { 
        setIsSyncing(false); 
        toast.error("Satellite Signal Timeout", { id: syncToast }); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("accounts/profile/update/", formData);
      toast.success("Registry Updated");
      await refreshUser(); 
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else router.push("/profile");
      }, 2000);
    } catch { 
      toast.error("Update Refused: Check Credentials"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (isSuccess) return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-green-100 text-center space-y-4 italic shadow-2xl">
      <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
        <CheckCircle2 size={40} />
      </div>
      <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">Lock Confirmed</h3>
      <p className="text-zinc-500 font-medium text-xs leading-relaxed uppercase tracking-widest italic">
        Profile Synchronised. Entering Ledger...
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            <ShieldAlert size={14} /> Professional Protocol Active
          </div>
          <h3 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic">
            Verify <span className="text-blue-600">Credentials</span>
          </h3>
        </div>
        <Button type="button" onClick={handleGPSSync} disabled={isSyncing} variant="outline" className="rounded-2xl py-6 px-8 font-black text-[10px] uppercase tracking-widest gap-2 border-2 border-blue-50 text-blue-600 italic transition-all active:scale-95">
          {isSyncing ? <Loader2 className="animate-spin" size={16}/> : <MapPin size={16}/>}
          {isSyncing ? "Locking..." : "Sync GPS"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <ShieldCheck size={14} className="text-blue-600" /> NCK License
          </Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <Briefcase size={14} className="text-blue-600" /> KRA PIN
          </Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold uppercase text-sm" value={formData.kra_pin} onChange={(e) => setFormData({...formData, kra_pin: e.target.value.toUpperCase()})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <MapPin size={14} className="text-blue-600" /> Current Town
          </Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.town} onChange={(e) => setFormData({...formData, town: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <Building2 size={14} className="text-blue-600" /> Base Facility
          </Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-[2rem] h-20 bg-zinc-950 hover:bg-blue-600 font-black text-xs uppercase tracking-[0.3em] gap-3 italic transition-all shadow-xl active:scale-95">
        {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
        {loading ? "Verifying..." : "Finalise Professional Enrolment"}
      </Button>
    </form>
  );
}
