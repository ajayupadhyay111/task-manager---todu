import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const b = await req.json();
  const item = await db.checklistItem.create({
    data: { text: b.text, taskId: b.taskId, order: b.order ?? 0 },
  });
  return NextResponse.json({ item });
}
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const item = await db.checklistItem.update({ where: { id: b.id }, data: { done: b.done, text: b.text } });
  return NextResponse.json({ item });
}
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db.checklistItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
