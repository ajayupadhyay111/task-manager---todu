import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const projectId = searchParams.get("projectId") ?? undefined;
  const notes = await db.note.findMany({
    where: { kind, clientId, projectId },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    take: 200,
  });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const note = await db.note.create({
    data: {
      title: b.title ?? "Untitled",
      body: b.body ?? "",
      kind: b.kind ?? "note",
      color: b.color ?? null,
      clientId: b.clientId ?? null,
      projectId: b.projectId ?? null,
    },
  });
  await logActivity({ kind: "note.created", entity: "note", entityId: note.id, title: note.title });
  return NextResponse.json({ note });
}
