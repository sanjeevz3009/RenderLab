import { useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { buildSimulation } from "@/lib/simulation-engine";
import { useLabStore } from "@/lib/store";
import { formatMs } from "@/lib/utils";
import type { ActorId } from "@/types";
import { STRATEGY_MAP } from "@/lib/strategies";

// Actor layout
const ACTOR_CONFIG: Record<
  ActorId,
  { label: string; icon: string; col: number }
> = {
  browser: { label: "Browser", icon: "🖥️", col: 0 },
  cdn: { label: "CDN / Edge", icon: "⚡", col: 1 },
  edge: { label: "Edge Runtime", icon: "🔷", col: 2 },
  server: { label: "Origin Server", icon: "🖧", col: 3 },
  db: { label: "Database / API", icon: "🗄️", col: 4 },
};

const STRATEGY_ACTORS: Record<string, ActorId[]> = {
  ssg: ["browser", "cdn", "server"],
  ssr: ["browser", "server", "db"],
  isr: ["browser", "cdn", "server", "db"],
  csr: ["browser", "cdn", "server"],
  ppr: ["browser", "edge", "server", "db"],
};

const PAYLOAD_COLOURS: Record<string, string> = {
  request: "#64748b",
  html: "#10b981",
  "js-bundle": "#f59e0b",
  "api-call": "#3b82f6",
  data: "#8b5cf6",
  stream: "#f43f5e",
  "static-file": "#06b6d4",
};

const PAYLOAD_LABELS: Record<string, string> = {
  request: "HTTP Request",
  html: "HTML",
  "js-bundle": "JS Bundle",
  "api-call": "API Call",
  data: "JSON Data",
  stream: "HTML Stream",
  "static-file": "Static File",
};

const PHASE_STYLES: Record<string, { bg: string; text: string }> = {
  build: { bg: "bg-cyan-100", text: "text-cyan-700" },
  request: { bg: "bg-slate-100", text: "text-slate-700" },
  server: { bg: "bg-blue-100", text: "text-blue-700" },
  client: { bg: "bg-amber-100", text: "text-amber-700" },
  complete: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

const MIN_STEP_MS = 4000;

// Component
export function FlowVisualiser() {
  const {
    activeStrategy,
    config,
    isRunning,
    isComplete,
    isPaused,
    currentStepIndex,
    advanceStep,
    rewindStep,
    pauseSimulation,
    resumeSimulation,
    completeSimulation,
    resetSimulation,
    startSimulation,
  } = useLabStore(
    useShallow((s) => ({
      activeStrategy: s.activeStrategy,
      config: s.config,
      isRunning: s.isRunning,
      isComplete: s.isComplete,
      isPaused: s.isPaused,
      currentStepIndex: s.currentStepIndex,
      advanceStep: s.advanceStep,
      rewindStep: s.rewindStep,
      pauseSimulation: s.pauseSimulation,
      resumeSimulation: s.resumeSimulation,
      completeSimulation: s.completeSimulation,
      resetSimulation: s.resetSimulation,
      startSimulation: s.startSimulation,
    })),
  );

  const result = useMemo(
    () => buildSimulation(activeStrategy, config),
    [activeStrategy, config],
  );
  const { timeline } = result;
  const strategy = STRATEGY_MAP[activeStrategy];
  const actors: ActorId[] = STRATEGY_ACTORS[activeStrategy] ?? [
    "browser",
    "server",
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  function restartSimulation() {
    resetSimulation();
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = setTimeout(() => startSimulation(), 50);
  }

  useEffect(() => {
    if (!isRunning || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const step = timeline[currentStepIndex];
    if (!step) {
      completeSimulation();
      return;
    }

    const displayDuration = Math.max(MIN_STEP_MS, step.durationMs);

    timerRef.current = setTimeout(() => {
      advanceStep();
    }, displayDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    isRunning,
    isPaused,
    currentStepIndex,
    timeline,
    advanceStep,
    completeSimulation,
  ]);

  const currentStep =
    (isRunning || isComplete) && currentStepIndex >= 0
      ? (timeline[currentStepIndex] ?? null)
      : null;
  const completedSteps =
    isRunning || isComplete ? timeline.slice(0, currentStepIndex) : [];

  const actorCount = actors.length;

  function getActorX(actorId: ActorId): number {
    const idx = actors.indexOf(actorId);
    if (actorCount === 1) return 50;
    return 8 + (idx / (actorCount - 1)) * 84;
  }

  const fromX = currentStep ? getActorX(currentStep.from) : 0;
  const toX = currentStep ? getActorX(currentStep.to) : 0;
  const isSelf = currentStep ? currentStep.from === currentStep.to : false;

  return (
    <div className="space-y-4">
      {/* Actor lane diagram */}
      <div
        className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
        style={{ height: 220 }}
      >
        {/* Vertical lane lines */}
        {actors.map((actorId) => {
          const x = getActorX(actorId);
          return (
            <div
              key={actorId}
              className="absolute top-14 bottom-0 w-px bg-slate-200"
              style={{ left: `${x}%`, transform: "translateX(-50%)" }}
            />
          );
        })}

        {/* Actor nodes */}
        {actors.map((actorId) => {
          const cfg = ACTOR_CONFIG[actorId];
          const x = getActorX(actorId);
          const isActive = !!(
            currentStep &&
            (currentStep.from === actorId || currentStep.to === actorId)
          );
          const isSelfActive = !!(
            currentStep &&
            isSelf &&
            currentStep.from === actorId
          );
          return (
            <div
              key={actorId}
              className="absolute top-3 flex flex-col items-center gap-1"
              style={{ left: `${x}%`, transform: "translateX(-50%)" }}
            >
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border-2"
                style={{
                  backgroundColor: isActive
                    ? strategy.accentHex + "22"
                    : "white",
                  borderColor: isActive ? strategy.accentHex : "#e2e8f0",
                }}
                animate={isSelfActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={
                  isSelfActive ? { duration: 0.6, repeat: Infinity } : {}
                }
              >
                {cfg.icon}
              </motion.div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {cfg.label}
              </span>
            </div>
          );
        })}

        {/* SVG arrow canvas */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill={strategy.accentHex} />
            </marker>
          </defs>

          {/* Completed steps as faded lines */}
          {completedSteps.map((step) => {
            const sx = getActorX(step.from);
            const ex = getActorX(step.to);
            if (sx === ex) return null;
            return (
              <line
                key={step.id}
                x1={`${sx}%`}
                y1="55%"
                x2={`${ex}%`}
                y2="55%"
                stroke={PAYLOAD_COLOURS[step.payload]}
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={0.25}
              />
            );
          })}

          {/* Animated current step arrow */}
          {currentStep && !isSelf && (
            <motion.line
              key={currentStep.id}
              x1={`${fromX}%`}
              y1="55%"
              x2={`${toX}%`}
              y2="55%"
              stroke={PAYLOAD_COLOURS[currentStep.payload]}
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: Math.max(
                  (MIN_STEP_MS / 1000) * 0.6,
                  currentStep.durationMs / 1000,
                ),
                ease: "linear",
              }}
            />
          )}
        </svg>

        {/* Payload badge travelling along the arrow */}
        <AnimatePresence>
          {currentStep && !isSelf && (
            <motion.div
              key={currentStep.id + "-badge"}
              className="absolute text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md"
              style={{
                backgroundColor: PAYLOAD_COLOURS[currentStep.payload],
                top: "calc(55% - 10px)",
                left: `${fromX}%`,
              }}
              animate={{ left: `${toX}%` }}
              transition={{
                duration: Math.max(
                  (MIN_STEP_MS / 1000) * 0.6,
                  currentStep.durationMs / 1000,
                ),
                ease: "linear",
              }}
            >
              {PAYLOAD_LABELS[currentStep.payload]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status overlays */}
        {!isRunning && !isComplete && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">
              Press Run to animate the request lifecycle
            </span>
          </div>
        )}
        {isPaused && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <span className="text-xs text-amber-500 font-semibold">
              ⏸ Paused
            </span>
          </div>
        )}
        {isComplete && (
          <motion.div
            className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-xs font-semibold text-emerald-600">
              ✓ Simulation complete
            </span>
          </motion.div>
        )}
      </div>

      {/* Step detail card */}
      <AnimatePresence mode="wait">
        {currentStep ? (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{
                  backgroundColor: PAYLOAD_COLOURS[currentStep.payload],
                }}
              >
                {PAYLOAD_LABELS[currentStep.payload]}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PHASE_STYLES[currentStep.phase]?.bg} ${PHASE_STYLES[currentStep.phase]?.text}`}
              >
                {currentStep.phase} phase
              </span>
              <span className="text-xs text-slate-400 font-mono ml-auto">
                {formatMs(currentStep.durationMs)}
              </span>
            </div>
            <p className="font-semibold text-sm text-slate-900">
              {currentStep.label}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentStep.description}
            </p>
          </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-400 text-center">
            {isComplete
              ? "All steps complete. Reset to run again or change the config."
              : "Step details will appear here during simulation."}
          </div>
        )}
      </AnimatePresence>

      {/* Timeline scrubber */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Timeline
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {timeline.map((step, idx) => {
            const isDone = (isRunning || isComplete) && idx < currentStepIndex;
            const isCurrent =
              (isRunning || isComplete) && idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className="flex items-center gap-1"
                title={step.label}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: Math.max(24, step.durationMs / 40),
                    backgroundColor: isCurrent
                      ? strategy.accentHex
                      : isDone
                        ? strategy.accentHex + "60"
                        : "#e2e8f0",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>0</span>
          <span>
            {formatMs(timeline.reduce((s, t) => s + t.durationMs, 0))} total
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning && !isComplete ? (
          <button
            onClick={restartSimulation}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ backgroundColor: strategy.accentHex }}
          >
            ▶ Run simulation
          </button>
        ) : isComplete ? (
          <button
            onClick={restartSimulation}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ backgroundColor: strategy.accentHex }}
          >
            ↩ Run again
          </button>
        ) : (
          <>
            <button
              onClick={rewindStep}
              disabled={currentStepIndex === 0}
              aria-label="Rewind one step"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ‹‹
            </button>
            <button
              onClick={isPaused ? resumeSimulation : pauseSimulation}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: strategy.accentHex }}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              onClick={advanceStep}
              disabled={currentStepIndex >= timeline.length - 1}
              aria-label="Advance one step"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ››
            </button>
            <button
              onClick={resetSimulation}
              aria-label="Reset simulation"
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              ■
            </button>
          </>
        )}
      </div>
    </div>
  );
}
