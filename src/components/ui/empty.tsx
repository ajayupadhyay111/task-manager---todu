import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon, title, description, action, className,
}: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string; }) {
  return (
    <div className={cn("dots relative overflow-hidden rounded-2xl border border-white/[0.06] p-10 text-center", className)}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0B0F]" />
      <div className="relative">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent/20 text-brand-400 ring-1 ring-white/[0.06]">
          {icon}
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-white/50">{description}</p>}
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
