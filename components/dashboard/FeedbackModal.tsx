"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedbackModalProps {
  bookingId: number | string;
  onComplete: () => void;
}

export default function FeedbackModal({ bookingId, onComplete }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // FIXED: Lifted variable mapping to the root scope to ensure availability across template lines
  const cleanBookingId = parseInt(String(bookingId || ""), 10);

  const submitReputation = async () => {
    if (!cleanBookingId || isNaN(cleanBookingId)) {
      return toast.error("Synchronization Error", {
        description: "Invalid deployment record tracker token identifier."
      });
    }

    const cleanFeedback = feedback.trim();
    if (cleanFeedback.length < 5) {
      return toast.error("Validation Error", {
        description: "Please document a brief care assessment to complete this registry evaluation."
      });
    }

    setIsSubmitting(true);
    try {
      // FIXED: Routed payload path parameters safely to match your explicit root layout view urls
      await api.patch(`bookings/${cleanBookingId}/`, {
        rating: rating,
        patient_feedback: cleanFeedback,
        status: "completed"
      });
      
      toast.success("Evaluation Saved", {
        description: "Clinical professional reputation registry parameters updated successfully."
      });
      onComplete();
    } catch (err: any) {
      toast.error("Submission Denied", {
        description: err.response?.data?.detail || "Feedback execution lookup handshake refused."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl max-w-sm w-full mx-auto transform transition-all select-none font-sans">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900 leading-none">
          Session Evaluation
        </h3>
        {/* FIXED: Template reads securely from cleanBookingId variable tracking bounds safely */}
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
          NK-ID: {!isNaN(cleanBookingId) ? `NK-${String(cleanBookingId).padStart(4, "0")}` : "UNKNOWN"}
        </p>
      </div>

      <div className="flex justify-center gap-2 py-2 border-y border-dashed border-zinc-100">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
          <button 
            key={s} 
            type="button"
            disabled={isSubmitting}
            onClick={() => setRating(s)} 
            className="text-3xl transition-all active:scale-90 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
            aria-label={`Evaluate ${s} out of 5 stars`}
          >
            <span className={rating >= s ? "text-amber-400 font-mono drop-shadow-sm" : "text-zinc-200 font-mono"}>
              {rating >= s ? "★" : "☆"}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1 block mb-1">
          Clinical Quality Log Notes
        </label>
        <textarea 
          className="w-full h-28 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-zinc-800 resize-none transition-all placeholder:text-zinc-400 leading-relaxed"
          placeholder="Document specific care markers regarding practitioner diagnostic capability, punctuality, and equipment presentation..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isSubmitting}
          maxLength={500}
        />
        <div className="text-right text-[9px] text-zinc-400 font-medium px-1 mt-1">
          {feedback.trim().length} / 500 characters
        </div>
      </div>

      <Button 
        onClick={submitReputation} 
        disabled={isSubmitting}
        className="w-full h-14 rounded-2xl bg-zinc-950 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-widest border-none transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
      >
        {isSubmitting ? "TRANSMITTING EVALUATION..." : "SUBMIT DISPATCH EVALUATION"}
      </Button>
    </div>
  );
}
