"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BookingBillingData {
  id: number;
  price: string;
  is_paid_out: boolean;
  service_description: string;
  nurse_name: string;
}

interface InvoiceCardProps {
  booking: BookingBillingData;
  onSettlementSuccess: () => void;
}

export default function PatientInvoiceCard({ booking, onSettlementSuccess }: InvoiceCardProps) {
  const [processing, setProcessing] = useState<boolean>(false);
  const costAmount = parseFloat(booking.price) || 0.00;

  const handlePaymentProcessing = async () => {
    setProcessing(true);
    try {
      // Direct integration patch updating payment flags securely on the viewset
      const res = await api.patch(`bookings/${booking.id}/status/`, {
        status: "completed",
        is_paid_out: true
      });

      if (res.status === 200 || res.status === 201) {
        toast.success("INVOICE SETTLED", {
          description: `Transaction reference NK-BILL-${booking.id} cleared successfully via mobile billing.`
        });
        onSettlementSuccess();
      }
    } catch (err) {
      toast.error("Settlement Terminated", {
        description: "The medical ledger registry engine refused to clear this ledger line index entry."
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm font-sans select-none space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex justify-between items-start border-b border-dashed border-zinc-100 pb-4">
        <div className="space-y-1">
          <div className="text-blue-600 font-black text-[9px] uppercase tracking-widest italic">
            Itemized Clinical Statement
          </div>
          <h4 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
            Statement Ref: #NK-BILL-{booking.id}
          </h4>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-solid ${
          booking.is_paid_out 
            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
            : "bg-red-50 text-red-700 border-red-100 animate-pulse"
        }`}>
          {booking.is_paid_out ? "Settled" : "Outstanding Balance"}
        </span>
      </div>

      <div className="text-xs space-y-2.5 bg-zinc-50 border border-solid border-zinc-100 p-4 rounded-xl font-medium text-zinc-600">
        <div className="flex justify-between border-b border-solid border-zinc-200/60 pb-2">
          <span>Assigned Practitioner Node:</span>
          <span className="text-zinc-900 font-bold uppercase">{booking.nurse_name}</span>
        </div>
        <div className="flex justify-between items-start gap-4 border-b border-solid border-zinc-200/60 pb-2">
          <span>Deployment Operations:</span>
          <span className="text-zinc-900 font-bold italic text-right max-w-[200px] line-clamp-1">
            "{booking.service_description}"
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 text-sm text-zinc-900 font-black">
          <span className="uppercase text-xs tracking-wider text-zinc-400">Total Charged Line:</span>
          <span className="text-base text-zinc-950">KES {costAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {!booking.is_paid_out && (
        <Button
          type="button"
          disabled={processing}
          onClick={handlePaymentProcessing}
          className="w-full bg-zinc-950 hover:bg-blue-600 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-none transition-all duration-200 shadow-md flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {processing ? "Authorizing Settlement Nodes..." : "Clear Statement via Mobile Ledger"}
        </Button>
      )}
    </div>
  );
}
