import { db } from "@/lib/db";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtRelative } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty";
import { Activity as ActIcon, CheckCircle2, Circle, Users, FolderKanban, NotebookPen } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS: Record<string, React.ReactNode> = {
  "task.completed": <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
  "task.created": <Circle className="h-4 w-4 text-brand-400" />,
  "task.updated": <Circle className="h-4 w-4 text-white/50" />,
  "task.deleted": <Circle className="h-4 w-4 text-red-300" />,
  "client.created": <Users className="h-4 w-4 text-brand-400" />,
  "client.updated": <Users className="h-4 w-4 text-white/50" />,
  "project.created": <FolderKanban className="h-4 w-4 text-accent" />,
  "project.updated": <FolderKanban className="h-4 w-4 text-white/50" />,
  "note.created": <NotebookPen className="h-4 w-4 text-amber-300" />,
  "note.edited": <NotebookPen className="h-4 w-4 text-white/50" />,
};

export default async function ActivityPage() {
  const items = await db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const groups = new Map<string, typeof items>();
  for (const it of items) {
    const key = new Date(it.createdAt).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-white/40">Trail</div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Activity</h1>
        <p className="mt-1 text-sm text-white/50">Everything you&apos;ve done, in one timeline</p>
      </header>

      {items.length === 0 ? (
        <EmptyState icon={<ActIcon className="h-6 w-6" />} title="Nothing here yet" description="As you work, actions will appear here." />
      ) : Array.from(groups.entries()).map(([day, list]) => (
        <Card key={day}>
          <CardHeader><CardTitle>{new Date(day).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</CardTitle><span className="text-[11px] text-white/40">{list.length}</span></CardHeader>
          <CardBody>
            <ol className="relative space-y-3 border-l border-white/[0.06] pl-4">
              {list.map(it => (
                <li key={it.id} className="relative">
                  <span className="absolute -left-[21px] top-1 grid h-4 w-4 place-items-center rounded-full bg-[#14161d] ring-1 ring-white/[0.08]">
                    {ICONS[it.kind] ?? <Circle className="h-3 w-3 text-white/50" />}
                  </span>
                  <div className="text-sm text-white">{it.title}</div>
                  <div className="text-[11px] text-white/40">{it.kind.split(".").join(" · ")} · {fmtRelative(it.createdAt)}</div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
