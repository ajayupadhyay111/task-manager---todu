import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const client = await db.client.findUnique({
    where: { id },
    include: {
      projects: { include: { _count: { select: { tasks: true, milestones: true } } } },
      tasks: { take: 50, orderBy: { updatedAt: "desc" } },
      clientNotes: { orderBy: { updatedAt: "desc" }, take: 20 },
      invoices: { orderBy: { issuedAt: "desc" } },
      meetings: { orderBy: { startsAt: "desc" } },
    },
  });
  return NextResponse.json({ client });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...b };
  if (b.tags !== undefined) data.tags = JSON.stringify(b.tags);
  const client = await db.client.update({ where: { id }, data });
  await logActivity({ kind: "client.updated", entity: "client", entityId: id, title: client.name });
  return NextResponse.json({ client });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await db.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
