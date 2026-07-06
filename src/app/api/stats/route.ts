import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
  const weekStart = new Date(startOfToday); weekStart.setDate(weekStart.getDate() - startOfToday.getDay());
  const days30 = new Date(startOfToday); days30.setDate(days30.getDate() - 30);

  const [
    dueToday, overdue, completedToday, completedThisWeek,
    completedLast30, allActive, focusSum,
  ] = await Promise.all([
    db.task.count({ where: { dueDate: { gte: startOfToday, lt: endOfToday }, status: { notIn: ["completed", "archived"] } } }),
    db.task.count({ where: { dueDate: { lt: startOfToday }, status: { notIn: ["completed", "archived"] } } }),
    db.task.count({ where: { completedAt: { gte: startOfToday, lt: endOfToday } } }),
    db.task.count({ where: { completedAt: { gte: weekStart } } }),
    db.task.findMany({ where: { completedAt: { gte: days30 } }, select: { completedAt: true } }),
    db.task.count({ where: { status: { notIn: ["completed", "archived"] } } }),
    db.focusSession.aggregate({ _sum: { minutes: true }, where: { startedAt: { gte: weekStart } } }),
  ]);

  const byDay: { day: string; count: number }[] = [];
  const map = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfToday); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const t of completedLast30) {
    if (!t.completedAt) continue;
    const key = new Date(t.completedAt).toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  map.forEach((count, day) => byDay.push({ day, count }));

  return NextResponse.json({
    dueToday, overdue, completedToday, completedThisWeek,
    focusMinutesThisWeek: focusSum._sum.minutes ?? 0,
    activeTasks: allActive, completionByDay: byDay,
  });
}
