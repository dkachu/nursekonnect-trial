"use client";

import React from "react";
import { Activity, Zap, Loader2, ClipboardCheck } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface PatientStatsPayload {
  total_care_sessions: number;
  active_requests: number;
  pending_reviews: number;
}

interface PatientStatsProps {
  stats: PatientStatsPayload | null;
  loading?: boolean;
}

const PatientStats = ({ stats, loading }: PatientStatsProps) => {
  
  const renderValue = (val: number | undefined) => {
    if (loading) return (
      <div className="flex items-center gap-2 animate-pulse">
        <Loader2 size={14} className="animate-spin text-zinc-300" />
        <span className="text-[10px] text-zinc-300 font-black tracking-widest uppercase italic">Syncing</span>
      </div>
    );
    return val ?? 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000">
      <DashboardCard title="Total Care Sessions" count={renderValue(stats?.total_care_sessions)} icon={Activity} variant="default" />
      <DashboardCard title="Active Requests" count={renderValue(stats?.active_requests)} icon={Zap} variant="accent" />
      <DashboardCard title="Pending Reviews" count={renderValue(stats?.pending_reviews)} icon={ClipboardCheck} variant="dark" />
    </div>
  );
};

export default PatientStats;
