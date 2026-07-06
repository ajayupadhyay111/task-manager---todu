import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0F]",
  {
    variants: {
      variant: {
        primary: "shine bg-gradient-to-br from-brand-500 to-accent text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40",
        secondary: "bg-white/[0.06] text-white hover:bg-white/[0.1]",
        ghost: "text-white/70 hover:bg-white/[0.05] hover:text-white",
        outline: "border border-white/[0.08] text-white hover:bg-white/[0.04]",
        danger: "bg-red-500/15 text-red-300 hover:bg-red-500/25",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-3.5 text-sm",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(button({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
