"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// FIXED: Refactored with forwardRef mapping to prevent validation coordinate pass rejections across core forms
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 transition-all outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:bg-white focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-50 font-sans leading-relaxed",
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
