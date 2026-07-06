import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtRelative(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), "month");
  return rtf.format(Math.round(diff / (86400 * 365)), "year");
}

export function priorityMeta(p: string) {
  switch (p) {
    case "critical": return { label: "Critical", color: "#F87171", ring: "ring-red-400/30", dot: "bg-red-400" };
    case "high":     return { label: "High",     color: "#FBBF24", ring: "ring-amber-400/30", dot: "bg-amber-400" };
    case "medium":   return { label: "Medium",   color: "#4F7CFF", ring: "ring-blue-400/30", dot: "bg-blue-400" };
    default:         return { label: "Low",      color: "#7A7F8C", ring: "ring-zinc-400/20", dot: "bg-zinc-400" };
  }
}

export function statusMeta(s: string) {
  const m: Record<string, { label: string; tint: string }> = {
    inbox:       { label: "Inbox",       tint: "text-fg-dim" },
    planned:     { label: "Planned",     tint: "text-brand-400" },
    today:       { label: "Today",       tint: "text-brand-400" },
    tomorrow:    { label: "Tomorrow",    tint: "text-accent" },
    in_progress: { label: "In progress", tint: "text-amber-400" },
    waiting:     { label: "Waiting",     tint: "text-zinc-400" },
    blocked:     { label: "Blocked",     tint: "text-red-400" },
    completed:   { label: "Completed",   tint: "text-emerald-400" },
    archived:    { label: "Archived",    tint: "text-zinc-500" },
  };
  return m[s] ?? { label: s, tint: "text-fg-dim" };
}

export function safeJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}
