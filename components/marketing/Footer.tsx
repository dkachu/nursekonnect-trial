"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-50 border-t border-solid border-zinc-100 py-8 select-none font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          © 2026 NurseKonnect 
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300">
          NurseKonnect Kenya. Secure
        </p>
      </div>
    </footer>
  );
}
