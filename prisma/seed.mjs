import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });
dotenvConfig();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }

const adapter = new PrismaPg({ connectionString: url });
const db = new PrismaClient({ adapter });

function daysFromNow(n, hh = 9, mm = 0) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hh, mm, 0, 0);
  return d;
}

async function main() {
  console.log("Wiping…");
  await db.activity.deleteMany();
  await db.checklistItem.deleteMany();
  await db.comment.deleteMany();
  await db.attachment.deleteMany();
  await db.dependsOn.deleteMany();
  await db.task.deleteMany();
  await db.milestone.deleteMany();
  await db.note.deleteMany();
  await db.invoice.deleteMany();
  await db.meeting.deleteMany();
  await db.project.deleteMany();
  await db.client.deleteMany();
  await db.focusSession.deleteMany();

  console.log("Seeding clients…");
  const acme = await db.client.create({
    data: {
      name: "Acme Studio", company: "Acme Studio Inc.", email: "hello@acme.studio",
      phone: "+1 555 010 2233", color: "#4F7CFF", priority: "high", paymentStatus: "current",
      budget: 24000, website: "https://acme.studio", avatar: "A",
      notes: "Design-forward agency, monthly retainer.\nWorks async, values crisp handoffs.",
      meetingNotes: "Weekly on Thursdays 10am IST.",
      tags: JSON.stringify(["retainer", "design", "webflow"]),
    },
  });
  const nova = await db.client.create({
    data: {
      name: "Nova Labs", company: "Nova Labs", email: "founders@nova.dev",
      color: "#A78BFA", priority: "critical", paymentStatus: "overdue",
      budget: 40000, website: "https://nova.dev", avatar: "N",
      notes: "Seed-stage founders. Fast paced, moving to launch.",
      tags: JSON.stringify(["startup", "product", "urgent"]),
    },
  });
  const luma = await db.client.create({
    data: {
      name: "Luma Health", company: "Luma Health", email: "team@luma.health",
      color: "#34D399", priority: "medium", paymentStatus: "paid",
      budget: 18000, website: "https://luma.health", avatar: "L",
      tags: JSON.stringify(["healthcare", "compliance"]),
    },
  });
  const personal = await db.client.create({
    data: { name: "Personal", color: "#FBBF24", priority: "low", avatar: "◆", tags: JSON.stringify(["me"]) },
  });

  console.log("Seeding projects…");
  const p1 = await db.project.create({
    data: { name: "Marketing site redesign", clientId: acme.id, color: "#4F7CFF", status: "active", priority: "high",
      progress: 62, deadline: daysFromNow(21), description: "Rebuild the Acme marketing site with a new visual system and CMS.",
      links: JSON.stringify([{ label: "Figma", url: "https://figma.com" }, { label: "Repo", url: "https://github.com" }]) },
  });
  const p2 = await db.project.create({
    data: { name: "Onboarding revamp", clientId: nova.id, color: "#A78BFA", status: "active", priority: "critical",
      progress: 28, deadline: daysFromNow(10), description: "Overhaul the onboarding to reduce time-to-first-value by 40%.",
      links: JSON.stringify([{ label: "Notion", url: "https://notion.so" }]) },
  });
  const p3 = await db.project.create({
    data: { name: "Provider dashboard v2", clientId: luma.id, color: "#34D399", status: "planning", priority: "medium",
      progress: 8, deadline: daysFromNow(45) },
  });
  const p4 = await db.project.create({
    data: { name: "Portfolio", clientId: personal.id, color: "#FBBF24", status: "active", priority: "medium",
      progress: 40, description: "Refresh personal site with case studies and blog." },
  });

  console.log("Seeding milestones…");
  const milestones = [
    { title: "Component library", pid: p1.id, done: true },
    { title: "Landing page", pid: p1.id, done: true },
    { title: "Blog + CMS integration", pid: p1.id, done: false, due: 5 },
    { title: "Migration + QA", pid: p1.id, done: false, due: 14 },

    { title: "Auth revamp", pid: p2.id, done: true },
    { title: "First run experience", pid: p2.id, done: false, due: 3 },
    { title: "A/B testing framework", pid: p2.id, done: false, due: 8 },

    { title: "Discovery", pid: p3.id, done: true },
    { title: "Wireframes", pid: p3.id, done: false, due: 12 },
    { title: "Prototype", pid: p3.id, done: false, due: 30 },

    { title: "Case study #1", pid: p4.id, done: true },
    { title: "Blog post: Prisma 7 adapter", pid: p4.id, done: false, due: 4 },
  ];
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    await db.milestone.create({ data: { title: m.title, projectId: m.pid, done: m.done, order: i, dueDate: m.due ? daysFromNow(m.due) : null } });
  }

  console.log("Seeding tasks…");
  const tasks = [
    { title: "Ship hero animation refactor", client: acme.id, project: p1.id, status: "today", priority: "high", emoji: "✨", estimatedMin: 90, dueDate: daysFromNow(0, 17), dueTime: "17:00" },
    { title: "Review Nova onboarding flow with founders", client: nova.id, project: p2.id, status: "today", priority: "critical", emoji: "🚀", estimatedMin: 60, dueDate: daysFromNow(0, 15), dueTime: "15:00" },
    { title: "Fix flaky checkout test", client: acme.id, project: p1.id, status: "in_progress", priority: "medium", emoji: "🧪", estimatedMin: 45, dueDate: daysFromNow(0, 11), dueTime: "11:00" },
    { title: "Post weekly update", client: personal.id, project: p4.id, status: "today", priority: "low", emoji: "📝", estimatedMin: 25, dueDate: daysFromNow(0, 20), dueTime: "20:00" },
    { title: "Deep work: onboarding empty states", client: nova.id, project: p2.id, status: "today", priority: "high", emoji: "🎨", estimatedMin: 120, scheduledFor: daysFromNow(0, 10), dueTime: "10:00" },

    { title: "Design review with Acme", client: acme.id, project: p1.id, status: "tomorrow", priority: "high", emoji: "🖼️", dueDate: daysFromNow(1, 14), dueTime: "14:00", estimatedMin: 60 },
    { title: "Prisma migration follow-up", client: nova.id, project: p2.id, status: "tomorrow", priority: "medium", emoji: "🗄️", dueDate: daysFromNow(1, 10), dueTime: "10:00", estimatedMin: 90 },

    { title: "Prepare Luma discovery deck", client: luma.id, project: p3.id, status: "planned", priority: "high", emoji: "📊", dueDate: daysFromNow(3, 16), estimatedMin: 120 },
    { title: "Publish blog: Prisma 7 adapter", client: personal.id, project: p4.id, status: "planned", priority: "medium", emoji: "📰", dueDate: daysFromNow(4), estimatedMin: 90 },
    { title: "Invoice Acme — March", client: acme.id, status: "planned", priority: "medium", emoji: "💸", dueDate: daysFromNow(6) },
    { title: "Set up Sentry for Nova", client: nova.id, project: p2.id, status: "planned", priority: "medium", emoji: "🛰️", dueDate: daysFromNow(8), estimatedMin: 60 },

    { title: "Reply to Luma legal thread", client: luma.id, project: p3.id, status: "waiting", priority: "critical", emoji: "⚖️", dueDate: daysFromNow(-2), estimatedMin: 30 },
    { title: "Add subresource-integrity headers", client: acme.id, project: p1.id, status: "planned", priority: "low", dueDate: daysFromNow(-4), estimatedMin: 30 },

    { title: "Explore edge functions for Acme APIs", status: "inbox", priority: "low", emoji: "💡" },
    { title: "Idea: newsletter opt-in modal", status: "inbox", priority: "low", emoji: "✉️" },
    { title: "Read pricing framework article", status: "inbox", priority: "low", emoji: "📚" },
    { title: "Think about Nova pricing tiers", status: "inbox", priority: "medium", emoji: "💭" },

    { title: "Refactor tokens system", client: acme.id, project: p1.id, status: "completed", priority: "medium", completedAt: daysFromNow(0, 8), emoji: "✅" },
    { title: "Set up analytics on Nova app", client: nova.id, project: p2.id, status: "completed", priority: "medium", completedAt: daysFromNow(-1, 15), emoji: "✅" },
    { title: "First case study drafted", client: personal.id, project: p4.id, status: "completed", priority: "low", completedAt: daysFromNow(-3, 20), emoji: "✅" },
  ];

  const created = [];
  for (const t of tasks) {
    const rec = await db.task.create({
      data: {
        title: t.title, description: null,
        status: t.status ?? "planned",
        priority: t.priority ?? "medium",
        estimatedMin: t.estimatedMin ?? null,
        dueDate: t.dueDate ?? null, dueTime: t.dueTime ?? null, scheduledFor: t.scheduledFor ?? null,
        clientId: t.client ?? null, projectId: t.project ?? null,
        emoji: t.emoji ?? null, completedAt: t.completedAt ?? null,
        pinned: t.title === "Ship hero animation refactor",
      },
    });
    created.push(rec);
  }

  await db.checklistItem.createMany({ data: [
    { taskId: created[0].id, text: "Extract easing tokens", order: 0, done: true },
    { taskId: created[0].id, text: "Rebuild parallax layers", order: 1, done: true },
    { taskId: created[0].id, text: "QA on mobile", order: 2 },
  ]});

  console.log("Notes…");
  await db.note.createMany({ data: [
    { title: "Acme design system audit", body: "# Audit\n\n- Buttons: 5 variants ✅\n- Cards: needs consolidation\n- Motion: standardize easing\n", kind: "note", clientId: acme.id, projectId: p1.id },
    { title: "Nova founders sync — Mar 2", body: "**Attendees:** J, R, M\n\n- Decided to A/B test onboarding\n- Prioritize activation over retention this sprint\n", kind: "meeting", clientId: nova.id },
    { title: "Daily journal", body: "Shipped a lot today. Felt momentum on Nova. Rest early.", kind: "journal" },
    { title: "Remember", body: "Ship > perfect.", kind: "sticky", color: "#FBBF24" },
    { title: "Focus", body: "Write more. Meet less.", kind: "sticky", color: "#A78BFA" },
    { title: "Wins", body: "Onboarding graph looking cleaner every day.", kind: "sticky", color: "#34D399" },
  ]});

  console.log("Invoices + meetings…");
  await db.invoice.createMany({ data: [
    { clientId: acme.id, number: "AC-2201", amount: 4800, status: "paid", issuedAt: daysFromNow(-45), paidAt: daysFromNow(-30) },
    { clientId: acme.id, number: "AC-2202", amount: 4800, status: "sent", issuedAt: daysFromNow(-15) },
    { clientId: nova.id, number: "NV-0007", amount: 9800, status: "overdue", issuedAt: daysFromNow(-40) },
    { clientId: luma.id, number: "LU-0004", amount: 3200, status: "paid", issuedAt: daysFromNow(-60), paidAt: daysFromNow(-52) },
  ]});
  await db.meeting.createMany({ data: [
    { clientId: acme.id, title: "Weekly sync", startsAt: daysFromNow(2, 15), notes: "Milestone review" },
    { clientId: nova.id, title: "Onboarding demo", startsAt: daysFromNow(1, 15) },
    { clientId: luma.id, title: "Kickoff", startsAt: daysFromNow(6, 10) },
  ]});

  console.log("Focus sessions + activity…");
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    await db.focusSession.create({ data: { startedAt: d, endedAt: new Date(d.getTime() + 25 * 60000), minutes: 25 + (i * 5), kind: "focus" } });
  }
  await db.activity.createMany({ data: [
    { kind: "task.completed", entity: "task", entityId: created[created.length-1].id, title: "First case study drafted" },
    { kind: "task.created", entity: "task", entityId: created[0].id, title: "Ship hero animation refactor" },
    { kind: "client.created", entity: "client", entityId: nova.id, title: "Nova Labs added to roster" },
    { kind: "project.created", entity: "project", entityId: p2.id, title: "Onboarding revamp created" },
    { kind: "note.created", entity: "note", title: "Daily journal" },
  ]});

  console.log("Done. Enjoy Todu.");
}

main().finally(() => process.exit(0));
