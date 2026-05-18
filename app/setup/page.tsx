"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OnboardingSetupPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading, isNurse } = useAuth();
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    town: "",
    building: "",
    specialization: "",
    years_of_experience: "",
    license_number: "",
    kra_pin: "",
    blood_group: "",
    allergies: "",
    medical_history: "",
  });

  // Verify registration context state parameters on context mounting
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Session Unauthorized", { description: "Authenticate to access onboarding steps portal." });
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Packages structured inputs for profile model changes updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.town.trim() || !formData.building.trim()) {
      toast.error("Validation Blocked", { description: "Sector location bounds (Town and Building) are mandatory." });
      return;
    }

    setLocalLoading(true);

    const submissionPayload = isNurse
      ? {
          town: formData.town.trim(),
          building: formData.building.trim(),
          specialization: formData.specialization.trim() || "General Nursing",
          years_of_experience: parseInt(formData.years_of_experience) || 0,
          license_number: formData.license_number.trim(),
          kra_pin: formData.kra_pin.trim().toUpperCase(),
        }
      : {
          town: formData.town.trim(),
          building: formData.building.trim(),
          blood_group: formData.blood_group.trim().toUpperCase(),
          allergies: formData.allergies.trim(),
          medical_history: formData.medical_history.trim(),
        };

    try {
      // Normalised relative path routing matching your central interceptor proxies parameters
      const res = await api.put("accounts/profile/update/", submissionPayload);
      
      if (res.status === 200 || res.status === 201) {
        toast.success("Profile Authenticated", { description: "Your data matrix has successfully synced." });
        await refreshUser();
        setTimeout(() => {
          router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Profile mutation sync crash:", err);
      const backendError = err.response?.data?.error || "The registry node rejected the synchronization handshake.";
      toast.error("Synchronization Refused", { description: backendError });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading || !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Synchronising Onboarding Matrix State...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[95vh] flex items-center justify-center px-4 py-8 md:py-16 font-sans select-none animate-in fade-in-50 duration-300">
      <div className="max-w-xl w-full space-y-8 p-2">
        <div className="text-center space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Profile Alignment Matrix
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Onboarding Setup
          </h1>
          <p className="text-xs font-medium text-zinc-400 max-w-sm mx-auto leading-normal">
            Complete your security registry profile parameters to fully allocate dynamic spatial dispatch vectors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
              Core Location Vectors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Town / Location Sector</Label>
                <Input 
                  type="text" required disabled={isLoading} placeholder="e.g. Kigumo, Nairobi"
                  value={formData.town} onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Building Name / Suite / Node</Label>
                <Input 
                  type="text" required disabled={isLoading} placeholder="e.g. Market Plaza Block B"
                  value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                />
              </div>
            </div>
          </div>

          {isNurse ? (
            <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
                Clinical Practitioner Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Clinical Specialization</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. ICU Specialist, Pediatric"
                    value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Years of Active Experience</Label>
                  <Input 
                    type="number" disabled={isLoading} placeholder="e.g. 5" min="0"
                    value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">NCK Board License Number</Label>
                  <Input 
                    type="text" required={isNurse} disabled={isLoading} placeholder="e.g. NCK-12345"
                    value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">KRA Revenue PIN Validation</Label>
                  <Input 
                    type="text" required={isNurse} disabled={isLoading} placeholder="e.g. A001234567Z" maxLength={11}
                    value={formData.kra_pin} onChange={(e) => setFormData({ ...formData, kra_pin: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
                Recipient Medical Metrics
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Blood Group Category</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. O+, A-" maxLength={3}
                    value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Known Allergies / Contraindications</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. Penicillin, Latex, None"
                    value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Chronic Medical History Summary</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. Hypertension history, None"
                    value={formData.medical_history} onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <Button 
            disabled={isLoading} type="submit" 
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-none transition-all cursor-pointer"
          >
            {localLoading ? "Synchronising Parameters..." : "Complete Profile Sync"}
          </Button>
        </form>
      </div>
    </div>
  );
}
