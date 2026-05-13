"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/dashboard/BookingModal";
import NCKVerifyBridge from "@/components/dashboard/NCKVerifyBridge"; 

interface NurseData {
  id: number;
  specialization: string;
  years_of_experience: number;
  town: string;
  building: string;
  license_number?: string;
  is_verified?: boolean;
  user_details?: {
    email: string;
  };
}

export default function NurseDetailPage() {
  const params = useParams();
  const routeId = params?.id; 
  const router = useRouter();
  
  const [nurseData, setNurseData] = useState<NurseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (!routeId || routeId === "nearby" || routeId === "undefined") {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchNurse = async () => {
      try {
        const res = await api.get(`accounts/nurses/${routeId}/`);
        const extractedData = res.data.properties ? res.data.properties : res.data;
        setNurseData(extractedData);
      } catch {
        setNurseData(null);
        console.error("Professional Registry Sync Failure");
      } finally {
        setLoading(false);
      }
    };
    fetchNurse();
  }, [routeId]);

  if (routeId === "nearby") return null;

  if (loading) return <div className="text-center p-12 text-zinc-400 font-bold text-xs">SYNCHRONISING...</div>;

  if (!nurseData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center">
         <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900">Portfolio Offline</h2>
         <Button 
           onClick={() => router.push('/dashboard')} 
           className="rounded-xl h-12 px-6 font-black uppercase text-xs tracking-widest bg-zinc-950 text-white border-none"
         >
           RETURN TO DISCOVERY
         </Button>
      </div>
    );
  }

  const displayName = (nurseData?.user_details?.email || "Professional").split('@')[0];

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 min-h-screen space-y-8">
      <button 
        onClick={() => router.back()} 
        className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
      >
        BACK TO DISCOVERY
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">CLINICAL PORTFOLIO</span>
                <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight mt-1">
                  {displayName}
                </h1>
              </div>
            </div>

            <div className="space-y-1">
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Clinical Designation</p>
               <p className="text-zinc-900 font-black text-xl uppercase tracking-tight">
                 {nurseData?.specialization?.replace('_', ' ') || "General"} Specialist
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Service Zone</p>
                <p className="text-sm font-black text-zinc-800 uppercase tracking-tight">
                  {nurseData?.town || "Verified Registry"}
                </p>
              </div>
              
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Clinical Experience</p>
                <p className="text-sm font-black text-zinc-800 uppercase tracking-tight">
                  {nurseData?.years_of_experience || 0} Years Active Practice
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {!nurseData?.is_verified ? (
            <NCKVerifyBridge licenseNumber={nurseData?.license_number} />
          ) : (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">NCK AUTHENTICATED</div>
            </div>
          )}

          <div className="bg-zinc-950 p-6 rounded-2xl shadow-xl space-y-4 border border-zinc-800">
            <div className="text-center space-y-1">
              <h3 className="text-white text-lg font-black uppercase tracking-tight">Dispatch Console</h3>
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Instant verification handshake</p>
            </div>

            <Button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-white hover:text-zinc-900 text-white font-black text-xs uppercase tracking-widest border-none"
            >
                INITIATE DISPATCH REQUEST
            </Button>
          </div>
        </div>
      </div>

      <BookingModal 
        nurseId={nurseData?.id}
        nurseName={displayName}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </main>
  );
}
