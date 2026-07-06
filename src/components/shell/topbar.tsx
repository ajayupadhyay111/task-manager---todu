"use client";
import { Bell, Command, Menu, Plus, Search } from "lucide-react";
import { useUIStore } from "@/lib/store";

export function Topbar() {
  const setMobile = useUIStore((s) => s.setMobileNavOpen);
  const setPalette = useUIStore((s) => s.setPaletteOpen);
  const setQuickAdd = useUIStore((s) => s.setQuickAdd);

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#0C0D12]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-1.5 px-3 py-2.5 md:px-6 lg:px-8">
        <button
          onClick={() => setMobile(true)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/70 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          onClick={() => setPalette(true)}
          className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 text-left text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white/80"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">Search tasks, clients, projects, notes…</span>
            <span className="sm:hidden">Search…</span>
          </span>
          <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-white/50 sm:flex">
            <Command className="h-3 w-3" /> K
          </span>
        </button>

        <button
          onClick={() => setQuickAdd(true, "task")}
          className="shine hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-brand-500 to-accent px-3 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40 sm:flex"
        >
          <Plus className="h-4 w-4" />
          Quick add
        </button>

        <button
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/70 transition hover:bg-white/[0.05] hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-400 ring-2 ring-[#0A0B0F]" />
        </button>

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-xs font-semibold text-white sm:flex">
          D
        </div>
      </div>
    </header>
  );
}
