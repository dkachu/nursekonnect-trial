"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PatientProfilePayload {
  town?: string;
  building?: string;
  emergency_contact_number?: string;
  blood_group?: string;
  allergies?: string;
  medical_history?: string;
}

interface Props {
  initialData: PatientProfilePayload | null | undefined;
  onSuccess?: () => void;
}

export default function PatientProfileForm({ initialData, onSuccess }: Props) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasInitialized = useRef(false);

  const [formData, setFormData] = useState({
    town: "",
    building: "",
    emergency_contact_number: "",
    blood_group: "",
    allergies: "",
    medical_history: "",
  });

  useEffect(() => {
    if (initialData && !hasInitialized.current) {
      setFormData({
        town: initialData.town || "",
        building: initialData.building || "",
        emergency_contact_number: initialData.emergency_contact_number || "",
        blood_group: initialData.blood_group || "",
        allergies: initialData.allergies || "",
        medical_history: initialData.medical_history || "",
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
            lng: pos.coords.longitude 
          });
          const updated = await refreshUser();
          if (updated?.profile) {
            setFormData(f => ({ ...f, town: updated.profile?.town || f.town, building: updated.profile?.building || f.building }));
          }
          toast.success("GPS tracking synchronized", { id: syncToast });
        } catch { 
          toast.error("Telemetry mapping rejected", { id: syncToast }); 
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
      setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
    } catch { 
      toast.error("Operation rejected: verify fields"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (isSuccess) return (
    <div className="bg-white p-12 rounded-3xl border border-zinc-100 text-center space-y-4 shadow-xl">
      <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Synchronization Confirmed</h3>
      <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest">Profile secure. Transferring to dashboard...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-8 rounded-3xl border">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6">
        <div>
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-widest">PHASE 02</span>
          <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Recipient Registration</h3>
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
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Resident Town</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.town} 
            onChange={(e) => setFormData({...formData, town: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Apartment / Building / House No</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.building} 
            onChange={(e) => setFormData({...formData, building: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Emergency Contact Number</Label>
          <Input 
            required 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold text-sm border-zinc-100" 
            value={formData.emergency_contact_number} 
            onChange={(e) => setFormData({...formData, emergency_contact_number: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Blood Group Matrix</Label>
          <Input 
            disabled={loading}
            className="rounded-xl h-14 bg-zinc-50 font-bold uppercase text-sm border-zinc-100" 
            value={formData.blood_group} 
            onChange={(e) => setFormData({...formData, blood_group: e.target.value.toUpperCase()})} 
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Medical History Summary</Label>
          <Textarea 
            disabled={loading}
            placeholder="Provide accurate description of chronic conditions..." 
            className="rounded-xl bg-zinc-50 font-medium min-h-[100px] text-sm border-zinc-100 resize-none p-4" 
            value={formData.medical_history} 
            onChange={(e) => setFormData({...formData, medical_history: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest block">Allergies and Reactions</Label>
          <Textarea 
            disabled={loading}
            placeholder="List drug or food hypersensitivity records..." 
            className="rounded-xl bg-zinc-50 font-medium min-h-[100px] text-sm border-zinc-100 resize-none p-4" 
            value={formData.allergies} 
            onChange={(e) => setFormData({...formData, allergies: e.target.value})} 
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading || isSyncing} 
        className="w-full bg-blue-600 text-white h-16 rounded-xl font-black text-xs uppercase tracking-widest border-none"
      >
        {loading ? "PROCESSING..." : "FINALIZE REGISTRY HANDSHAKE"}
      </Button>
    </form>
  );
}
