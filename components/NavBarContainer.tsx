"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import NavBar from './Navbar';
import { Loader2 } from "lucide-react";

const NavBarContainer = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Schedule state change to prevent synchronous lifecycle trigger breaks
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted || loading) {
    return (
      <nav className="bg-background sticky top-0 z-[100] w-full h-24 border-b border-border flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
             <div className="h-5 w-32 bg-muted animate-pulse rounded-lg" />
          </div>
          
          <div className="flex items-center gap-8">
             <div className="hidden md:flex gap-6">
                <div className="h-2 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-2 w-16 bg-muted animate-pulse rounded-full" />
             </div>
             
             <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm animate-pulse">
                <Loader2 className="animate-spin text-primary/60" size={14} />
                <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest italic leading-none">
                    Syncing...
                </span>
             </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-[100] w-full border-b border-border transition-all duration-700 h-24 flex items-center">
      <NavBar 
        loggedinuser={user} 
        currentPath={pathname} 
        isLoading={loading}
      />
    </header>
  );
}

export default NavBarContainer
