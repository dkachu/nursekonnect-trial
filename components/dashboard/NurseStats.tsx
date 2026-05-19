"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface StatsData {
  validation_rank: string;
  broadcast_status: string;
  assigned_shifts: string;
  node_engagement: string;
  is_online: boolean;
  is_available: boolean;
}

export default function NurseStats() {
  const [metrics, setMetrics] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronises real-time summary statistics from the Django dashboard engine
  const fetchNurseTelemetryStats = useCallback(async () => {
    try {
      const res = await api.get("accounts/profile/me/");
      const profile = res.data?.profile || {};
      
      const isOnline = !!profile.is_online;
      const isAvailable = !!profile.is_available;

      // Extract structural backend statistics safely with zero aggregation errors
      const activeCount = profile.active_bookings_count ?? profile.bookings_count ?? 0;
      const engagementScore = profile.response_rating ?? profile.engagement_score ?? 100;

      setMetrics({
        validation_rank: profile.is_verified ? "NCK Certified" : "Pending Audit",
        broadcast_status: isOnline && isAvailable ? "On-Call" : "Off-Duty",
        assigned_shifts: `${activeCount} Active`,
        node_engagement: `${engagementScore}%`,
        is_online: isOnline,
        is_available: isAvailable,
      });
    } catch (err) {
      console.error("Failed to recover practitioner metrics console:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNurseTelemetryStats();
  }, [fetchNurseTelemetryStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-solid border-zinc-200 bg-white p-6 rounded-2xl shadow-sm h-32 animate-pulse flex flex-col justify-between" />
        ))}
      </div>
    );
  }

  const telemetryMetrics = [
    { 
      title: "Validation Rank", 
      value: metrics?.validation_rank || "Pending Audit", 
      subtitle: metrics?.validation_rank === "NCK Certified" ? "Active License" : "Verification Pending", 
      bg: metrics?.validation_rank === "NCK Certified" ? "bg-blue-500" : "bg-amber-500" 
    },
    { 
      title: "Broadcast Status", 
      value: metrics?.broadcast_status || "Off-Duty", 
      subtitle: metrics?.broadcast_status === "On-Call" ? "Visible to Patients" : "Hidden from Map", 
      bg: metrics?.broadcast_status === "On-Call" ? "bg-emerald-500" : "bg-zinc-400" 
    },
    { 
      title: "Assigned Shifts", 
      value: metrics?.assigned_shifts || "0 Active", 
      subtitle: metrics?.assigned_shifts?.startsWith("0") ? "Perimeter Clear" : "Dispatch Pipeline Active", 
      bg: metrics?.assigned_shifts?.startsWith("0") ? "bg-zinc-400" : "bg-blue-600" 
    },
    { 
      title: "Node Engagement", 
      value: metrics?.node_engagement || "100%", 
      subtitle: "Response Rating", 
      bg: "bg-purple-500" 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans select-none">
      {telemetryMetrics.map((stat, i) => (
        <div key={i} className="border border-solid border-zinc-200 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{stat.title}</span>
            <span className={`h-2 w-2 rounded-full ${stat.bg}`} />
          </div>
          <div>
            <h4 className="text-xl font-black text-zinc-900 tracking-tight mb-0.5">{stat.value}</h4>
            <p className="text-[11px] font-medium text-zinc-500">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
