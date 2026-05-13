"use client";

import React from "react";
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

export default function NurseStats({ stats, loading }: NurseStatsProps) {
  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const renderValue = (val: string | number | null | undefined, fallback: string | number = "0") => {
    if (loading) {
      return "SYNCING...";
    }
    return val ?? fallback;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard
        title="Active Dispatches"
        count={renderValue(stats?.active_dispatches)}
        variant="accent"
      />

      <DashboardCard
        title="Gross Earnings"
        count={renderValue(stats ? formatKES(stats.gross_earnings) : null, "KES 0")}
        variant="dark"
      />

      <DashboardCard
        title="Total Success"
        count={renderValue(stats?.total_success)}
        variant="default"
      />

      <DashboardCard
        title="Registry Rating"
        count={renderValue(
          stats?.registry_rating ? Number(stats.registry_rating).toFixed(1) : null, 
          "5.0"
        )}
        variant="default"
      />
    </div>
  );
}
