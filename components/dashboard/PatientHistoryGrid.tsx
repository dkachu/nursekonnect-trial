"use client";

import React from "react";

interface HistoricLogItem {
  id: number;
  scheduled_date: string;
  service_description: string;
  status: string;
  nurse_name: string;
  price: string;
}

interface HistoryGridProps {
  logs: HistoricLogItem[];
}

export default function PatientHistoryGrid({ logs }: HistoryGridProps) {
  const finalHistoricalEntries = logs.filter((log) => 
    ["completed", "cancelled", "declined"].includes(log.status)
  );

  return (
    <div className="border border-solid border-zinc-200 rounded-2xl bg-white p-6 shadow-sm font-sans select-none space-y-4">
      <div className="border-b border-solid border-zinc-100 pb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
          Historical Patient Treatment & Care Logs
        </h3>
      </div>

      {finalHistoricalEntries.length === 0 ? (
        <div className="py-8 border border-dashed border-zinc-100 bg-zinc-50/50 rounded-xl text-center text-zinc-400 font-bold text-xs italic">
          No terminated care records index parameters detected within this recipient profile track.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-solid border-zinc-200 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                <th className="pb-3 pr-4">Log Key</th>
                <th className="pb-3 pr-4">Practitioner Unit</th>
                <th className="pb-3 pr-4">Clinical Overview</th>
                <th className="pb-3 pr-4 text-right">Ledger Settle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-solid divide-zinc-100 text-xs font-bold text-zinc-700">
              {finalHistoricalEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-zinc-400">#NK-{entry.id}</td>
                  <td className="py-3 pr-4 uppercase text-zinc-900">{entry.nurse_name}</td>
                  <td className="py-3 pr-4 text-zinc-500 font-medium italic truncate max-w-[220px]">
                    "{entry.service_description}"
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      entry.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
