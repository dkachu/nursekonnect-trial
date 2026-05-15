import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", type = "button", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-sans font-black text-xs uppercase tracking-widest rounded-2xl h-14 px-8 transition-all duration-200 select-none cursor-pointer active:scale-[0.98] border-none disabled:opacity-50 disabled:cursor-not-allowed";
    const variantStyles = variant === "outline" 
      ? "bg-transparent text-zinc-500 border border-solid border-zinc-200 hover:bg-zinc-50" 
      : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg";

    return (
      <button
        type={type}
        className={`${baseStyles} ${variantStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
