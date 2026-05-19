"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading, isNurse } = useAuth();
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    town: "",
    building: "",
    specialization: "",
    years_of_experience: "",
    blood_group: "",
    allergies: "",
    medical_history: "",
  });

  // Pulls structural user profile data arrays on component context mount
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Session Unauthorized", { description: "Authenticate to access profile parameters." });
      router.replace("/login");
      return;
    }

    if (user && user.profile) {
      const profile = user.profile as Record<string, any>;
      setFormData({
        town: profile.town || "",
        building: profile.building || "",
        specialization: profile.specialization || "",
        years_of_experience: profile.years_of_experience?.toString() || "",
        blood_group: profile.blood_group || "",
        allergies: profile.allergies || "",
        medical_history: profile.medical_history || "",
      });
    }
  }, [user, authLoading, router]);

  // Packages updated payload schemas for database profile patches
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.town.trim() || !formData.building.trim()) {
      toast.error("Validation Blocked", { description: "Location fields are mandatory." });
      return;
    }

    setLocalLoading(true);

    const submissionPayload = isNurse
      ? {
          town: formData.town.trim(),
          building: formData.building.trim(),
          specialization: formData.specialization.trim(),
          years_of_experience: parseInt(formData.years_of_experience) || 0,
        }
      : {
          town: formData.town.trim(),
          building: formData.building.trim(),
          blood_group: formData.blood_group.trim().toUpperCase(),
          allergies: formData.allergies.trim(),
          medical_history: formData.medical_history.trim(),
        };

    try {
      // Replaced absolute path string elements with relative parameters handled by the api interceptor proxy
      const res = await api.put("accounts/profile/update/", submissionPayload);
      
      if (res.status === 200 || res.status === 201) {
        toast.success("Changes Saved", { description: "Your central profile records have successfully updated." });
        await refreshUser();
      }
    } catch (err: any) {
      console.error("Profile update sync crash:", err);
      const backendError = err.response?.data?.error || "The registry node refused the modification handshake.";
      toast.error("Update Refused", { description: backendError });
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || authLoading;

  if (authLoading || !user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Synchronising Profile State Matrix...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen font-sans bg-white select-none animate-in fade-in-50 duration-200">
      <header className="border-b border-dashed border-zinc-100 pb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Account Management Perimeter
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">
            Profile Station
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push(isNurse ? "/dashboard/nurse" : "/dashboard/patient")}
          className="text-zinc-500 hover:text-zinc-950 font-black text-[10px] uppercase tracking-widest bg-transparent border-none cursor-pointer transition-colors"
        >
          ← Return to Dashboard
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
            Geospatial Location Tracking Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Town / Sector</Label>
              <Input 
                type="text" required disabled={isLoading} placeholder="e.g. Kigumo"
                value={formData.town} onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Building Base Name / Node</Label>
              <Input 
                type="text" required disabled={isLoading} placeholder="e.g. Sub-County Complex"
                value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              />
            </div>
          </div>
        </div>

        {isNurse ? (
          <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
              Professional Practice Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Clinical Specialization</Label>
                <Input 
                  type="text" disabled={isLoading} placeholder="e.g. ICU Specialist"
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
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 border border-solid border-zinc-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 border-b border-solid border-zinc-200 pb-2">
              Patient Emergency Diagnostic Variables
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Blood Group Category</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. O+" maxLength={3}
                    value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Known Allergies Index</Label>
                  <Input 
                    type="text" disabled={isLoading} placeholder="e.g. Penicillin, Peanuts"
                    value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Chronic Medical History Summary</Label>
                <Input 
                  type="text" disabled={isLoading} placeholder="e.g. Hypertension diagnosed in 2024"
                  value={formData.medical_history} onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        <Button 
          disabled={isLoading}
          type="submit" 
          className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? <span>Synchronising Parameters...</span> : <span>Commit Record Updates</span>}
        </Button>
      </form>
    </main>
  );
}
