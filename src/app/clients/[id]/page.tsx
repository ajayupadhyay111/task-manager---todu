import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { initials, safeJson } from "@/lib/utils";
import { TaskRow } from "@/components/task/task-row";
import { Mail, Phone, Globe, DollarSign, Calendar as CalIcon } from "lucide-react";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.client.findUnique({
    where: { id },
    include: {
      projects: { include: { _count: { select: { tasks: true, milestones: true } } } },
      tasks: { include: { project: { select: { id: true, name: true, color: true } } }, orderBy: { updatedAt: "desc" }, take: 20 },
      clientNotes: { orderBy: { updatedAt: "desc" }, take: 20 },
      invoices: { orderBy: { issuedAt: "desc" } },
      meetings: { orderBy: { startsAt: "desc" }, take: 10 },
    },
  });
  if (!c) notFound();

  const tags = safeJson<string[]>(c.tags, []);

  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 md:p-8">
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(600px 400px at 10% 0%, ${c.color}55, transparent 60%)` }} />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold text-white shadow-xl" style={{ background: c.color }}>
              {c.avatar ?? initials(c.name)}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-white/40">Client</div>
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{c.name}</h1>
              {c.company && <p className="text-sm text-white/50">{c.company}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map(t => <Badge key={t}>{t}</Badge>)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Kpi icon={<CalIcon className="h-3 w-3" />} label="Projects" value={c.projects.length} />
            <Kpi label="Tasks" value={c.tasks.length} />
            <Kpi label="Payment" value={c.paymentStatus} />
            <Kpi icon={<DollarSign className="h-3 w-3" />} label="Budget" value={c.budget ? `$${(c.budget/1000).toFixed(1)}k` : "—"} />
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-4 text-sm text-white/60">
          {c.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {c.email}</span>}
          {c.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {c.phone}</span>}
          {c.website && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {c.website}</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle><span className="text-[11px] text-white/40">{c.projects.length}</span></CardHeader>
            <CardBody className="space-y-2">
              {c.projects.length === 0 && <div className="py-6 text-center text-sm text-white/40">No projects yet.</div>}
              {c.projects.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">{p.name}</div>
                      <div className="mt-0.5 text-[11px] text-white/40">{p._count.tasks} tasks · {p._count.milestones} milestones</div>
                    </div>
                    <Badge className="border-brand-400/20 text-brand-300">{p.progress}%</Badge>
                  </div>
                  <div className="mt-2"><Progress value={p.progress} /></div>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent tasks</CardTitle></CardHeader>
            <CardBody className="space-y-1.5">
              {c.tasks.length === 0 && <div className="py-6 text-center text-sm text-white/40">No tasks yet.</div>}
              {c.tasks.map(t => (
                <TaskRow key={t.id} task={t} />
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-sm text-white/70">
              {c.notes && <p className="whitespace-pre-wrap">{c.notes}</p>}
              {c.meetingNotes && <><div className="text-[11px] uppercase tracking-widest text-white/40">Meeting notes</div><p className="whitespace-pre-wrap">{c.meetingNotes}</p></>}
              {!c.notes && !c.meetingNotes && <div className="py-4 text-center text-sm text-white/40">No notes.</div>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Invoices</CardTitle><span className="text-[11px] text-white/40">{c.invoices.length}</span></CardHeader>
            <CardBody className="space-y-2">
              {c.invoices.length === 0 && <div className="py-4 text-center text-sm text-white/40">No invoices.</div>}
              {c.invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold">#{inv.number}</div>
                    <div className="text-[11px] text-white/40">{new Date(inv.issuedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${inv.amount.toFixed(0)}</div>
                    <div className={
                      "text-[10px] uppercase tracking-widest " +
                      (inv.status === "paid" ? "text-emerald-300" : inv.status === "overdue" ? "text-red-300" : "text-white/50")
                    }>{inv.status}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Meetings</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              {c.meetings.length === 0 && <div className="py-4 text-center text-sm text-white/40">No meetings scheduled.</div>}
              {c.meetings.map(m => (
                <div key={m.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-[11px] text-white/40">{new Date(m.startsAt).toLocaleString()}</div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-white/40">{icon}{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
