"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Item = {
  id: string; title: string; status: string; priority: string;
  dueDate: string | Date; dueTime: string | null; color: string | null;
  clientName?: string; projectName?: string; projectColor?: string; clientColor?: string;
};

type View = "month" | "week" | "day" | "agenda";

export function CalendarClient({ initial }: { initial: Item[] }) {
  const [view, setView] = useState<View>("agenda");
  const [cursor, setCursor] = useState(() => {
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });

  // Default to Agenda on mobile, Month on desktop (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setView(window.matchMedia("(min-width: 768px)").matches ? "month" : "agenda");
  }, []);

  const items = useMemo(() => initial.map(i => ({ ...i, _d: new Date(i.dueDate) })), [initial]);

  const title = view === "month"
    ? cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : view === "week"
      ? `Week of ${new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - cursor.getDay()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : view === "day"
        ? cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
        : "Agenda";

  const shift = (n: number) => {
    setCursor(c => {
      const d = new Date(c);
      if (view === "month") d.setMonth(d.getMonth() + n);
      else if (view === "week") d.setDate(d.getDate() + 7 * n);
      else if (view === "day") d.setDate(d.getDate() + n);
      return d;
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="glass card-shadow flex flex-col gap-2 rounded-2xl p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => shift(-1)} aria-label="Previous" className="grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/[0.05] hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor(new Date())} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs">Today</button>
          <button onClick={() => shift(1)} aria-label="Next" className="grid h-9 w-9 place-items-center rounded-xl text-white/70 hover:bg-white/[0.05] hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          <div className="ml-2 truncate text-sm font-semibold">{title}</div>
        </div>
        <div className="-mx-1 flex overflow-x-auto rounded-xl border border-white/[0.06] p-0.5 sm:mx-0">
          {(["month","week","day","agenda"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("shrink-0 rounded-lg px-3 py-1.5 text-xs capitalize transition", view === v ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && <MonthView cursor={cursor} items={items} />}
      {view === "week" && <WeekView cursor={cursor} items={items} />}
      {view === "day" && <DayView cursor={cursor} items={items} />}
      {view === "agenda" && <AgendaView items={items} />}
    </div>
  );
}

function MonthView({ cursor, items }: { cursor: Date; items: (Item & { _d: Date })[] }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first); start.setDate(start.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(d.getDate() + i); cells.push(d); }
  const today = new Date(); today.setHours(0,0,0,0);
  const map = new Map<string, (Item & { _d: Date })[]>();
  for (const it of items) {
    const key = it._d.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  const DAYS = ["S","M","T","W","T","F","S"];
  const DAYS_LONG = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <Card>
      <CardBody className="p-1.5 sm:p-2">
        <div className="grid grid-cols-7 gap-1 pb-2">
          {DAYS.map((d, i) => (
            <div key={i} className="px-1 py-1 text-center text-[10px] uppercase tracking-widest text-white/40 sm:text-left sm:px-2 sm:text-[11px]">
              <span className="sm:hidden">{d}</span>
              <span className="hidden sm:inline">{DAYS_LONG[i]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = d.toDateString() === today.toDateString();
            const list = map.get(d.toDateString()) ?? [];
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i % 7) * 0.01 }}
                className={cn(
                  "aspect-square rounded-lg border p-1 sm:aspect-auto sm:min-h-[100px] sm:rounded-xl sm:p-2",
                  inMonth ? "border-white/[0.05] bg-white/[0.02]" : "border-white/[0.03] bg-white/[0.005] text-white/30",
                  isToday && "ring-1 ring-brand-500/40 border-brand-500/40",
                )}>
                <div className="flex items-center justify-between">
                  <div className={cn("text-[11px] font-semibold sm:text-[12px]", isToday && "text-brand-300")}>{d.getDate()}</div>
                  {list.length > 0 && (
                    <div className="hidden rounded-full bg-white/[0.05] px-1.5 text-[10px] text-white/60 sm:block">{list.length}</div>
                  )}
                </div>
                {/* Mobile: just show dots */}
                <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                  {list.slice(0, 4).map(x => (
                    <span key={x.id} className="h-1 w-1 rounded-full" style={{ background: x.projectColor ?? "#4F7CFF" }} />
                  ))}
                </div>
                {/* Desktop: full pills */}
                <div className="mt-1 hidden space-y-1 sm:block">
                  {list.slice(0, 3).map(x => (
                    <div key={x.id} className="line-clamp-1 rounded-md px-1.5 py-0.5 text-[11px]"
                      style={{ background: `${x.projectColor ?? "#4F7CFF"}22`, color: "#fff" }}>
                      {x.dueTime ? `${x.dueTime} ` : ""}{x.title}
                    </div>
                  ))}
                  {list.length > 3 && <div className="pl-1 text-[10px] text-white/40">+{list.length - 3}</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function WeekView({ cursor, items }: { cursor: Date; items: (Item & { _d: Date })[] }) {
  const start = new Date(cursor); start.setDate(start.getDate() - cursor.getDay()); start.setHours(0,0,0,0);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  return (
    <Card><CardBody className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {days.map(d => {
        const list = items.filter(x => x._d.toDateString() === d.toDateString());
        return (
          <div key={d.toISOString()} className="min-h-[240px] rounded-xl border border-white/[0.05] p-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/40">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
              <div className="text-sm font-semibold">{d.getDate()}</div>
            </div>
            <div className="space-y-1.5">
              {list.map(t => (
                <div key={t.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-[12px]">
                  <div className="line-clamp-2 font-medium">{t.title}</div>
                  <div className="mt-0.5 text-[10px] text-white/40">{t.dueTime ?? ""} {t.projectName ?? t.clientName ?? ""}</div>
                </div>
              ))}
              {list.length === 0 && <div className="pt-4 text-center text-[11px] text-white/30">—</div>}
            </div>
          </div>
        );
      })}
    </CardBody></Card>
  );
}

function DayView({ cursor, items }: { cursor: Date; items: (Item & { _d: Date })[] }) {
  const list = items.filter(x => x._d.toDateString() === cursor.toDateString())
    .sort((a, b) => (a.dueTime ?? "").localeCompare(b.dueTime ?? ""));
  return (
    <Card><CardBody className="space-y-2">
      {list.length === 0 && <div className="py-16 text-center text-sm text-white/40">Free day — go make something.</div>}
      {list.map(t => (
        <div key={t.id} className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="w-16 text-center text-sm font-semibold text-white/60">{t.dueTime ?? "—"}</div>
          <div className="min-w-0 flex-1">
            <div className="line-clamp-1 font-medium text-white">{t.title}</div>
            <div className="mt-0.5 text-[11px] text-white/40">{t.projectName ?? t.clientName ?? ""}</div>
          </div>
          <div className="hidden text-[11px] text-white/50 md:block">{t.priority}</div>
        </div>
      ))}
    </CardBody></Card>
  );
}

function AgendaView({ items }: { items: (Item & { _d: Date })[] }) {
  type Row = Item & { _d: Date };
  const sorted = [...items].sort((a, b) => a._d.getTime() - b._d.getTime());
  const groups = new Map<string, Row[]>();
  for (const it of sorted) {
    const k = it._d.toDateString();
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }
  return (
    <div className="space-y-3">
      {Array.from(groups.entries()).map(([day, list]: [string, Row[]]) => (
        <Card key={day}><CardBody>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarDays className="h-4 w-4 text-brand-400" />
            {new Date(day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div className="space-y-1.5">
            {list.map((t: Row) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm">
                <span className="w-14 shrink-0 text-[11px] text-white/40">{t.dueTime ?? ""}</span>
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-[11px] text-white/40">{t.projectName ?? t.clientName ?? ""}</span>
              </div>
            ))}
          </div>
        </CardBody></Card>
      ))}
    </div>
  );
}
