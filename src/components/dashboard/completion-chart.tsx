"use client";
import { motion } from "framer-motion";

export function CompletionChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="flex h-32 items-end gap-1.5">
      {data.map((d, i) => {
        const h = (d.count / max) * 100;
        return (
          <motion.div
            key={d.day}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${Math.max(4, h)}%`, opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="group relative flex-1 rounded-t-lg bg-gradient-to-t from-brand-500/20 to-brand-500/80 hover:from-brand-500/40 hover:to-accent"
            title={`${d.day}: ${d.count}`}
          />
        );
      })}
    </div>
  );
}

export function ProgressRing({ value, size = 88, stroke = 8, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#ring-grad)" strokeWidth={stroke} strokeLinecap="round"
          fill="none"
          initial={{ strokeDasharray: `${c} ${c}`, strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute text-center leading-tight">
        <div className="text-lg font-semibold text-white">{Math.round(value)}%</div>
        {label && <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>}
      </div>
    </div>
  );
}
