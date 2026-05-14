"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface UserPayload {
  id: number;
  email: string;
  phone_number?: string;
  is_nurse: boolean;
  is_patient: boolean;
}

interface Props {
  mobile?: boolean;
  loggedinuser: UserPayload | null;
  currentPath?: string; // FIXED: Explicitly declared to handle parameter inputs from Navbar safely
  onActionComplete?: () => void; 
}

export default function NavItems({ mobile, loggedinuser, onActionComplete }: Props) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const linkStyle = "text-[10px] font-black uppercase tracking-widest flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md py-1 px-2";

  const handleLogout = async () => {
    if (onActionComplete) onActionComplete();
    await logout();
  };

  return (
    <div className={cn(
      "flex items-center gap-8 font-sans",
      mobile ? "flex-col w-full items-start gap-8" : "flex-row"
    )}>
      {loggedinuser ? (
        <>
          {/* Dynamic Role-Bound Tab Matrix Section */}
          <div className={cn(
            "flex gap-8", 
            mobile ? "flex-col w-full border-b border-dashed border-zinc-100 pb-6" : "flex-row items-center"
          )}>
            {loggedinuser.is_nurse && (
              <>
                <Link 
                  href="/profile" 
                  onClick={() => onActionComplete?.()}
                  className={cn(
                    linkStyle, 
                    isActive("/profile") ? "text-blue-600 bg-blue-50/50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  DEPLOYMENT HUB
                </Link>
                <Link 
                  href="/setup" 
                  onClick={() => onActionComplete?.()}
                  className={cn(
                    linkStyle, 
                    isActive("/setup") ? "text-blue-600 bg-blue-50/50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  CREDENTIALS
                </Link>
              </>
            )}

            {loggedinuser.is_patient && (
              <>
                <Link 
                  href="/dashboard" 
                  onClick={() => onActionComplete?.()}
                  className={cn(
                    linkStyle, 
                    isActive("/dashboard") ? "text-blue-600 bg-blue-50/50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  CARE REGISTRY
                </Link>
                <Link 
                  href="/nurses/nearby" 
                  onClick={() => onActionComplete?.()}
                  className={cn(
                    linkStyle, 
                    isActive("/nurses/nearby") ? "text-blue-600 bg-blue-50/50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  SERVICE DISCOVERY
                </Link>
              </>
            )}
          </div>

          {/* Connected User Account Identity Section */}
          <div className={cn(
            "flex items-center gap-6", 
            mobile ? "flex-col w-full items-start gap-4 pt-2" : "ml-4"
          )}>
            <div className="flex flex-col text-left px-2">
              <span className="text-xs font-black text-zinc-900 uppercase tracking-tight truncate max-w-[180px]">
                {loggedinuser.email ? loggedinuser.email.split('@')[0] : "AUTHORIZED"}
              </span>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                {loggedinuser.is_nurse ? "PROFESSIONAL LEDGER" : "RECIPIENT MATRIX"}
              </span>
            </div>

            <div className={mobile ? "w-full pt-2" : ""}>
              <button 
                type="button"
                onClick={handleLogout} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-none cursor-pointer bg-transparent",
                  mobile 
                    ? "bg-zinc-950 text-white h-14 w-full rounded-2xl hover:bg-red-600 font-black flex items-center justify-center shadow-lg focus-visible:ring-red-600" 
                    : "text-zinc-400 hover:text-red-600 focus-visible:ring-red-600 rounded-md px-2 py-1"
                )}
              >
                TERMINATE SESSION
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={mobile ? "w-full pt-4" : "ml-4"}>
          <Link href="/login" onClick={() => onActionComplete?.()} className="block w-full no-underline">
            <button 
              type="button"
              className={cn(
                "bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-950 border-none cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                mobile ? "w-full h-16 rounded-2xl" : "h-12 px-8 rounded-xl"
              )}
            >
              REGISTRY LOGIN
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
