"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
// FIXED: Adjusted string import casing to target standard Navbar file objects precisely
import Navbar from './Navbar'; 

export default function NavBarContainer() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FIXED: Standard loading skeleton layout matches structural height properties precisely
  if (!mounted || loading) {
    return (
      <nav className="bg-background sticky top-0 z-[100] w-full h-24 border-b border-zinc-100 flex items-center select-none">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
              INITIALIZING HANDSHAKE...
            </span>
          </div>
          <div className="px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
              SYNCING...
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-[100] w-full border-b border-zinc-100 h-24 flex items-center transition-all duration-200">
      <Navbar 
        loggedinuser={user} 
        currentPath={pathname} 
        isLoading={loading}
      />
    </header>
  );
}
