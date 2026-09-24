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
      "flex h-11 w-full rounded-lg border border-crema/15 bg-ink/50 px-3.5 py-2 text-sm text-crema shadow-sm transition-colors placeholder:text-crema/40 focus-visible:border-term/60 focus-visible:ring-2 focus-visible:ring-term/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
