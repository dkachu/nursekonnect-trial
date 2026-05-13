"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Loader2, ArrowLeft, ShieldAlert, Stethoscope, MapPin, Clock, ShieldCheck, Zap } from "lucide-react";
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
      // FIXED: Cleared validation cascade inside conditional exit branches
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">authorising portfolio...</p>
    </div>
  );

  if (!nurseData) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8 bg-zinc-50 px-6 text-center">
       <ShieldAlert size={48} className="text-destructive" />
       <h2 className="text-3xl font-black uppercase tracking-tighter italic">Portfolio Offline</h2>
       <Button 
         onClick={() => router.push('/dashboard')} 
         variant="outline" 
         className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest border-2"
       >
         Return to discovery
       </Button>
    </div>
  );

  const displayName = (nurseData?.user_details?.email || "Professional").split('@')[0];

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-12 animate-in fade-in duration-1000 min-h-screen">
      <button 
        onClick={() => router.back()} 
        className="group flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-primary transition-all uppercase tracking-[0.2em] mb-12 italic"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        discovery mode
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white p-10 md:p-20 rounded-[4.5rem] border border-zinc-100 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-28 h-28 bg-zinc-950 rounded-[2.2rem] flex items-center justify-center text-5xl font-black text-white italic shadow-2xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-blue-50 text-primary px-5 py-2 rounded-full border border-blue-100 w-fit">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Profile</span>
                  </div>
                  <h1 className="text-6xl font-black text-zinc-900 tracking-tighter uppercase leading-none italic">
                    {displayName}
                  </h1>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] italic">Clinical Designation</p>
                 <p className="text-primary font-black text-4xl uppercase flex items-baseline gap-4 italic tracking-tighter">
                   <Stethoscope size={36} /> 
                   {nurseData?.specialization?.replace('_', ' ') || "General"} Specialist
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Service Zone</p>
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">
                      {nurseData?.town || "Verified Registry"}
                    </p>
                  </div>
                </div>
                
                <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-primary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Tenure</p>
                    <p className="text-lg font-black text-zinc-900 uppercase tracking-tighter italic">
                      {nurseData?.years_of_experience || 0} Years Exp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {!nurseData?.is_verified ? (
            <NCKVerifyBridge licenseNumber={nurseData?.license_number} />
          ) : (
            <div className="bg-zinc-950 p-8 rounded-[3rem] border border-zinc-800 flex items-center gap-5 shadow-2xl">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-primary italic">NCK Authenticated</div>
            </div>
          )}

          <div className="bg-zinc-950 p-10 rounded-[3.5rem] shadow-2xl space-y-8 border border-zinc-800 sticky top-28">
            <div className="text-center space-y-2">
              <h3 className="text-white text-3xl font-black uppercase tracking-tighter italic">Hire Console</h3>
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em] italic">Instant protocol handshake</p>
            </div>

            <Button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full h-24 rounded-[2rem] bg-primary hover:bg-white hover:text-zinc-900 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl italic flex flex-col gap-1 transition-all active:scale-95 border-none"
            >
                <Zap size={20} className="fill-current" />
                Initiate Deployment
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
