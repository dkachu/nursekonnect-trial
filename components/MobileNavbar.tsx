"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavItems from "./NavItems";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface UserPayload {
  id: number;
  email: string;
  phone_number?: string;
  is_nurse: boolean;
  is_patient: boolean;
}

interface MobileNavbarProps {
  loggedinuser: UserPayload | null;
  currentPath?: string;
}

export default function MobileNavbar({ loggedinuser, currentPath }: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLoading = loggedinuser === undefined; // Resolves sync loading states local to active context

  const closeDrawer = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          type="button"
          className="p-2 hover:bg-zinc-50 active:scale-95 rounded-xl border-none bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all" 
          aria-label="Open Mobile Menu Navigation"
        >
          <span className="text-xs font-black uppercase tracking-widest text-zinc-900">MENU</span>
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] border-none shadow-2xl bg-white flex flex-col p-0 focus-visible:outline-none z-[150]">
        <div className="p-6 flex flex-col h-full font-sans select-none">
          
          {/* Core Branding Status Header */}
          <SheetHeader className="border-b border-dashed border-zinc-100 pb-6 text-left space-y-2">
            <SheetTitle className="font-black text-xl tracking-tighter text-zinc-900 uppercase italic leading-none">
              NURSEKONNEKT
            </SheetTitle>
            
            <div className="flex flex-col gap-2">
              <SheetDescription className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                {isLoading ? "AUTHENTICATING SECTORS..." : "SESSION HANDSHAKE SECURE"}
              </SheetDescription>

              {!isLoading && loggedinuser && (
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest w-fit select-none",
                  loggedinuser.is_nurse ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-zinc-50 border-zinc-100 text-zinc-600"
                )}>
                  {loggedinuser.is_nurse ? "PROFESSIONAL LEDGER" : "RECIPIENT MATRIX"}
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Dynamic Navigation Action List */}
          <div className="flex-grow py-6 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                  <div className="text-center py-12 text-xs font-black text-zinc-300 uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
                      <Loader2 size={12} className="animate-spin text-blue-600" />
                      <span>SYNCHRONISING INTERFACES...</span>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      {/* FIXED: Passed parent parameters alongside action hooks to enforce clean drawer shutdowns */}
                      <NavItems 
                        loggedinuser={loggedinuser} 
                        mobile 
                        onActionComplete={closeDrawer}
                      />
                  </div>
              )}
          </div>

          {/* Infrastructure Metrics Footer Component */}
          <div className="mt-auto border-t border-dashed border-zinc-100 pt-4 select-none">
              <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                      REGISTRY SYSTEM AUDIT STATUS
                  </p>
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wide leading-none">
                          TLS 1.3 LINKWAY ONLINE
                      </p>
                  </div>
              </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
