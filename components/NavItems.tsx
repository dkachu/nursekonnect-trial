"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  LogOut, 
  Navigation,
  ShieldCheck,
  LayoutDashboard,
  Activity
} from "lucide-react";

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

const NavItems = ({ mobile, loggedinuser }: Props) => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const linkStyle = "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all duration-300 italic";

  return (
    <div className={cn(
      "flex items-center gap-8",
      mobile ? "flex-col w-full items-start gap-6" : "flex-row"
    )}>
      
      {loggedinuser ? (
        <>
          <div className={cn(
            "flex gap-8", 
            mobile ? "flex-col w-full border-b pb-8" : "flex-row items-center"
          )}>
            {loggedinuser.is_nurse && (
              <>
                <Link href="/profile" className={cn(
                  linkStyle, 
                  isActive("/profile") ? "text-primary" : "text-zinc-400 hover:text-foreground"
                )}>
                  <LayoutDashboard size={15} /> Deployment Hub
                </Link>
                <Link href="/setup" className={cn(
                  linkStyle, 
                  isActive("/setup") ? "text-primary" : "text-zinc-400 hover:text-foreground"
                )}>
                  <ShieldCheck size={15} /> Credentials
                </Link>
              </>
            )}

            {loggedinuser.is_patient && (
              <>
                <Link href="/dashboard" className={cn(
                  linkStyle, 
                  isActive("/dashboard") ? "text-primary" : "text-zinc-400 hover:text-foreground"
                )}>
                  <Activity size={15} /> Care Registry
                </Link>
                <Link href="/nurses/nearby" className={cn(
                  linkStyle, 
                  isActive("/nurses/nearby") ? "text-primary" : "text-zinc-400 hover:text-foreground"
                )}>
                  <Navigation size={15} /> Service Discovery
                </Link>
              </>
            )}
          </div>

          <div className={cn(
            "flex items-center gap-5", 
            mobile ? "w-full justify-between pt-4" : "ml-4"
          )}>
            {!mobile && <div className="h-5 w-[1.5px] bg-border rotate-[20deg]" />}
            
            <div className="flex flex-col text-left md:text-right">
              <span className="text-[11px] font-black text-foreground leading-none uppercase tracking-tighter italic">
                {loggedinuser.email ? loggedinuser.email.split('@')[0] : "Authorized"}
              </span>
              <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5 flex items-center md:justify-end gap-1">
                {loggedinuser.is_nurse ? "Verified Professional" : "Care Recipient"}
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              </span>
            </div>

            <button 
              onClick={() => logout()} 
              className={cn(
                "p-3 rounded-2xl transition-all active:scale-95 border",
                mobile 
                  ? "bg-zinc-950 text-white flex items-center gap-3 px-8 py-5 w-full justify-center border-zinc-800" 
                  : "hover:bg-muted text-zinc-400 hover:text-destructive border-border"
              )}
              aria-label="Terminate Session"
            >
              <LogOut size={18} />
              {mobile && <span className="font-black uppercase text-[10px] tracking-widest italic">Terminate Session</span>}
            </button>
          </div>
        </>
      ) : (
        <Link href="/login" className={mobile ? "w-full" : "ml-4"}>
          <button className={cn(
            "bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-950 active:scale-95 shadow-xl italic border-none",
            mobile ? "w-full py-6 rounded-3xl" : "px-10 py-4 rounded-2xl"
          )}>
            Registry Login
          </button>
        </Link>
      )}
    </div>
  );
};

export default NavItems;
