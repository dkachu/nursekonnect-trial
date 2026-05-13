"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  count: number | string | null | undefined;
  variant?: "default" | "dark" | "accent"; 
  className?: string;
}

export default function DashboardCard({ 
  title, 
  count, 
  variant = "default",
  className 
}: DashboardCardProps) {
  
  const variants = {
    default: "bg-white text-zinc-900 border-zinc-100",
    dark: "bg-zinc-950 text-white border-zinc-800 shadow-xl",
    accent: "bg-blue-600 text-white border-transparent"
  };

  const labelVariants = {
    default: "text-zinc-400 group-hover:text-blue-600",
    dark: "text-zinc-500 group-hover:text-blue-400",
    accent: "text-blue-100 group-hover:text-white"
  };

  const displayCount = count !== null && count !== undefined ? String(count) : "0";

  const getFontSize = (text: string) => {
    if (text.length > 15) return "text-xl";
    if (text.length > 12) return "text-2xl";
    if (text.length > 8) return "text-3xl"; 
    return "text-5xl";
  };

  return (
    <Card 
      className={cn(
        "border rounded-3xl p-6 overflow-hidden relative group transition-all duration-300",
        variants[variant],
        className
      )}
    >
      <CardContent className="p-0 flex flex-col items-center text-center space-y-4 relative z-10">
        
        <div className="w-full overflow-hidden">
          <h3 className={cn(
            "font-black tracking-tighter leading-none transition-transform break-all uppercase italic",
            getFontSize(displayCount),
            variant === "default" ? "text-zinc-900" : "text-white"
          )}>
            {displayCount}
          </h3>
        </div>
        
        <div className={cn(
          "pt-4 border-t w-full flex flex-col items-center gap-2",
          variant === "default" ? "border-zinc-100" : "border-white/10"
        )}>
          <p className={cn(
            "text-[9px] font-black uppercase tracking-widest transition-colors",
            labelVariants[variant]
          )}>
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
