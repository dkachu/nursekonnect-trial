"use client";

import React, { useState } from "react";
import { ExternalLink, ShieldCheck, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NCKVerifyBridgeProps {
  licenseNumber: string | number | null | undefined;
}

/**
 * Registry Bridge: Direct interface for Nursing Council of Kenya verification.
 * Targets the official NCK Retention Register as required by law.
 */
export default function NCKVerifyBridge({ licenseNumber }: NCKVerifyBridgeProps) {
  const [copied, setCopied] = useState(false);
  
  // Official OSP endpoint for license status verification
  const nckRegistryUrl = "https://osp.nckenya.com/LicenseStatus";

  const copyLicense = () => {
    // FIXED: Added a data presence guard to prevent literal "undefined" or "null" string copy bugs
    if (!licenseNumber) {
      return toast.error("Registry Sync Error", { description: "License identification is offline." });
    }

    // Protocol: Cleanse license string before handoff
    const cleanLicense = String(licenseNumber).trim();
    navigator.clipboard.writeText(cleanLicense);
    setCopied(true);
    toast.success("Registry Data Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-widest text-zinc-900 italic">Identity Check</h4>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">NCK Registry Interface</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed uppercase tracking-tight italic">
          Safety Requirement: All nurses practising in Kenya must be on the NCK Retention Register. Use this license number for accurate verification.
        </p>

        <div className="flex items-center justify-between bg-zinc-50 p-5 rounded-2xl border border-zinc-100 group">
          <div>
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">NCK License ID</p>
            <span className="text-lg font-black text-zinc-900 tracking-tighter italic">
              #{licenseNumber ? String(licenseNumber).trim() : "PENDING"}
            </span>
          </div>
          <button 
            type="button"
            onClick={copyLicense}
            className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-950 hover:text-white transition-all active:scale-90"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <a href={nckRegistryUrl} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-16 rounded-[1.8rem] bg-blue-600 hover:bg-zinc-950 font-black text-[11px] uppercase tracking-[0.2em] gap-3 italic group shadow-lg">
            Launch Official Register
            <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </a>
      </div>

      <div className="pt-6 border-t border-zinc-50">
        <div className="flex items-center gap-2 opacity-40">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
           <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest italic leading-tight">
              Verified clinical status is maintained by central registry admins
           </p>
        </div>
      </div>
    </div>
  );
}
