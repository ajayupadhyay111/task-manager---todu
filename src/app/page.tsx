import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle, SectionTitle } from "@/components/ui/card";
import { Badge, PriorityDot } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompletionChart, ProgressRing } from "@/components/dashboard/completion-chart";
import { EmptyState } from "@/components/ui/empty";
import { Inbox, Sparkles, CalendarDays, AlertTriangle, Clock, ArrowRight, Pin, StickyNote } from "lucide-react";
import { fmtRelative } from "@/lib/utils";
import { DashboardTaskList } from "@/components/dashboard/dashboard-task-list";
import { PinnedRow } from "@/components/dashboard/pinned-row";
import { StickyNotesRow } from "@/components/dashboard/sticky-notes-row";

async function getData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfTomorrow = new Date(endOfToday); endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
  const weekAhead = new Date(startOfToday); weekAhead.setDate(weekAhead.getDate() + 7);
  const days30 = new Date(startOfToday); days30.setDate(days30.getDate() - 30);
  const weekStart = new Date(startOfToday); weekStart.setDate(weekStart.getDate() - startOfToday.getDay());

  const todayP = db.task.findMany({
    where: {
      status: { notIn: ["completed", "archived"] },
      OR: [
        { status: "today" }, { status: "in_progress" },
        { scheduledFor: { gte: startOfToday, lt: endOfToday } },
        { dueDate: { gte: startOfToday, lt: endOfToday } },
      ],
    },
    include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } }, _count: { select: { subtasks: true, checklist: true, comments: true } } },
    orderBy: [{ pinned: "desc" }, { priority: "asc" }],
    take: 8,
  });
  const overdueP = db.task.findMany({
    where: { status: { notIn: ["completed", "archived"] }, dueDate: { lt: startOfToday } },
    include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } },
    orderBy: [{ dueDate: "asc" }], take: 5,
  });
  const upcomingP = db.task.findMany({
    where: { status: { notIn: ["completed", "archived"] }, dueDate: { gte: endOfTomorrow, lt: weekAhead } },
    include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } },
    orderBy: [{ dueDate: "asc" }], take: 6,
  });
  const activityP = db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  const activeTasksCountP = db.task.count({ where: { status: { notIn: ["completed", "archived"] } } });
  const completedTodayP = db.task.count({ where: { completedAt: { gte: startOfToday, lt: endOfToday } } });
  const completedThisWeekP = db.task.count({ where: { completedAt: { gte: weekStart } } });
  const focusMinP = db.focusSession.aggregate({ _sum: { minutes: true }, where: { startedAt: { gte: weekStart } } });
  const completed30P = db.task.findMany({ where: { completedAt: { gte: days30 } }, select: { completedAt: true } });
  const clientsP = db.client.findMany({ include: { _count: { select: { tasks: true, projects: true } } }, orderBy: { updatedAt: "desc" }, take: 5 });
  const projectsP = db.project.findMany({ include: { client: { select: { name: true, color: true } } }, orderBy: { updatedAt: "desc" }, take: 5 });
  const pinnedP = db.task.findMany({ where: { pinned: true, status: { notIn: ["completed", "archived"] } }, take: 6 });
  const stickyP = db.note.findMany({ where: { kind: "sticky" }, orderBy: { updatedAt: "desc" }, take: 4 });

  const today = await todayP;
  const overdue = await overdueP;
  const upcoming = await upcomingP;
  const activity = await activityP;
  const activeTasksCount = await activeTasksCountP;
  const completedToday = await completedTodayP;
  const completedThisWeek = await completedThisWeekP;
  const focusMin = await focusMinP;
  const completed30 = await completed30P;
  const clients = await clientsP;
  const projects = await projectsP;
  const pinned = await pinnedP;
  const sticky = await stickyP;

  // 30-day chart
  const map = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfToday); d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const t of completed30) {
    if (!t.completedAt) continue;
    const k = new Date(t.completedAt).toISOString().slice(0, 10);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const chart: { day: string; count: number }[] = [];
  map.forEach((count, day) => chart.push({ day, count }));

  const completionPct = today.length + completedToday === 0 ? 0 : Math.round((completedToday / (today.length + completedToday)) * 100);

  return {
    today, overdue, upcoming, activity, chart, clients, projects, pinned, sticky,
    stats: {
      activeTasksCount, completedToday, completedThisWeek,
      focusMinutes: focusMin._sum.minutes ?? 0, completionPct,
    },
  };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export default async function DashboardPage() {
  const d = await getData();
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -right-24 -top-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="grid-bg absolute inset-0 opacity-20" />
        </div>
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/40">{dateLabel}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {greeting()}, <span className="gradient-brand">Devima.</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/50">
              You have <span className="font-medium text-white">{d.today.length}</span> tasks focused for today
              {d.overdue.length > 0 && <> and <span className="font-medium text-red-300">{d.overdue.length}</span> overdue</>}.
              Let&apos;s make it a great one.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <ProgressRing value={d.stats.completionPct} label="Today" />
            <div className="hidden gap-4 md:flex">
              <Stat label="Active" value={d.stats.activeTasksCount} />
              <Stat label="Done today" value={d.stats.completedToday} />
              <Stat label="This week" value={d.stats.completedThisWeek} />
              <Stat label="Focus min" value={d.stats.focusMinutes} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Today */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-400" /> Today&apos;s focus</CardTitle>
                <p className="mt-0.5 text-xs text-white/40">The critical few you promised yourself</p>
              </div>
              <Link href="/today" className="flex items-center gap-1 text-xs text-white/50 hover:text-white">All <ArrowRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardBody>
              {d.today.length === 0 ? (
                <EmptyState icon={<Sparkles className="h-6 w-6" />} title="Your today is clear" description="Add a task or plan tomorrow tonight." />
              ) : (
                <DashboardTaskList initial={d.today} />
              )}
            </CardBody>
          </Card>

          {/* Overdue */}
          {d.overdue.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Overdue</CardTitle>
                  <p className="mt-0.5 text-xs text-white/40">Reschedule, delegate, or complete</p>
                </div>
                <Link href="/upcoming" className="flex items-center gap-1 text-xs text-white/50 hover:text-white">Plan <ArrowRight className="h-3 w-3" /></Link>
              </CardHeader>
              <CardBody className="space-y-1.5">
                {d.overdue.map((t: (typeof d.overdue)[number]) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-red-400/10 bg-red-500/5 px-3 py-2.5">
                    <PriorityDot priority={t.priority} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{t.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                        {t.project && <span className="rounded-full bg-white/[0.03] px-2 py-0.5">{t.project.name}</span>}
                        {t.client && <span>{t.client.name}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-red-300">{fmtRelative(t.dueDate)}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Upcoming */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" /> Upcoming</CardTitle>
                <p className="mt-0.5 text-xs text-white/40">Next 7 days</p>
              </div>
              <Link href="/upcoming" className="flex items-center gap-1 text-xs text-white/50 hover:text-white">See all <ArrowRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardBody className="space-y-1.5">
              {d.upcoming.length === 0
                ? <div className="py-6 text-center text-sm text-white/40">All clear next week.</div>
                : d.upcoming.map((t: (typeof d.upcoming)[number]) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                    <PriorityDot priority={t.priority} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{t.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                        {t.project && <span className="rounded-full bg-white/[0.03] px-2 py-0.5">{t.project.name}</span>}
                        {t.client && <span>{t.client.name}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] text-white/50">{new Date(t.dueDate!).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                ))}
            </CardBody>
          </Card>

          {/* Pinned + sticky notes */}
          {d.pinned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Pin className="h-4 w-4 text-brand-400" /> Pinned</CardTitle>
              </CardHeader>
              <CardBody><PinnedRow tasks={d.pinned} /></CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-amber-300" /> Sticky notes</CardTitle>
                <p className="mt-0.5 text-xs text-white/40">Quick reminders, front of mind</p>
              </div>
              <Link href="/notes" className="text-xs text-white/50 hover:text-white">Notes</Link>
            </CardHeader>
            <CardBody>
              <StickyNotesRow initial={d.sticky} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Productivity */}
          <Card>
            <CardHeader>
              <CardTitle>Completion — 30 days</CardTitle>
              <span className="text-[11px] text-white/40">tasks/day</span>
            </CardHeader>
            <CardBody>
              <CompletionChart data={d.chart} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="Today" value={d.stats.completedToday} />
                <MiniStat label="Week" value={d.stats.completedThisWeek} />
                <MiniStat label="Focus" value={`${d.stats.focusMinutes}m`} />
              </div>
            </CardBody>
          </Card>

          {/* Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Client progress</CardTitle>
              <Link href="/clients" className="text-xs text-white/50 hover:text-white">All</Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {d.clients.length === 0
                ? <EmptyState icon={<Inbox className="h-5 w-5" />} title="No clients yet" description="Press C to add one" />
                : d.clients.map((c: (typeof d.clients)[number]) => (
                  <Link key={c.id} href={`/clients/${c.id}`} className="block rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold text-white" style={{ background: c.color }}>{c.avatar ?? c.name[0]?.toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="truncate text-sm font-semibold text-white">{c.name}</div>
                          <Badge>{c._count.tasks} tasks</Badge>
                        </div>
                        <div className="mt-1.5"><Progress value={Math.min(100, c._count.projects * 20 + c._count.tasks * 5)} /></div>
                      </div>
                    </div>
                  </Link>
                ))}
            </CardBody>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Project progress</CardTitle>
              <Link href="/projects" className="text-xs text-white/50 hover:text-white">All</Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {d.projects.length === 0
                ? <EmptyState icon={<Inbox className="h-5 w-5" />} title="No projects yet" description="Press P to add one" />
                : d.projects.map((p: (typeof d.projects)[number]) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{p.name}</div>
                        <div className="mt-0.5 text-[11px] text-white/40">{p.client?.name ?? "Personal"}</div>
                      </div>
                      <Badge className="border-brand-400/20 text-brand-300">{p.progress}%</Badge>
                    </div>
                    <div className="mt-2"><Progress value={p.progress} /></div>
                  </Link>
                ))}
            </CardBody>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {d.activity.length === 0 ? (
                <div className="py-4 text-center text-sm text-white/40">Nothing yet</div>
              ) : d.activity.map((a: (typeof d.activity)[number]) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white/80">{a.title}</div>
                    <div className="text-[11px] text-white/40">{a.kind.split(".").join(" · ")} · {fmtRelative(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] py-2">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
