import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-crema/12 bg-ink/50 px-3.5 py-2 text-sm text-slate-200 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:border-term/60 focus-visible:ring-1 focus-visible:ring-term/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
