"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, Loader2, CheckCircle2, MapPin, ClipboardIcon, HeartPulse } from "lucide-react";
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

  // FIXED: Standardized profile state allocation inside a one-time execution gate to remove cascading loop blocks
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
    const syncToast = toast.loading("Establishing Satellite Handshake...");
    
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
          toast.success("Coordinates Synchronised", { id: syncToast });
        } catch { 
          toast.error("Mapping failed.", { id: syncToast }); 
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
      toast.success("Profile Synchronised");
      await refreshUser(); 
      setIsSuccess(true);
      setTimeout(() => { if (onSuccess) onSuccess(); }, 2000);
    } catch { 
      toast.error("Registry Rejection"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (isSuccess) return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-green-100 text-center space-y-4 italic shadow-2xl">
      <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
        <CheckCircle2 size={40} />
      </div>
      <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic">Handshake Complete</h3>
      <p className="text-zinc-500 font-medium text-xs leading-relaxed uppercase tracking-widest italic">Identity verified. Transferring to Care Dashboard...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            <ShieldAlert size={14} /> Security Protocol Active
          </div>
          <h3 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none italic">
            Registry <span className="text-blue-600">Sync</span>
          </h3>
        </div>
        <Button type="button" onClick={handleGPSSync} disabled={isSyncing} variant="outline" className="rounded-2xl py-6 px-8 font-black text-[10px] uppercase tracking-widest gap-2 border-2 border-blue-50 text-blue-600 italic transition-all active:scale-95">
          {isSyncing ? <Loader2 className="animate-spin" size={16}/> : <MapPin size={16}/>}
          {isSyncing ? "Locking..." : "Sync GPS"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-[0.2em] px-1 italic">Registry Town</Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.town} onChange={(e) => setFormData({...formData, town: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-[0.2em] px-1 italic">Building</Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest px-1 italic">SOS Phone</Label>
          <Input required className="rounded-xl h-14 bg-zinc-50 font-bold text-sm" value={formData.emergency_contact_number} onChange={(e) => setFormData({...formData, emergency_contact_number: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="font-black text-zinc-400 uppercase text-[9px] tracking-widest px-1 italic">Blood Group</Label>
          <Input className="rounded-xl h-14 bg-zinc-50 font-bold uppercase text-sm" value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value.toUpperCase()})} />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <ClipboardIcon size={12} className="text-blue-600" /> Medical History
          </Label>
          <Textarea placeholder="Describe chronic conditions..." className="rounded-2xl bg-zinc-50 font-medium min-h-[100px] text-sm italic resize-none" value={formData.medical_history} onChange={(e) => setFormData({...formData, medical_history: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-black text-zinc-400 uppercase text-[9px] px-1 italic">
            <HeartPulse size={12} className="text-red-500" /> Allergies
          </Label>
          <Textarea placeholder="Drug/Food reactions..." className="rounded-2xl bg-zinc-50 font-medium min-h-[100px] text-sm italic resize-none" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-zinc-950 hover:bg-blue-600 h-20 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest italic transition-all shadow-xl active:scale-95">
        {loading ? <Loader2 className="animate-spin" size={24} /> : "Finalise Registry Handshake"}
      </Button>
    </form>
  );
}
