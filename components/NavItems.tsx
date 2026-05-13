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
}

export default function NavItems({ mobile, loggedinuser }: Props) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const linkStyle = "text-[10px] font-black uppercase tracking-widest flex items-center transition-colors";

  return (
    <div className={cn(
      "flex items-center gap-8",
      mobile ? "flex-col w-full items-start gap-6" : "flex-row"
    )}>
      {loggedinuser ? (
        <>
          <div className={cn(
            "flex gap-8", 
            mobile ? "flex-col w-full border-b pb-6" : "flex-row items-center"
          )}>
            {loggedinuser.is_nurse && (
              <>
                <Link href="/profile" className={cn(
                  linkStyle, 
                  isActive("/profile") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-900"
                )}>
                  DEPLOYMENT HUB
                </Link>
                <Link href="/setup" className={cn(
                  linkStyle, 
                  isActive("/setup") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-900"
                )}>
                  CREDENTIALS
                </Link>
              </>
            )}

            {loggedinuser.is_patient && (
              <>
                <Link href="/dashboard" className={cn(
                  linkStyle, 
                  isActive("/dashboard") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-900"
                )}>
                  CARE REGISTRY
                </Link>
                <Link href="/nurses/nearby" className={cn(
                  linkStyle, 
                  isActive("/nurses/nearby") ? "text-blue-600" : "text-zinc-400 hover:text-zinc-900"
                )}>
                  SERVICE DISCOVERY
                </Link>
              </>
            )}
          </div>

          <div className={cn(
            "flex items-center gap-6", 
            mobile ? "w-full justify-between pt-2" : "ml-4"
          )}>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-zinc-900 uppercase">
                {loggedinuser.email ? loggedinuser.email.split('@')[0] : "AUTHORIZED"}
              </span>
              <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider mt-1">
                {loggedinuser.is_nurse ? "PROFESSIONAL LEDGER" : "RECIPIENT"}
              </span>
            </div>

            <button 
              onClick={() => logout()} 
              className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors border-none cursor-pointer bg-transparent",
                mobile ? "bg-zinc-950 text-white h-12 w-full rounded-xl hover:bg-zinc-900" : "text-zinc-400 hover:text-red-600"
              )}
            >
              TERMINATE SESSION
            </button>
          </div>
        </>
      ) : (
        <Link href="/login" className={mobile ? "w-full" : "ml-4"}>
          <button className={cn(
            "bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-colors hover:bg-zinc-950 border-none cursor-pointer",
            mobile ? "w-full h-14 rounded-xl" : "h-11 px-8 rounded-lg"
          )}>
            REGISTRY LOGIN
          </button>
        </Link>
      )}
    </div>
  );
}
