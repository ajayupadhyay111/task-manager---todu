import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.activity.findMany({
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return NextResponse.json({ items });
}
