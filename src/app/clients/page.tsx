import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Users, ArrowRight, Circle, Mail, Phone, Globe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { initials, safeJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    include: { _count: { select: { projects: true, tasks: true } } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">Roster</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-white/50">{clients.length} in your network</p>
        </div>
      </header>

      {clients.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No clients yet" description="Press C to add your first client." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map(c => {
            const tags = safeJson<string[]>(c.tags, []);
            return (
              <Link key={c.id} href={`/clients/${c.id}`}>
                <Card className="group h-full overflow-hidden transition hover:translate-y-[-2px] hover:border-white/[0.12]">
                  <div className="relative h-24" style={{ background: `linear-gradient(135deg, ${c.color}66, ${c.color}22)` }}>
                    <div className="dots absolute inset-0 opacity-30" />
                    <div className="absolute left-4 top-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-semibold text-white shadow-lg" style={{ background: c.color }}>
                        {c.avatar ?? initials(c.name)}
                      </div>
                    </div>
                    <div className="absolute right-4 top-4 flex gap-1">
                      <Badge className="border-white/10 bg-black/30 backdrop-blur-md">{c.priority}</Badge>
                      <Badge className={
                        c.paymentStatus === "paid" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                        : c.paymentStatus === "overdue" ? "border-red-400/30 bg-red-500/10 text-red-200"
                        : "border-white/10 bg-black/30 backdrop-blur-md"
                      }>
                        <Circle className="h-2 w-2 fill-current" />
                        {c.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-white">{c.name}</div>
                        {c.company && <div className="truncate text-xs text-white/50">{c.company}</div>}
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map(t => <Badge key={t}>{t}</Badge>)}
                    </div>

                    <div className="mt-3 space-y-1.5 text-[11px] text-white/50">
                      {c.email && <div className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {c.email}</div>}
                      {c.phone && <div className="flex items-center gap-1.5 truncate"><Phone className="h-3 w-3" /> {c.phone}</div>}
                      {c.website && <div className="flex items-center gap-1.5 truncate"><Globe className="h-3 w-3" /> {c.website}</div>}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-2 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">Projects</div>
                        <div className="text-sm font-semibold">{c._count.projects}</div>
                      </div>
                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-2 text-center">
                        <div className="text-[10px] uppercase tracking-widest text-white/40">Tasks</div>
                        <div className="text-sm font-semibold">{c._count.tasks}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={Math.min(100, c._count.projects * 20 + c._count.tasks * 5)} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
