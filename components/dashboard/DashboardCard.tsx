"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  count: number | string | null | undefined;
  icon: LucideIcon; 
  variant?: "default" | "dark" | "accent"; 
  className?: string;
}

const DashboardCard = ({ 
  title, 
  count, 
  icon: Icon, 
  variant = "default",
  className 
}: DashboardCardProps) => {
  
  /**
   * Registry Identity Theming
   * standard: Medical clean
   * dark: Professional audit
   * accent: High-priority dispatch
   */
  const variants = {
    default: "bg-white text-zinc-900 border-zinc-100",
    dark: "bg-zinc-950 text-white border-zinc-800 shadow-2xl",
    accent: "bg-blue-600 text-white border-transparent shadow-blue-200"
  };

  const iconVariants = {
    default: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    dark: "bg-zinc-800 text-zinc-400 group-hover:bg-blue-600 group-hover:text-white",
    accent: "bg-white/20 text-white group-hover:bg-white group-hover:text-blue-600"
  };

  const labelVariants = {
    default: "text-zinc-400 group-hover:text-blue-600",
    dark: "text-zinc-500 group-hover:text-blue-400",
    accent: "text-blue-100 group-hover:text-white"
  };

  const displayCount = count !== null && count !== undefined ? String(count) : "0";

  /**
   * Responsive Data Scale Engine
   * Ensures KES currency strings and large counts don't break the UI
   */
  const getFontSize = (text: string) => {
    if (text.length > 15) return "text-xl";
    if (text.length > 12) return "text-2xl";
    if (text.length > 8) return "text-3xl"; 
    return "text-5xl";
  };

  return (
    <Card 
      className={cn(
        "border shadow-xl rounded-[2.5rem] p-8 overflow-hidden relative group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
        variants[variant],
        className
      )}
    >
      <CardContent className="p-0 flex flex-col items-center text-center space-y-6 relative z-10">
        
        {/* Dynamic Icon Signature */}
        <div className={cn(
          "p-4 rounded-2xl transition-all duration-500 shadow-sm",
          iconVariants[variant]
        )}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        
        {/* Registry Metric Display */}
        <div className="w-full overflow-hidden">
          <h3 className={cn(
            "font-black tracking-tighter leading-none transition-all duration-500 group-hover:scale-105 italic break-all",
            getFontSize(displayCount),
            variant === "default" ? "text-zinc-900" : "text-white"
          )}>
            {displayCount}
          </h3>
        </div>
        
        {/* Metadata Classification Layer */}
        <div className={cn(
          "pt-4 border-t w-full flex flex-col items-center gap-2",
          variant === "default" ? "border-zinc-50" : "border-white/10"
        )}>
          <p className={cn(
            "text-[9px] font-black uppercase tracking-[0.3em] transition-colors",
            labelVariants[variant]
          )}>
            {title}
          </p>
          
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-500 animate-pulse",
            variant === "accent" ? "bg-white" : "bg-blue-600"
          )} />
        </div>
      </CardContent>

      {/* Registry Pulse Aura */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none",
        "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]",
        variant === "accent" ? "from-white" : "from-blue-600"
      )} />
    </Card>
  );
};

export default DashboardCard;
