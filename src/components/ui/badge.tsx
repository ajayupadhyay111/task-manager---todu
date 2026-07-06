import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/70",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: string }) {
  const cls =
    priority === "critical" ? "bg-red-400 shadow-red-400/40"
    : priority === "high" ? "bg-amber-400 shadow-amber-400/40"
    : priority === "medium" ? "bg-brand-400 shadow-brand-400/40"
    : "bg-zinc-500";
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full shadow-[0_0_10px]", cls)} />;
}
