import { db } from "@/lib/db";
import { TodayClient } from "./today-client";
import { ProgressRing } from "@/components/dashboard/completion-chart";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start); end.setDate(end.getDate() + 1);

  const [tasks, completed] = await Promise.all([
    db.task.findMany({
      where: {
        status: { notIn: ["completed", "archived"] },
        OR: [
          { status: "today" }, { status: "in_progress" },
          { scheduledFor: { gte: start, lt: end } },
          { dueDate: { gte: start, lt: end } },
        ],
      },
      include: {
        client: { select: { id: true, name: true, color: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: [{ scheduledFor: "asc" }, { dueTime: "asc" }, { priority: "asc" }],
    }),
    db.task.findMany({
      where: { completedAt: { gte: start, lt: end } },
      include: {
        client: { select: { id: true, name: true, color: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const total = tasks.length + completed.length;
  const pct = total === 0 ? 0 : Math.round((completed.length / total) * 100);
  const dateLabel = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      <header className="glass card-shadow flex flex-col items-start justify-between gap-4 rounded-3xl p-6 md:flex-row md:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">Focus</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Today</h1>
          <p className="mt-1 text-sm text-white/50">{dateLabel} · {tasks.length} to do · {completed.length} done</p>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={pct} label="Done" />
        </div>
      </header>
      <TodayClient initial={tasks} completed={completed} />
    </div>
  );
}
