"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Inbox, Sun, Moon, CalendarClock, CalendarDays,
  Users, FolderKanban, NotebookPen, Activity, Archive, Settings,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/tomorrow", label: "Tomorrow", icon: Moon },
  { href: "/upcoming", label: "Upcoming", icon: CalendarClock },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="glass flex h-full w-full flex-col rounded-none border-r border-white/[0.04] p-4">
      <Link href="/" onClick={onNavigate} className="mb-6 flex items-center gap-2 px-2 pt-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent shadow-lg shadow-brand-500/30">
          <span className="text-sm font-bold">T</span>
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">Todu</div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">productivity os</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-white/60 hover:bg-white/[0.03] hover:text-white/90",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-400 to-accent" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-400" : "text-white/50 group-hover:text-white/80")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="glass rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-white/40">Streak</div>
              <div className="mt-0.5 text-lg font-semibold">12 days</div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400/30 to-red-400/20 text-amber-300">
              <span className="text-lg">🔥</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={cn(
                "h-1.5 rounded-full",
                i < 5 ? "bg-gradient-to-r from-brand-500 to-accent" : "bg-white/10",
              )} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-3 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-xs font-semibold">D</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Devima</div>
            <div className="truncate text-xs text-white/40">Pro plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
