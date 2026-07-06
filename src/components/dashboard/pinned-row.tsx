"use client";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import { PriorityDot } from "@/components/ui/badge";

export function PinnedRow({ tasks }: { tasks: { id: string; title: string; priority: string }[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-3"
        >
          <div className="absolute right-2 top-2 text-white/30"><Pin className="h-3.5 w-3.5" /></div>
          <div className="flex items-center gap-2"><PriorityDot priority={t.priority} /></div>
          <div className="mt-1 line-clamp-2 text-sm font-medium text-white">{t.title}</div>
        </motion.div>
      ))}
    </div>
  );
}
