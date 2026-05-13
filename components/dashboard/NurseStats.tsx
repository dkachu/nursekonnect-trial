"use client";

import React from "react";
import { Zap, Wallet, CheckCircle2, Star, Loader2 } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface StatsPayload {
  active_dispatches: number;
  gross_earnings: number;
  total_success: number;
  registry_rating: string | number;
}

interface NurseStatsProps {
  stats: StatsPayload | null;
  loading?: boolean;
}

const NurseStats = ({ stats, loading }: NurseStatsProps) => {
  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const renderValue = (val: string | number | null | undefined, fallback: string | number = "0") => {
    if (loading) return (
      <div className="flex items-center gap-2 animate-pulse">
        <Loader2 size={14} className="animate-spin text-zinc-300" />
        <span className="text-[10px] text-zinc-300 font-black tracking-widest uppercase italic">Syncing</span>
      </div>
    );
    return val ?? fallback;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-1000">
      <DashboardCard
        title="Active Dispatches"
        count={renderValue(stats?.active_dispatches)}
        icon={Zap}
        variant="accent"
      />

      <DashboardCard
        title="Gross Earnings"
        count={renderValue(stats ? formatKES(stats.gross_earnings) : null, "KES 0")}
        icon={Wallet}
        variant="dark"
      />

      <DashboardCard
        title="Total Success"
        count={renderValue(stats?.total_success)}
        icon={CheckCircle2}
        variant="default"
      />

      <DashboardCard
        title="Registry Rating"
        count={renderValue(
          stats?.registry_rating ? Number(stats.registry_rating).toFixed(1) : null, 
          "5.0"
        )}
        icon={Star} 
        variant="default"
      />
    </div>
  );
};

export default NurseStats;
