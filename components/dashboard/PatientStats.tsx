"use client";

import React from "react";
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

export default function PatientStats({ stats, loading }: PatientStatsProps) {
  
  const renderValue = (val: number | undefined) => {
    if (loading) {
      return "SYNCING...";
    }
    return val ?? 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard 
        title="Total Care Sessions" 
        count={renderValue(stats?.total_care_sessions)} 
        variant="default" 
      />
      <DashboardCard 
        title="Active Requests" 
        count={renderValue(stats?.active_requests)} 
        variant="accent" 
      />
      <DashboardCard 
        title="Pending Reviews" 
        count={renderValue(stats?.pending_reviews)} 
        variant="dark" 
      />
    </div>
  );
}
