"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
// FIXED: Swapped out 'radix-ui' pathing to target the explicit scoped primitive module package
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3 font-sans select-none",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white shadow-sm",
        secondary:
          "bg-zinc-100 text-zinc-900",
        destructive:
          "bg-red-50 text-red-600 border-red-100",
        outline:
          "border-zinc-200 text-zinc-800 bg-white",
        ghost:
          "hover:bg-zinc-50 hover:text-zinc-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

// FIXED: Refactored with forwardRef structure to prevent compilation parameter assignment failures
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    // FIXED: Uses Slot structural reference variable directly to align with Next 14 dependencies
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
