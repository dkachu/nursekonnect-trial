"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// FIXED: Refactored with forwardRef structure to prevent validation coordinates mapping failures across inputs
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "flex h-14 w-full min-w-0 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 shadow-sm transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-50 font-sans tracking-tight",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
