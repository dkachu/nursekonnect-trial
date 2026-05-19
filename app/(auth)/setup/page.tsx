"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { isNurse, refreshUser } = useAuth();
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    town: "",
    building: "",
    specialization: "general",
    years_of_experience: "0",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.town.trim() || !formData.building.trim()) {
      toast.error("Required Input", { 
        description: "Location settings are mandatory to connect to the on-demand care network." 
      });
      return;
    }

    setLocalLoading(true);

    const payload = isNurse 
      ? {
          town: formData.town.trim(),
          building: formData.building.trim(),
          specialization: formData.specialization,
          years_of_experience: parseInt(formData.years_of_experience, 10) || 0
        }
      : {
          town: formData.town.trim(),
          building: formData.building.trim()
        };

    try {
      const res = await api.put("accounts/profile/update/", payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("ONBOARDING COMPLETED", { 
          description: "Your health provider network node has been initialized cleanly." 
        });
        await refreshUser();
        router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
      }
    } catch {
      toast.error("Handshake Refused", { 
        description: "The registry server failed to save your location. Please check your network and try again." 
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center px-4 font-sans select-none animate-in fade-in duration-300">
      <div className="max-w-md w-full space-y-8 p-2">
        <div className="text-center space-y-3">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Network Profile Activation
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Setup Sector
          </h1>
          <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto">
            Provide your base operational zone variables to synchronize with nearby emergency care queries.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-zinc-50 border border-solid border-zinc-200 p-6 rounded-2xl space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Town / Sector Node Name
              </Label>
              <Input
                type="text"
                required
                disabled={localLoading}
                placeholder="e.g. Kigumo"
                className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800"
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                Building Base Name or Complex Reference
              </Label>
              <Input
                type="text"
                required
                disabled={localLoading}
                placeholder="e.g. Sub-County Complex"
                className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              />
            </div>
          </div>

          {isNurse && (
            <div className="bg-zinc-50 border border-solid border-zinc-200 p-6 rounded-2xl space-y-4 animate-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                  Clinical Practice Specialization
                </Label>
                <select
                  disabled={localLoading}
                  className="w-full h-12 px-3 rounded-xl border border-solid border-zinc-200 bg-white font-bold text-sm text-zinc-800 focus:outline-none focus:border-blue-600"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  <option value="general">General Nursing</option>
                  <option value="pediatric">Pediatric Nursing</option>
                  <option value="icu">ICU Specialist</option>
                  <option value="midwife">Midwifery</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                  Years of Certified Active Experience
                </Label>
                <Input
                  type="number"
                  required={isNurse}
                  disabled={localLoading}
                  min="0"
                  className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={localLoading}
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all duration-200 shadow-xl flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {localLoading ? "Indexing Parameters..." : "Activate Care Workspace"}
          </Button>
        </form>
      </div>
    </div>
  );
}
