"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface BookingModalProps {
  nurseId: number | string | null | undefined;
  nurseName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ServerErrorResponse {
  response?: {
    data?: {
      scheduled_date?: string | string[];
      detail?: string;
    };
  };
}

export default function BookingModal({ nurseId, nurseName, isOpen, onClose }: BookingModalProps) {
  const { isPatient } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_date: "",
    service_description: "",
  });

  const formatLocalDateToISO = (localDateTimeString: string): string => {
    if (!localDateTimeString) return "";
    const date = new Date(localDateTimeString);
    if (isNaN(date.getTime())) return "";
    
    const pad = (num: number) => String(num).padStart(2, "0");
    
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    
    const offsetMinutes = date.getTimezoneOffset();
    if (offsetMinutes === 0) return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    
    const offsetSign = offsetMinutes > 0 ? "-" : "+";
    const absOffsetMinutes = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(absOffsetMinutes / 60));
    const offsetMins = pad(absOffsetMinutes % 60);
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMins}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalId = parseInt(String(nurseId || ""), 10);
    if (!finalId || isNaN(finalId)) {
      return toast.error("Synchronization Error", { description: "Invalid professional profile selection." });
    }

    if (!isPatient) {
      return toast.error("Access Restricted", { description: "Authorized patient credentials required." });
    }

    const selectedDate = new Date(formData.scheduled_date);
    const now = new Date();
    
    if (selectedDate.getTime() < (now.getTime() - 120000)) {
      return toast.error("Schedule Error", { description: "Past schedules are blocked." });
    }

    if (formData.service_description.trim().length < 10) {
      return toast.error("Validation Error", { description: "Provide a descriptive summary of clinical requirements." });
    }

    setLoading(true);
    try {
      await api.post("bookings/", {
        nurse: finalId,
        scheduled_date: formatLocalDateToISO(formData.scheduled_date), 
        service_description: formData.service_description.trim(),
      });
      
      toast.success("Request Queued", { description: `Dispatched cleanly to ${nurseName}.` });
      setFormData({ scheduled_date: "", service_description: "" });
      onClose(); 
      
    } catch (err) {
      const errorContext = err as ServerErrorResponse;
      const serverData = errorContext.response?.data;
      let errorMsg = "Verify parameter variables and retry execution.";

      if (serverData?.scheduled_date) {
        errorMsg = Array.isArray(serverData.scheduled_date) ? serverData.scheduled_date[0] : serverData.scheduled_date;
      } else if (serverData?.detail) {
        errorMsg = serverData.detail;
      }
      
      toast.error("Registry Rejection", { description: String(errorMsg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-zinc-950/60 backdrop-blur-sm z-[100]" />
        <DialogContent className="z-[101] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[92vw] sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white animate-in zoom-in-95 duration-200 focus-visible:outline-none">
          <div className="bg-blue-600 h-2 w-full shrink-0" />
          
          <div className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="text-left relative">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none">
                  Initialize Dispatch
                </DialogTitle>
                <DialogDescription className="font-bold text-zinc-400 text-[9px] uppercase tracking-widest mt-1">
                   Security Handshake Protocol Active
                </DialogDescription>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Service Start Time</Label>
                  <Input 
                    type="datetime-local" 
                    required
                    disabled={loading}
                    value={formData.scheduled_date}
                    className="rounded-2xl h-14 border-zinc-100 bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-600 font-bold transition-all text-sm focus-visible:ring-offset-0"
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Clinical Requirements</Label>
                  <Textarea 
                    placeholder="Provide accurate details regarding medication, tools, and required care routines..."
                    required
                    disabled={loading}
                    value={formData.service_description}
                    className="rounded-2xl min-h-[110px] border-zinc-100 bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-600 font-medium p-4 text-sm leading-relaxed resize-none focus-visible:ring-offset-0"
                    onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-sm">
                <p className="text-[9px] font-bold text-zinc-400 uppercase leading-normal tracking-wide">
                  Data Protection: Geolocation and identity parameters remain obfuscated across network nodes until the practitioner accepts this dispatch request.
                </p>
              </div>

              <Button 
                disabled={loading}
                type="submit" 
                className="w-full bg-blue-600 hover:bg-zinc-950 h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.99] flex items-center justify-center text-white border-none cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "TRANSMITTING DATA..." : "CONFIRM DISPATCH"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
