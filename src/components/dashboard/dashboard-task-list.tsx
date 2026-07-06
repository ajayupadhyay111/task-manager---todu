"use client";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { TaskRow, type TaskRowData } from "@/components/task/task-row";
import { useRouter } from "next/navigation";

export function DashboardTaskList({ initial }: { initial: TaskRowData[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <TaskRow key={t.id} task={t}
            onChange={(id, patch) => {
              setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
              setTimeout(() => router.refresh(), 400);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
