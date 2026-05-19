"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nurseIdParam = searchParams.get("nurse_id");
  const specialisationParam = searchParams.get("specialisation") || "Clinician";

  const [serviceDescription, setServiceDescription] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!nurseIdParam) {
      toast.error("Allocation Aborted", { 
        description: "Please select a healthcare professional from the dashboard provider list first." 
      });
      router.replace("/dashboard/patient");
    }
  }, [nurseIdParam, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!serviceDescription.trim()) {
      toast.error("Validation Blocked", { 
        description: "Please describe your clinical needs for this emergency home care request." 
      });
      return;
    }

    setLocalLoading(true);

    const payload = {
      nurse: parseInt(nurseIdParam || "0", 10),
      service_description: serviceDescription.trim(),
      scheduled_date: new Date(scheduledDate).toISOString(),
    };

    try {
      const res = await api.post("bookings/", payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("DISPATCH COMPLETED", { 
          description: "Your emergency medical care request has been routed to the practitioner node." 
        });
        router.replace("/dashboard/patient");
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.scheduled_date?.[0] || "The routing registry rejected this assignment request.";
      toast.error("Allocation Rejected", { description: serverMessage });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[90vh] flex items-center justify-center px-4 py-12 font-sans select-none animate-in fade-in duration-200">
      <div className="max-w-xl w-full border border-solid border-zinc-200 p-8 rounded-3xl space-y-8 shadow-sm">
        <div className="space-y-2">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] italic">
            Emergency Care Allocation
          </div>
          <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Request Dispatch
          </h1>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide pt-1">
            Target Unit: <span className="text-blue-600 font-black">{decodeURIComponent(specialisationParam)} Node</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
              Medical Service Description & Clinical Requirements
            </Label>
            <textarea
              required
              disabled={localLoading}
              rows={4}
              placeholder="Detail current symptoms, patient mobility parameters, and the home care services required..."
              className="w-full p-4 rounded-2xl border border-solid border-zinc-200 bg-zinc-50 font-bold text-sm text-zinc-800 transition-all placeholder:text-zinc-300 resize-none focus:outline-none focus:border-blue-600"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
              Target Execution Timestamp
            </Label>
            <input
              type="datetime-local"
              required
              disabled={localLoading}
              className="w-full h-14 px-4 rounded-2xl border border-solid border-zinc-200 bg-zinc-50 font-bold text-sm text-zinc-800 transition-all focus:outline-none focus:border-blue-600"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              disabled={localLoading}
              onClick={() => router.back()}
              className="w-1/3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={localLoading}
              className="w-2/3 bg-blue-600 hover:bg-zinc-950 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-none transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {localLoading ? "Transmitting Fields..." : "Commit Allocation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center font-sans">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 animate-pulse">Mounting Form Matrix...</p>
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
