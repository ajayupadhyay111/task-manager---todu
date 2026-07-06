import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { FolderKanban, Calendar as CalIcon, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    include: { client: { select: { id: true, name: true, color: true } }, _count: { select: { tasks: true, milestones: true } } },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-white/40">Portfolio</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Projects</h1>
        <p className="mt-1 text-sm text-white/50">{projects.length} across your clients</p>
      </header>

      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban className="h-6 w-6" />} title="No projects yet" description="Press P to create one." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p: (typeof projects)[number]) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="group relative overflow-hidden p-5 transition hover:translate-y-[-2px] hover:border-white/[0.12]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full opacity-30 blur-2xl" style={{ background: p.color }} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-widest text-white/40">{p.client?.name ?? "Personal"}</div>
                    <Badge className="border-brand-400/20 text-brand-300">{p.status}</Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{p.name}</h3>
                  {p.description && <p className="mt-1 line-clamp-2 text-[13px] text-white/60">{p.description}</p>}

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/40">
                      <span>Progress</span><span>{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
                    <div className="flex items-center gap-3">
                      <span>{p._count.tasks} tasks</span>
                      <span>{p._count.milestones} milestones</span>
                    </div>
                    {p.deadline && (
                      <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" /> {new Date(p.deadline).toLocaleDateString()}</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end text-white/40 transition group-hover:text-white/80">
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
