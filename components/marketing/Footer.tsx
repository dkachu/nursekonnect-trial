"use client";

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-zinc-100 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <span className="font-black text-sm uppercase tracking-tighter text-zinc-900">
            NurseKonnekt
          </span>
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
            © {currentYear} ALL RIGHTS RESERVED
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href="https://x.com/dkachu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
          >
            CONNECT VIA X
          </a>
        </div>

      </div>
    </footer>
  );
}
