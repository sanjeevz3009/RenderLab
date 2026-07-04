"use client";

import { motion } from "framer-motion";
import { STRATEGIES } from "@/lib/strategies";
import { useLabStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StrategySelector() {
  const { activeStrategy, setStrategy } = useLabStore();

  return (
    <div className="flex gap-2 flex-wrap">
      {STRATEGIES.map((s) => {
        const isActive = s.id === activeStrategy;
        return (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id)}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all duration-200 border-2",
              isActive
                ? `${s.color} text-white border-transparent shadow-lg`
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="strategy-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: s.accentHex, opacity: 0.15 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
