"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Loader2, ShieldCheck, User } from "lucide-react"; 
import NavItems from "./NavItems";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

/**
 * NURSEKONNEKT MOBILE GATEWAY
 * Responsive navigation interface with identity verification pulse.
 */
const MobileNavbar = () => {
  const { user, loading, isNurse } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-muted rounded-xl transition-all active:scale-90" aria-label="Open Navigation">
          <Menu className="w-8 h-8 text-foreground" />
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] border-none shadow-2xl bg-background flex flex-col p-0">
        <div className="p-6 flex flex-col h-full">
          {/* 1. Registry Branded Header */}
          <SheetHeader className="border-b pb-6 text-left space-y-4">
            <SheetTitle className="font-black text-2xl tracking-tighter text-primary uppercase leading-none italic">
              NURSE<span className="text-foreground not-italic">KONNEKT</span>
            </SheetTitle>
            
            <div className="flex flex-col gap-2">
              <SheetDescription className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic leading-none">
                {loading ? "Decrypting registry..." : "Access gateway active"}
              </SheetDescription>

              {/* Dynamic Identity Badge: Reflects role-specific status */}
              {!loading && user && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit transition-all duration-500",
                  isNurse ? "bg-blue-50 border-blue-100 text-primary" : "bg-zinc-50 border-zinc-100 text-zinc-600"
                )}>
                  {isNurse ? <ShieldCheck size={10} /> : <User size={10} />}
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {isNurse ? "Verified Professional" : "Care Recipient"}
                  </span>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* 2. Navigation Ledger Zone */}
          <div className="flex-grow py-8 overflow-y-auto scrollbar-hide">
              {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="animate-spin text-primary" size={28} />
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse italic">
                          Synchronising...
                      </p>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      <NavItems loggedinuser={user} mobile />
                  </div>
              )}
          </div>

          {/* 3. Protocol Information Footer */}
          <div className="mt-auto border-t pt-6 pb-4">
              <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] italic">
                      Registry v1.0
                  </p>
                  <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[8px] font-bold text-zinc-400 uppercase italic">
                          Secure Handshake Active
                      </p>
                  </div>
              </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
