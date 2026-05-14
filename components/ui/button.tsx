"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
// FIXED: Direct lookup path targets the precise, audited reactive slot primitive package origin
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 font-sans",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white hover:bg-zinc-900 shadow-sm",
        outline:
          "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 hover:text-zinc-900 aria-expanded:bg-zinc-50",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 aria-expanded:bg-zinc-100",
        ghost:
          "hover:bg-zinc-50 hover:text-zinc-900 aria-expanded:bg-zinc-50",
        destructive:
          "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:border-red-200 focus-visible:ring-red-100",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-1.5 px-4 rounded-xl",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1 rounded-lg px-3 text-xs",
        lg: "h-14 gap-2 px-6 rounded-2xl text-base",
        icon: "size-11 rounded-xl",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// FIXED: Converted to forwardRef architecture to secure focus routing vectors cleanly across Next 14 workflows
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // FIXED: Uses the plain primitive directly instead of the missing .Root object selector
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
