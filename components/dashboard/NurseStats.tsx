"use client";

import React from "react";
import { ShieldCheck, Radio, Activity, Clock } from "lucide-react";

export default function NurseStats() {
  const telemetryMetrics = [
    { title: "Validation Rank", value: "NCK Certified", subtitle: "Active License", icon: ShieldCheck, color: "text-blue-600" },
    { title: "Broadcast Status", value: "On-Call", subtitle: "Visible to Patients", icon: Radio, color: "text-emerald-500" },
    { title: "Assigned Shifts", value: "0 Active", subtitle: "Perimeter Clear", icon: Activity, color: "text-zinc-500" },
    { title: "Node Engagement", value: "100%", subtitle: "Response Rating", icon: Clock, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans select-none">
      {telemetryMetrics.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="border border-solid border-zinc-200 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{stat.title}</span>
              <Icon size={16} className={`${stat.color}`} />
            </div>
            <div>
              <h4 className="text-xl font-black text-zinc-900 tracking-tight mb-0.5">{stat.value}</h4>
              <p className="text-[11px] font-medium text-zinc-500">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
