"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Inbox, LayoutDashboard, Sun, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Sun },
  { href: "quick-add", label: "Add", icon: null },
  { href: "/calendar", label: "Cal", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

export function BottomNav() {
  const pathname = usePathname();
  const setQuickAdd = useUIStore((s) => s.setQuickAdd);

  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.05] bg-[rgba(10,11,15,0.75)] backdrop-blur-2xl lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map((item) => {
          if (item.href === "quick-add") {
            return (
              <li key="add" className="relative flex justify-center">
                <button
                  onClick={() => setQuickAdd(true, "task")}
                  className="shine absolute -top-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-xl shadow-brand-500/40"
                  aria-label="Quick add"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <span className="mt-14 text-[10px] text-white/40">Add</span>
              </li>
            );
          }
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href!);
          const Icon = item.icon!;
          return (
            <li key={item.href}>
              <Link
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 text-[10px]",
                  active ? "text-white" : "text-white/50",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-brand-400")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
