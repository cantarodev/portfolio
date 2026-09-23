import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full resize-y rounded-xl border border-crema/12 bg-ink/50 px-3.5 py-2.5 text-sm text-slate-200 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:border-term/60 focus-visible:ring-1 focus-visible:ring-term/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
