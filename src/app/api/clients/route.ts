import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
  const clients = await db.client.findMany({
    include: {
      _count: { select: { projects: true, tasks: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const client = await db.client.create({
    data: {
      name: b.name, company: b.company ?? null, email: b.email ?? null, phone: b.phone ?? null,
      avatar: b.avatar ?? null, color: b.color ?? "#4F7CFF",
      priority: b.priority ?? "medium", status: b.status ?? "active",
      paymentStatus: b.paymentStatus ?? "current", budget: b.budget ?? null,
      website: b.website ?? null, notes: b.notes ?? null,
      meetingNotes: b.meetingNotes ?? null, tags: JSON.stringify(b.tags ?? []),
    },
  });
  await logActivity({ kind: "client.created", entity: "client", entityId: client.id, title: client.name });
  return NextResponse.json({ client });
}
