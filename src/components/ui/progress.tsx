import { cn } from "@/lib/utils";
export function Progress({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent transition-[width] duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
