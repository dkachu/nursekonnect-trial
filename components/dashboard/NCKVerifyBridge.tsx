"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NCKVerifyBridgeProps {
  licenseNumber: string | number | null | undefined;
}

export default function NCKVerifyBridge({ licenseNumber }: NCKVerifyBridgeProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const nckRegistryUrl = "https://osp.nckenya.com/LicenseStatus";

  const copyLicense = () => {
    if (!licenseNumber) {
      return toast.error("Synchronization Error");
    }

    const cleanLicense = String(licenseNumber).trim();
    navigator.clipboard.writeText(cleanLicense);
    setCopied(true);
    toast.success("License Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLicense = licenseNumber ? String(licenseNumber).trim() : "PENDING";

  return (
    <div className="bg-white border border-zinc-100 p-8 rounded-3xl shadow-xl space-y-6">
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Statutory Compliance</h4>
        <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900">NCK Verification Bridge</h3>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-medium text-zinc-500 leading-relaxed uppercase tracking-tight">
          All nurses practicing within Kenya must maintain active status on the Nursing Council of Kenya Retention Register.
        </p>

        <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">NCK Registration ID</p>
            <span className="text-lg font-black text-zinc-900 tracking-tighter uppercase italic">
              {displayLicense}
            </span>
          </div>
          <button 
            type="button"
            onClick={copyLicense}
            className="h-10 px-4 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors uppercase"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>

      <a href={nckRegistryUrl} target="_blank" rel="noopener noreferrer" className="block">
        <Button className="w-full h-14 rounded-xl bg-blue-600 hover:bg-zinc-950 text-white font-black text-xs uppercase tracking-widest border-none">
          LAUNCH OFFICIAL NCK REGISTER
        </Button>
      </a>
    </div>
  );
}
