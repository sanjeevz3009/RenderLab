"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useLabStore } from "@/lib/store";
import { SCENARIO_MAP } from "@/lib/scenarios";
import { STRATEGY_MAP } from "@/lib/strategies";
import { cn } from "@/lib/utils";

const VERDICT_STYLES = {
  great: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    badge: "bg-emerald-500 text-white",
    label: "Great fit",
    icon: "✓",
  },
  ok: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    badge: "bg-amber-500 text-white",
    label: "Works",
    icon: "~",
  },
  poor: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-400 text-white",
    label: "Poor fit",
    icon: "✕",
  },
};

export function ScenarioVerdict() {
  const { activeStrategy, activeScenario } = useLabStore(
    useShallow((s) => ({
      activeStrategy: s.activeStrategy,
      activeScenario: s.activeScenario,
    })),
  );
  const strategy = STRATEGY_MAP[activeStrategy];

  if (activeScenario === "custom") {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400 text-center">
        Select a scenario above to see how {strategy.label} fits.
      </div>
    );
  }

  const scenario = SCENARIO_MAP[activeScenario];
  if (!scenario) return null;

  const rec = scenario.recommendations[activeStrategy];
  const styles = VERDICT_STYLES[rec.verdict];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeStrategy}-${activeScenario}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "rounded-xl border-2 p-4 space-y-2",
          styles.bg,
          styles.border,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenario.icon}</span>
          <span className="font-semibold text-sm text-slate-700">
            {scenario.label}
          </span>
          <span
            className={cn(
              "ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full",
              styles.badge,
            )}
          >
            {styles.icon} {styles.label}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{rec.reason}</p>
      </motion.div>
    </AnimatePresence>
  );
}

// Full comparison table across all strategies for the active scenario
export function ScenarioComparisonTable() {
  const { activeScenario, setStrategy, activeStrategy } = useLabStore(
    useShallow((s) => ({
      activeScenario: s.activeScenario,
      setStrategy: s.setStrategy,
      activeStrategy: s.activeStrategy,
    })),
  );

  if (activeScenario === "custom") return null;
  const scenario = SCENARIO_MAP[activeScenario];
  if (!scenario) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        All strategies for: {scenario.icon} {scenario.label}
      </p>
      <div className="space-y-1.5">
        {(["ssg", "ssr", "isr", "csr", "ppr"] as const).map((sid) => {
          const rec = scenario.recommendations[sid];
          const strat = STRATEGY_MAP[sid];
          const styles = VERDICT_STYLES[rec.verdict];
          const isActive = sid === activeStrategy;
          return (
            <button
              key={sid}
              onClick={() => setStrategy(sid)}
              aria-pressed={isActive}
              className={cn(
                "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all duration-150",
                isActive
                  ? "border-slate-900 shadow-sm"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50",
              )}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ backgroundColor: strat.accentHex }}
              >
                {strat.label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {strat.fullName}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded-md",
                      styles.badge,
                    )}
                  >
                    {styles.icon}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {rec.reason.slice(0, 80)}…
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
