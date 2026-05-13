"use client";

import React from "react";
import Link from "next/link";
import NavItems from "./NavItems";
import MobileNavbar from "./MobileNavbar";
import { Loader2, Activity } from "lucide-react";

interface UserPayload {
  id: number;
  email: string;
  phone_number?: string;
  is_nurse: boolean;
  is_patient: boolean;
}

interface UserProps {
  loggedinuser: UserPayload | null;
  currentPath?: string;
  isLoading: boolean;
}

const NavBar = ({ loggedinuser, isLoading }: UserProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
      <Link href="/" className="group flex items-center gap-3">
        <div className="bg-primary p-2 rounded-xl shadow-lg group-hover:rotate-12 transition-all duration-500">
          <Activity size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none italic group-hover:text-primary transition-colors duration-500">
          Nurse<span className="not-italic">Konnekt</span>
        </h1>
      </Link>

      <div className="flex items-center gap-6">
        {isLoading ? (
          <div className="flex items-center gap-3 px-5 py-3 bg-muted rounded-2xl border border-border shadow-inner animate-pulse">
            <Loader2 className="animate-spin text-primary" size={14} />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic leading-none">
              Registry Handshake
            </span>
          </div>
        ) : (
          <>
            <nav className="hidden md:block">
              <NavItems loggedinuser={loggedinuser} />
            </nav>
            <div className="md:hidden">
              <MobileNavbar />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
