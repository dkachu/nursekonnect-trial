"use client";

import React from 'react';
import Link from 'next/link';

/**
 * NURSEKONNEKT REGISTRY FOOTER
 * Finalizes the application layout with legal and social handshakes.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-6 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <span className="font-black text-sm uppercase tracking-tighter italic text-foreground">
            NurseKonnekt
          </span>
          <span className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] italic hidden sm:block">
            © {currentYear} ALL RIGHTS RESERVED. AMALEKITES GROUP.
          </span>
        </div>

        {/* Identity Handshake: Social Bridge */}
        <Link 
          href="https://x.com/dkachu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 hover:bg-zinc-950 rounded-2xl transition-all duration-300 group border border-transparent hover:border-zinc-800"
          aria-label="X (Twitter)"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            className="fill-zinc-400 group-hover:fill-primary transition-colors"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>

      </div>
    </footer>
  );
};

export default Footer;
