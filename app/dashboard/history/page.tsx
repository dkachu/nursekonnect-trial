"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppointmentsList from "@/components/dashboard/AppointmentsList";

interface HistoricalBooking {
  id: number;
  patient_email?: string;
  scheduled_date: string;
  status: string;
  service_description: string;
  service_location?: string;
}

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<HistoricalBooking[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const res = await api.get("bookings/");
        setAppointments(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch { 
        console.error("Archive Load Failed"); 
      }
    };
    loadRecords();
  }, []);

  const exportToCSV = () => {
    if (appointments.length === 0) return;
    
    const headers = ["Handshake_ID,Patient,Date,Status,Requirements,Location"];
    const rows = appointments.map(apt => [
      apt.id,
      apt.patient_email || "N/A",
      new Date(apt.scheduled_date).toLocaleDateString('en-KE'),
      apt.status,
      `"${(apt.service_description || '').replace(/"/g, '""')}"`,
      `"${(apt.service_location || 'N/A').replace(/"/g, '""')}"`
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `NurseKonnect_Records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-zinc-100 pb-12">
        <div className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-blue-600 transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.4est] italic">Dashboard Center</span>
          </Link>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-zinc-900 leading-none">
            Registry Archive
          </h1>
        </div>

        <Button 
          onClick={exportToCSV} 
          variant="outline" 
          className="rounded-2xl h-16 px-10 border-2 border-zinc-100 font-black text-[10px] uppercase tracking-widest gap-3 hover:bg-zinc-950 hover:text-white transition-all active:scale-95 italic shadow-sm"
        >
          <Download size={16} /> Export Records (.CSV)
        </Button>
      </header>

      <div className="space-y-6">
        <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-[2.5rem] flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <FileText className="text-zinc-400" size={20} />
          </div>
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">
            Deployment Ledger Logs
          </p>
        </div>
        
        <AppointmentsList isNurse={true} useActiveOnly={false} />
      </div>
    </main>
  );
}
