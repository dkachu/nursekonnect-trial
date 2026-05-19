"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReviewModalProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PatientReviewModal({ bookingId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      rating: rating,
      patient_feedback: feedback.trim(),
    };

    try {
      // Hits your exact custom action endpoint url_path='status'
      const res = await api.patch(`bookings/${bookingId}/status/`, payload);
      
      if (res.status === 200) {
        toast.success("EVALUATION RECORDED", {
          description: "Thank you for your feedback. Your clinical review has been logged securely."
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorDetail = err.response?.data?.error || "The routing engine refused to save your visit rating.";
      toast.error("Evaluation Refused", { description: errorDetail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-solid border-zinc-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="space-y-1.5">
          <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest italic">
            Post-Visit Clinical Logistics
          </div>
          <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">
            Rate Care Session
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
              Practitioner Performance Score
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={loading}
                  onClick={() => setRating(num)}
                  className={`w-10 h-10 rounded-xl border border-solid text-xs font-black transition-all cursor-pointer ${
                    rating === num
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-md"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
              Visit Observations & Feedback Summary
            </Label>
            <textarea
              required
              disabled={loading}
              rows={3}
              placeholder="Provide comments regarding practitioner response latency, treatment compliance, and on-site care verification details..."
              className="w-full p-4 rounded-xl border border-solid border-zinc-200 bg-zinc-50 font-bold text-xs text-zinc-800 transition-all placeholder:text-zinc-300 resize-none focus:outline-none focus:border-blue-600"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="w-1/3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 h-12 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all"
            >
              Dismiss
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-blue-600 hover:bg-zinc-950 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer border-none transition-all shadow-md disabled:cursor-not-allowed"
            >
              {loading ? "Logging Review..." : "Commit Evaluation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
