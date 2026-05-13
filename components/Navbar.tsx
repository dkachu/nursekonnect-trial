"use client";

import React from "react";
import Link from "next/link";
import NavItems from "./NavItems";
import MobileNavbar from "./MobileNavbar";

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

export default function NavBar({ loggedinuser, isLoading }: UserProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">
          NURSEKONNEKT
        </h1>
      </Link>

      <div className="flex items-center gap-6">
        {isLoading ? (
          <div className="px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
              SYNCING...
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
}
