"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Star, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedbackModalProps {
  bookingId: number;
  onComplete: () => void;
}

export default function FeedbackModal({ bookingId, onComplete }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReputation = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`bookings/${bookingId}/status/`, {
        rating: rating,
        patient_feedback: feedback
      });
      
      toast.success("Reputation Authenticated");
      onComplete();
    } catch {
      toast.error("Handshake Failed", { 
        description: "Registry sync error." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl animate-in zoom-in-95">
      <div className="text-center">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">
          Rate Professional
        </h3>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
          Finalizing Dispatch NK-{String(bookingId).padStart(4, '0')}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button 
            key={s} 
            type="button"
            disabled={isSubmitting}
            onClick={() => setRating(s)} 
            className="transition-transform active:scale-90 disabled:opacity-50"
          >
            <Star 
              size={32} 
              className={rating >= s ? "fill-amber-400 text-amber-400" : "text-zinc-200"} 
            />
          </button>
        ))}
      </div>

      <textarea 
        className="w-full h-32 p-5 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all italic resize-none"
        placeholder="How was the clinical assistance?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isSubmitting}
      />

      <Button 
        onClick={submitReputation} 
        disabled={isSubmitting}
        className="w-full h-16 rounded-3xl bg-zinc-950 hover:bg-blue-600 font-black uppercase tracking-widest gap-3 italic transition-all shadow-xl active:scale-95"
      >
        <Send size={16} /> Authenticate Reputation
      </Button>

      <div className="flex items-center justify-center gap-2 opacity-50">
        <ShieldCheck size={12} className="text-blue-500" />
        <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">
          Verified Clinical Registry
        </span>
      </div>
    </div>
  );
}
