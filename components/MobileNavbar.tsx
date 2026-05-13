"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import NavItems from "./NavItems";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function MobileNavbar() {
  const { user, loading, isNurse } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-zinc-50 rounded-xl" aria-label="Open Navigation">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-900">MENU</span>
        </button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-[300px] border-none shadow-xl bg-background flex flex-col p-0">
        <div className="p-6 flex flex-col h-full">
          <SheetHeader className="border-b pb-6 text-left space-y-2">
            <SheetTitle className="font-black text-xl tracking-tighter text-zinc-900 uppercase">
              NURSEKONNEKT
            </SheetTitle>
            
            <div className="flex flex-col gap-2">
              <SheetDescription className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                {loading ? "AUTHENTICATING..." : "SESSION SECURE"}
              </SheetDescription>

              {!loading && user && (
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest w-fit",
                  isNurse ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-zinc-50 border-zinc-100 text-zinc-600"
                )}>
                  {isNurse ? "PROFESSIONAL LEDGER" : "RECIPIENT"}
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="flex-grow py-6 overflow-y-auto">
              {loading ? (
                  <div className="text-center py-12 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      SYNCHRONISING...
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      <NavItems loggedinuser={user} mobile />
                  </div>
              )}
          </div>

          <div className="mt-auto border-t pt-4">
              <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      REGISTRY SYSTEM STATUS
                  </p>
                  <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wide">
                      HANDSHAKE GATEWAY ONLINE
                  </p>
              </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
