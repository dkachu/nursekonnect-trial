"use client"

import * as React from "react"
// FIXED: Direct lookup path targets the precise, audited primitive package origin
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

// FIXED: Implemented forwardRef wrapping to allow precise reference pass-through setups across standard forms
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 font-sans",
      className
    )}
    {...props}
  />
))

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
