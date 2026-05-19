"use client";

import React from "react";
import { NurseProfile } from "@/types/nurse";

interface NurseCardProps {
  nurse: NurseProfile;
  onDispatch?: (nurse: NurseProfile) => void;
  isDispatching?: boolean;
}

export default function NurseCard({ nurse, onDispatch, isDispatching = false }: NurseCardProps) {
  // Graceful email prefix fallback logic for user tracking aliases
  const displayName = nurse.user_details.email.includes("@")
    ? nurse.user_details.email.split("@")[0]
    : nurse.user_details.email;
    
  const distanceKm = nurse.distance ? parseFloat(nurse.distance) : null;
  const isAvailableForDispatch = nurse.is_available && nurse.is_online;
  const isLoading = isDispatching;

  return (
    <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none">
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-wider mb-1">
              {nurse.specialization}
            </div>
            <h3 className="text-xl font-black text-zinc-900 tracking-tight capitalize break-all">
              {displayName}
            </h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
            isAvailableForDispatch
              ? "bg-emerald-50 text-emerald-700 border border-solid border-emerald-100" 
              : "bg-zinc-100 text-zinc-500 border border-solid border-zinc-200"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isAvailableForDispatch ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
            {isAvailableForDispatch ? "Dispatch Active" : "Off-Duty"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-solid border-zinc-100">
          <div className="flex items-center gap-1.5 font-bold">
            <span>{nurse.years_of_experience} Yrs Exp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={nurse.is_verified ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
              {nurse.is_verified ? "Board Verified" : "Pending Audit"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-zinc-500 pt-1">
          <div className="flex items-start gap-1.5">
            <p className="line-clamp-2">
              <strong>Sector:</strong> {nurse.building}, {nurse.town}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <p><strong>Node:</strong> {nurse.user_details.phone_number}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-solid border-zinc-100 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {distanceKm !== null ? (
            <p className="text-xs text-zinc-500 truncate">
              Proximity: <span className="text-zinc-900 font-black text-sm">{distanceKm.toFixed(2)} km</span> away
            </p>
          ) : (
            <p className="text-xs text-zinc-400 italic">Position unresolved</p>
          )}
        </div>
        
        {onDispatch && (
          <button
            type="button"
            onClick={() => onDispatch(nurse)}
            disabled={!isAvailableForDispatch || isLoading}
            className="bg-zinc-950 hover:bg-blue-600 disabled:bg-zinc-100 text-white disabled:text-zinc-400 h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed transition-all border-none active:scale-[0.98] shrink-0 min-w-[110px]"
          >
            {isLoading ? "Routing..." : "Request Care"}
          </button>
        )}
      </div>
    </div>
  );
}
