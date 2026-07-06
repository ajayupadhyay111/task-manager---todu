"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskRow, type TaskRowData } from "@/components/task/task-row";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21

export function TodayClient({ initial, completed }: { initial: TaskRowData[]; completed: TaskRowData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [done, setDone] = useState(completed);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>In focus</CardTitle><span className="text-[11px] text-white/40">{items.length} tasks</span></CardHeader>
          <CardBody className="space-y-1.5">
            <AnimatePresence initial={false}>
              {items.map(t => (
                <motion.div key={t.id} layout>
                  <TaskRow task={t} onChange={(id, patch) => {
                    if (patch.status === "completed") {
                      const removed = items.find(x => x.id === id);
                      setItems(p => p.filter(x => x.id !== id));
                      if (removed) setDone(p => [{ ...removed, ...patch }, ...p]);
                    } else {
                      setItems(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
                    }
                    setTimeout(() => router.refresh(), 400);
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <div className="py-8 text-center text-sm text-white/40">Nothing scheduled. Press T to add a task.</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle><span className="text-[11px] text-white/40">7am — 9pm</span></CardHeader>
          <CardBody>
            <Timeline items={items} />
          </CardBody>
        </Card>

        {done.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Completed today</CardTitle><span className="text-[11px] text-white/40">{done.length}</span></CardHeader>
            <CardBody className="space-y-1.5">
              {done.map(t => (
                <TaskRow key={t.id} task={t} compact />
              ))}
            </CardBody>
          </Card>
        )}
      </div>

      <aside className="space-y-6">
        <FocusTimer />
        <Card>
          <CardHeader><CardTitle>Tips</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-sm text-white/60">
            <p>Try 25/5 pomodoros for deep work.</p>
            <p>Move a task to <span className="text-brand-300">In progress</span> to signal focus.</p>
            <p>Press <kbd className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">T</kbd> for quick capture.</p>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}

function Timeline({ items }: { items: TaskRowData[] }) {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const startHour = HOURS[0];
  const hourHeight = 48;
  const nowY = (now.getHours() + now.getMinutes() / 60 - startHour) * hourHeight;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04]">
      <div className="grid" style={{ gridTemplateColumns: "56px 1fr" }}>
        <div className="border-r border-white/[0.04]">
          {HOURS.map(h => (
            <div key={h} className="flex h-12 items-start justify-end pr-2 pt-1 text-[11px] text-white/40">
              {h}:00
            </div>
          ))}
        </div>
        <div className="relative">
          {HOURS.map(h => <div key={h} className="h-12 border-b border-white/[0.03]" />)}
          {nowY >= 0 && nowY <= HOURS.length * hourHeight && (
            <div className="absolute left-0 right-0 z-10" style={{ top: nowY }}>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_10px] shadow-brand-400" />
                <div className="h-px flex-1 bg-gradient-to-r from-brand-400 to-transparent" />
              </div>
            </div>
          )}
          {items.map((t, i) => {
            const time = (t.dueTime ?? "").match(/^(\d{1,2}):?(\d{0,2})/);
            const hh = time ? parseInt(time[1]) : 9 + (i * 2 % 12);
            const mm = time ? parseInt(time[2] || "0") : 0;
            const y = (hh + mm / 60 - startHour) * hourHeight;
            if (y < 0 || y > HOURS.length * hourHeight) return null;
            const est = Math.max(30, t.estimatedMin ?? 45);
            const h = (est / 60) * hourHeight;
            return (
              <div key={t.id} className="absolute left-2 right-2"
                style={{ top: y + 2, height: h - 4 }}>
                <div className={cn(
                  "flex h-full flex-col rounded-xl border border-white/[0.06] px-3 py-1.5 text-[12px]",
                  "bg-gradient-to-br from-brand-500/25 to-brand-500/5 text-white shadow-lg"
                )}>
                  <div className="truncate font-medium">{t.title}</div>
                  {(t.project || t.client) && (
                    <div className="truncate text-[11px] text-white/50">
                      {t.project?.name ?? t.client?.name}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const int = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      int.current = setInterval(() => {
        setRemaining(r => (r > 0 ? r - 1 : 0));
      }, 1000);
    } else if (int.current) {
      clearInterval(int.current);
    }
    return () => { if (int.current) clearInterval(int.current); };
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = useMemo(() => (1 - remaining / (minutes * 60)) * 100, [remaining, minutes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Timer className="h-4 w-4 text-brand-400" /> Focus timer</CardTitle>
      </CardHeader>
      <CardBody className="text-center">
        <div className="relative mx-auto grid h-40 w-40 place-items-center">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <defs>
              <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4F7CFF" /><stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
            <motion.circle cx="60" cy="60" r="52" stroke="url(#fg)" strokeWidth="8" strokeLinecap="round" fill="none"
              initial={false}
              animate={{ strokeDasharray: `${2 * Math.PI * 52}`, strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
              transition={{ duration: 0.4 }} />
          </svg>
          <div className="absolute text-center">
            <div className="text-3xl font-semibold tabular-nums text-white">{mm}:{ss}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">focus</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setRunning(r => !r)} className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-white shadow-lg shadow-brand-500/25">
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={() => { setRunning(false); setRemaining(minutes * 60); }}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1">
          {[15, 25, 45].map(m => (
            <button key={m} onClick={() => { setMinutes(m); setRemaining(m * 60); setRunning(false); }}
              className={cn("rounded-lg px-2 py-1 text-[11px]", minutes === m ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white")}>
              {m}m
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
