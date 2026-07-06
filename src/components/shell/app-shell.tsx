"use client";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { MobileDrawer } from "./mobile-drawer";
import { useUIStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        <Sidebar />
      </aside>
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 lg:px-8 lg:pb-8">{children}</main>
        <BottomNav />
      </div>
      <MobileDrawer open={mobileOpen} />
    </div>
  );
}
