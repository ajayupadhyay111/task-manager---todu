import { db } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskRow } from "@/components/task/task-row";
import { EmptyState } from "@/components/ui/empty";
import { CalendarClock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UpcomingPage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endWeek = new Date(start); endWeek.setDate(endWeek.getDate() + 14);
  const endMonth = new Date(start); endMonth.setDate(endMonth.getDate() + 60);

  const tasks = await db.task.findMany({
    where: {
      status: { notIn: ["completed", "archived"] },
      dueDate: { gte: start, lt: endMonth },
    },
    include: {
      client: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { subtasks: true, checklist: true, comments: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  type TaskItem = (typeof tasks)[number];
  const groups = new Map<string, TaskItem[]>();
  for (const t of tasks) {
    const d = new Date(t.dueDate!);
    const key = d.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-white/40">Next 60 days</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Upcoming</h1>
        <p className="mt-1 text-sm text-white/50">{tasks.length} scheduled tasks</p>
      </header>

      {tasks.length === 0 ? (
        <EmptyState icon={<CalendarClock className="h-6 w-6" />} title="Nothing upcoming" description="Add a due date to any task to see it here." />
      ) : Array.from(groups.entries()).map(([day, list]: [string, TaskItem[]]) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle>{new Date(day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</CardTitle>
            <span className="text-[11px] text-white/40">{list.length}</span>
          </CardHeader>
          <CardBody className="space-y-1.5">
            {list.map((t: TaskItem) => <TaskRow key={t.id} task={t} />)}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
