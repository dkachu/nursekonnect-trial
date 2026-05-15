import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-xs font-black uppercase tracking-wider text-zinc-900 select-none font-sans ${className}`}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
