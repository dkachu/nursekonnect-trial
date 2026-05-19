"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { NurseProfile } from "@/types/nurse";
import NurseCard from "@/components/dashboard/NurseCard";
import { useRegistrySync } from "@/hooks/useRegistrySync";
import { toast } from "sonner";

// IMPORT YOUR NEW COMPONENTS CLEANLY HERE
import PatientInvoiceCard from "@/components/dashboard/PatientInvoiceCard";
import PatientHistoryGrid from "@/components/dashboard/PatientHistoryGrid";
import PatientReviewModal from "@/components/dashboard/PatientReviewModal";

// ... keep your existing interfaces exactly as they are ...

export default function PatientDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [nurses, setNurses] = useState<NurseProfile[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]); // Tracks global bookings for billing/history
  const [loading, setLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  // Sync all user bookings to populate invoices and historical tables
  const fetchUserBookingsMatrix = useCallback(async () => {
    try {
      const res = await api.get("bookings/active/");
      setAllBookings(res.data || []);
    } catch (err) {
      console.error("Booking matrix sync failure:", err);
    }
  }, []);

  const handleIncomingTelemetryUpdate = useCallback(() => {
    // ... keep your existing geolocation nurse polling logic here ...
    fetchUserBookingsMatrix();
  }, [fetchUserBookingsMatrix]);

  const { sendWebSocketMessage } = useRegistrySync({
    onNewDispatch: handleIncomingTelemetryUpdate
  });

  // ... keep your existing fetchNearbyNurses and useEffect blocks here ...

  // Separate active unpaid bills from completed logs
  const outstandingInvoices = allBookings.filter(b => b.status === "completed" && !b.is_paid_out);

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-16 min-h-screen font-sans bg-white select-none">
      {/* ... keep your existing header and identity summary panels here ... */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Medical profile summary column */}
        <div className="lg:col-span-1 space-y-8">
          {/* ... keep your Identity Overview and Critical Medical Profile sections here ... */}
          
          {/* LIVE BILLING BLOCK: Displays active unpaid invoices to patient */}
          {outstandingInvoices.map((invoice) => (
            <PatientInvoiceCard 
              key={invoice.id} 
              booking={invoice} 
              onSettlementSuccess={() => {
                fetchUserBookingsMatrix();
                setSelectedReviewId(invoice.id); // Open review sheet directly on payment clear
              }}
            />
          ))}
        </div>

        {/* Right Side: Care allocations queue and history tables */}
        <div className="lg:col-span-2 space-y-12">
          {/* ... keep your Available Emergency Clinician Providers Nearby list layout here ... */}

          {/* HISTORICAL REGISTRY GRID LAYER */}
          <PatientHistoryGrid logs={allBookings} />
        </div>
      </div>

      {/* FLOATING REVIEW INTERFACES */}
      <PatientReviewModal 
        bookingId={selectedReviewId || 0}
        isOpen={selectedReviewId !== null}
        onClose={() => setSelectedReviewId(null)}
        onSuccess={fetchUserBookingsMatrix}
      />
    </main>
  );
}
