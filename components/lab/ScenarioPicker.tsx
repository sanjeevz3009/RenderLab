"use client";

import { useShallow } from "zustand/react/shallow";
import { SCENARIOS } from "@/lib/scenarios";
import { useLabStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ScenarioPicker() {
  const { activeScenario, setScenario } = useLabStore(
    useShallow((s) => ({
      activeScenario: s.activeScenario,
      setScenario: s.setScenario,
    })),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Scenario
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SCENARIOS.map((sc) => {
          const isActive = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left transition-all duration-150 text-sm",
                isActive
                  ? "border-slate-900 bg-slate-900 text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
              )}
            >
              <span className="text-xl shrink-0">{sc.icon}</span>
              <span className="font-medium leading-tight">{sc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
