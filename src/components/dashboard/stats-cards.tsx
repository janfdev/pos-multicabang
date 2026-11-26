"use client";

import { motion, type Variants } from "motion/react";
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatItem {
  label: string;
  value: string;
  delta: string;
  subtitle?: string;
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 px-6 pt-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((s) => {
        const isNegative = s.delta.trim().startsWith("-");

        return (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-2xl border border-gray-100 bg-white p-4.5 text-left transition-all duration-150 shadow-2xs hover:border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 dark:text-neutral-500">
              <span>{s.label}</span>
              <Info size={13} className="opacity-60" />
            </div>

            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-neutral-50">
              {s.value}
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
              {s.subtitle && <span>{s.subtitle}</span>}
              <span
                className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                  isNegative
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                    : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-400"
                }`}
              >
                {isNegative ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
                {s.delta}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export default StatsCards;
