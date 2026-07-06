import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const b = await req.json();
  const m = await db.milestone.create({
    data: { title: b.title, projectId: b.projectId, dueDate: b.dueDate ? new Date(b.dueDate) : null, order: b.order ?? 0 },
  });
  return NextResponse.json({ milestone: m });
}

export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const m = await db.milestone.update({ where: { id: b.id }, data: { done: b.done, title: b.title } });
  return NextResponse.json({ milestone: m });
}
