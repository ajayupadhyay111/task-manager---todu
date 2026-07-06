import { db } from "@/lib/db";
import { TomorrowClient } from "./tomorrow-client";

export const dynamic = "force-dynamic";

const QUOTES = [
  { q: "Well begun is half done.", by: "Aristotle" },
  { q: "You do not rise to the level of your goals, you fall to the level of your systems.", by: "James Clear" },
  { q: "The way to get started is to quit talking and begin doing.", by: "Walt Disney" },
  { q: "Discipline equals freedom.", by: "Jocko Willink" },
  { q: "Small steps compound into extraordinary results.", by: "Anonymous" },
];

export default async function TomorrowPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfTomorrow = new Date(startOfTomorrow); endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const [candidates, carryForward] = await Promise.all([
    db.task.findMany({
      where: {
        status: { notIn: ["completed", "archived"] },
        OR: [
          { status: "tomorrow" }, { status: "planned" }, { status: "inbox" },
          { scheduledFor: { gte: startOfTomorrow, lt: endOfTomorrow } },
          { dueDate: { gte: startOfTomorrow, lt: endOfTomorrow } },
        ],
      },
      include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } },
      orderBy: [{ priority: "asc" }],
      take: 30,
    }),
    db.task.findMany({
      where: {
        status: { notIn: ["completed", "archived"] },
        dueDate: { lt: startOfToday },
      },
      include: { client: { select: { id: true, name: true, color: true } }, project: { select: { id: true, name: true, color: true } } },
      take: 10,
    }),
  ]);

  const quote = QUOTES[startOfTomorrow.getDate() % QUOTES.length];
  return (
    <TomorrowClient
      candidates={candidates}
      carryForward={carryForward}
      quote={quote}
      dateLabel={startOfTomorrow.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
    />
  );
}
