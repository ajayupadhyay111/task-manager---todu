"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Inbox, LayoutDashboard, Plus, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Sun },
  { href: "add", label: "Add", icon: Plus, kind: "add" as const },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

export function BottomNav() {
  const pathname = usePathname();
  const setQuickAdd = useUIStore((s) => s.setQuickAdd);

  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#0C0D12] lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.kind === "add") {
            return (
              <li key="add" className="flex items-center justify-center">
                <button
                  onClick={() => setQuickAdd(true, "task")}
                  aria-label="Quick add"
                  className="shine grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-lg shadow-brand-500/40 transition-transform active:scale-95"
                >
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </button>
              </li>
            );
          }
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  active ? "text-white" : "text-white/50 hover:text-white",
                )}
              >
                {active && (
                  <span className="absolute top-0 h-[2px] w-8 rounded-b-full bg-gradient-to-r from-brand-400 to-accent" />
                )}
                <Icon className={cn("h-[18px] w-[18px]", active && "text-brand-400")} />
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
