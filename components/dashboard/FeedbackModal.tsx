"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedbackModalProps {
  bookingId: number;
  onComplete: () => void;
}

export default function FeedbackModal({ bookingId, onComplete }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitReputation = async () => {
    const cleanId = parseInt(String(bookingId), 10);
    if (!cleanId || isNaN(cleanId)) {
      return toast.error("Synchronization Error");
    }

    setIsSubmitting(true);
    try {
      await api.patch(`bookings/${cleanId}/status/`, {
        rating: rating,
        patient_feedback: feedback.trim(),
        status: "completed"
      });
      
      toast.success("Evaluation Saved");
      onComplete();
    } catch {
      toast.error("Submission Denied");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-white rounded-3xl border border-zinc-100 shadow-xl">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900">
          Session Evaluation
        </h3>
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
          NK-ID: {cleanId}
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
          <button 
            key={s} 
            type="button"
            disabled={isSubmitting}
            onClick={() => setRating(s)} 
            className="text-2xl transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className={rating >= s ? "text-amber-400" : "text-zinc-200"}>
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea 
        className="w-full h-28 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none text-zinc-800 resize-none"
        placeholder="Provide clinical care quality notes..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isSubmitting}
      />

      <Button 
        onClick={submitReputation} 
        disabled={isSubmitting}
        className="w-full h-14 rounded-2xl bg-zinc-950 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest border-none"
      >
        {isSubmitting ? "SUBMITTING..." : "SUBMIT EVALUATION"}
      </Button>
    </div>
  );
}
