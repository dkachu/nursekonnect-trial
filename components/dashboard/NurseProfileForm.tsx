"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    const syncToast = toast.loading("Establishing GPS connection...");

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
          toast.success("GPS data synchronized", { id: syncToast });
        } catch (err) { 
          toast.error("Telemetry update rejected", { id: syncToast }); 
          console.error(err);
        } finally { 
          setIsSyncing(false); 
        }
      },
      () => { 
        setIsSyncing(false); 
        toast.error("GPS connection timeout", { id: syncToast }); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("accounts/profile/update/", formData);
      toast.success("Profile records updated");
      await refreshUser(); 
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else router.push("/profile");
      }, 2000);
    } catch { 
      toast.error("Operation rejected: verify attributes"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (isSuccess) return (
    <div className="bg-white p-12 rounded-3xl border border-zinc-100 text-center space-y-4 shadow-xl">
      <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Synchronization Confirmed</h3>
      <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest">
        Profile secure. Redirecting to workspace...
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-8 rounded-3xl border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-widest">PHASE 02</span>
          <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">
            Credential Verification
          </h3>
        </div>
        <Button 
          type="button" 
          onClick={handleGPSSync} 
          disabled={isSyncing || loading} 
          className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest bg-zinc-950 text-white border-none"
        >
          {isSyncing ? "SYNCHRONIZING..." : "SYNCHRONIZE GPS"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">NCK License Identifier</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.license_number} 
            onChange={(e) => setFormData({...formData, license_number: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">KRA PIN Certificate</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold uppercase text-sm border-zinc-100" 
            value={formData.kra_pin} 
            onChange={(e) => setFormData({...formData, kra_pin: e.target.value.toUpperCase()})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Operational Base Town</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.town} 
            onChange={(e) => setFormData({...formData, town: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Base Facility / Building Name</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.building} 
            onChange={(e) => setFormData({...formData, building: e.target.value})} 
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading || isSyncing} 
        className="w-full rounded-xl h-16 bg-blue-600 text-white font-black text-xs uppercase tracking-widest border-none"
      >
        {loading ? "PROCESSING..." : "FINALIZE PROFESSIONAL ENROLMENT"}
      </Button>
    </form>
  );
}
