"use client";

import React, { useState, useEffect } from "react";
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
  const [hardwareCoordinates, setHardwareCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [sensorError, setSensorError] = useState<string | null>(null);

  // Relocated form states initialization block to the top of the function to satisfy compilation parameters
  const [formData, setFormData] = useState({
    town: "",
    building: "",
    specialization: "general",
    years_of_experience: "0",
  });

  // Poll for native browser hardware sensor location loops on layout entry
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      setSensorError("Hardware telemetry tracking blocks are completely missing inside this browser node.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHardwareCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setSensorError(null);
      },
      (error) => {
        let msg = "Geospatial positioning lock refused by provider layout controls.";
        if (error.code === error.PERMISSION_DENIED) msg = "Location tracking authorization explicit permission denied.";
        if (error.code === error.POSITION_UNAVAILABLE) msg = "Geospatial positioning network signal unavailable.";
        if (error.code === error.TIMEOUT) msg = "Hardware sensor connection request timeout limits reached.";
        
        setSensorError(msg);
        console.warn(`[Sensor] Onboarding setup exception: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Strict Verification Block: Terminate execution paths if telemetry links are dead
    if (hardwareCoordinates.lat === null || hardwareCoordinates.lng === null) {
      toast.error("Geospatial Fault", { 
        description: sensorError || "Active GPS sensor tracking parameters remain completely unresolved. Please verify your hardware connection rules and try again." 
      });
      return;
    }

    if (!formData.town.trim() || !formData.building.trim()) {
      toast.error("Required Input", { 
        description: "Location text summaries are mandatory to process this account index modification." 
      });
      return;
    }

    setLocalLoading(true);

    const payload = isNurse 
      ? {
          town: formData.town.trim(),
          building: formData.building.trim(),
          specialization: formData.specialization,
          years_of_experience: parseInt(formData.years_of_experience, 10) || 0,
          lat: hardwareCoordinates.lat,
          lng: hardwareCoordinates.lng
        }
      : {
          town: formData.town.trim(),
          building: formData.building.trim(),
          lat: hardwareCoordinates.lat,
          lng: hardwareCoordinates.lng
        };

    try {
      const res = await api.put("accounts/profile/update/", payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("ONBOARDING COMPLETED", { 
          description: "Your operational healthcare network node profile has been activated cleanly." 
        });
        await refreshUser();
        router.replace(isNurse ? "/dashboard/nurse" : "/dashboard/patient");
      }
    } catch {
      toast.error("Handshake Refused", { 
        description: "The registry server dropped the profile update validation check package. Please check your data variables and try again." 
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const isResolvingSensor = hardwareCoordinates.lat === null && sensorError === null;

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
            Provide your your base operational zone variables to synchronize with nearby emergency care queries.
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
                disabled={localLoading || isResolvingSensor}
                placeholder="e.g. Kigumo"
                className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800 focus-visible:ring-blue-600"
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
                disabled={localLoading || isResolvingSensor}
                placeholder="e.g. Sub-County Complex"
                className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800 focus-visible:ring-blue-600"
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
                  disabled={localLoading || isResolvingSensor}
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
                  disabled={localLoading || isResolvingSensor}
                  min="0"
                  className="rounded-xl h-12 border-zinc-200 bg-white font-bold text-sm text-zinc-800 focus-visible:ring-blue-600"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={localLoading || isResolvingSensor}
            className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-14 rounded-xl font-black text-[11px] uppercase tracking-widest border-none transition-all duration-200 shadow-md flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isResolvingSensor ? "Resolving Hardware GPS Lock..." : localLoading ? "Activating Profile..." : "Activate Operational Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
