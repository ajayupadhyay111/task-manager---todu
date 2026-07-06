import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty";
import { Inbox } from "lucide-react";
import { InboxClient } from "./inbox-client";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const tasks = await db.task.findMany({
    where: { status: "inbox" },
    include: {
      client: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, name: true, color: true } },
      _count: { select: { subtasks: true, checklist: true, comments: true } },
    },
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/40">Capture</div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Inbox</h1>
          <p className="mt-1 text-sm text-white/50">Dump every idea. Organize later.</p>
        </div>
        <div className="hidden text-right text-sm text-white/40 sm:block">
          <div>{tasks.length} items</div>
        </div>
      </header>

      <InboxClient initial={tasks} />

      {tasks.length === 0 && (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="Inbox zero"
          description="Nothing to triage. Press T to add a task, or type below to capture."
        />
      )}
    </div>
  );
}
