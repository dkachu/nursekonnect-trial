"use client";

import * as React from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, children }: SheetProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex justify-end">{children}</div>;
}

export function SheetTrigger({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export function SheetContent({ open, onOpenChange, children }: any) {
  if (!open) return null;
  return (
    <>
      <div 
        onClick={() => onOpenChange(false)} 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0 z-[140]"
      />
      <div className="fixed inset-y-0 right-0 z-[150] h-full w-full max-w-sm border-l border-solid border-zinc-200 bg-white p-6 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right flex flex-col gap-6">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent text-zinc-500 focus:outline-none"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 text-left">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 m-0">{children}</h2>;
}
