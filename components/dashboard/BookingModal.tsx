"use client";

import { useState } from "react";
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
import { CalendarClock, Loader2, ShieldCheck, Zap, X } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalId = parseInt(String(nurseId), 10);
    if (!finalId || isNaN(finalId)) {
      return toast.error("Registry Sync Error", { description: "Professional identifier is offline." });
    }

    if (!isPatient) {
        return toast.error("Role Restricted", { description: "Only Patients can initialize requests." });
    }

    const selectedDate = new Date(formData.scheduled_date);
    const now = new Date();
    
    if (selectedDate.getTime() < (now.getTime() - 120000)) {
      return toast.error("Schedule Conflict", { description: "Deployment cannot be scheduled for a past time." });
    }

    setLoading(true);
    try {
      await api.post("bookings/", {
        nurse: finalId,
        scheduled_date: selectedDate.toISOString(), 
        service_description: formData.service_description,
      });
      
      toast.success("Deployment Dispatched", { description: `Request queued for ${nurseName}.` });
      setFormData({ scheduled_date: "", service_description: "" });
      onClose(); 
      
    } catch (err) {
      const errorContext = err as ServerErrorResponse;
      const serverData = errorContext.response?.data;
      let errorMsg = "Verify deployment schedule and try again.";

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
        <DialogContent className="z-[101] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[92vw] md:max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white animate-in zoom-in-95 duration-300">
          <div className="bg-blue-600 h-2.5 w-full shrink-0" />
          
          <div className="p-8 space-y-6">
            <DialogHeader className="text-left relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl border border-zinc-800">
                  <CalendarClock size={28} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-zinc-900 leading-none italic">
                    Initialize <span className="text-blue-600 not-italic">Hire</span>
                  </DialogTitle>
                  <DialogDescription className="font-bold text-zinc-400 text-[9px] uppercase tracking-[0.2em] mt-1.5">
                     Secure Protocol Enabled
                  </DialogDescription>
                </div>
                <button onClick={onClose} className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all active:scale-90">
                  <X size={18} />
                </button>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Service Start Time</Label>
                  <Input 
                    type="datetime-local" 
                    required
                    value={formData.scheduled_date}
                    className="rounded-2xl h-16 border-zinc-100 bg-zinc-50 focus:ring-blue-600 font-bold transition-all shadow-inner text-sm"
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Care Requirements</Label>
                  <Textarea 
                    placeholder="Describe clinical assistance required..."
                    required
                    value={formData.service_description}
                    className="rounded-[2rem] min-h-[140px] border-zinc-100 bg-zinc-50 focus:ring-blue-600 font-medium p-6 shadow-inner text-sm leading-relaxed"
                    onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-5 bg-zinc-950 rounded-[2.2rem] flex items-start gap-4 border border-zinc-800 shadow-xl">
                <ShieldCheck size={24} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed tracking-tight italic">
                  <span className="text-blue-500">Identity Protection:</span> Exact residence coordinates are only revealed after Professional Accept.
                </p>
              </div>

              <Button 
                disabled={loading}
                type="submit" 
                className="w-full bg-blue-600 hover:bg-zinc-950 h-20 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.97] flex items-center justify-center gap-3 italic"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Confirm Dispatch <Zap size={18} className="fill-white" /></>}
              </Button>
            </form>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
