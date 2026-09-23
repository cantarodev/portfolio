import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-crema/15 bg-crema/10 text-crema/90",
        term: "border-term/40 bg-term/15 text-term",
        copper: "border-copper/40 bg-copper/15 text-copper",
        cherry: "border-cherry/40 bg-cherry/15 text-cherry",
        leaf: "border-leaf/40 bg-leaf/15 text-leaf",
        sky: "border-sky/40 bg-sky/15 text-sky",
        gold: "border-gold/40 bg-gold/15 text-gold",
        outline: "border-crema/20 bg-transparent text-crema/70",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
