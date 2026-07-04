import { create } from "zustand";
import type { LabState, StrategyId, ScenarioId, SimConfig } from "@/types";
import { SCENARIOS, DEFAULT_CONFIG } from "@/lib/scenarios";

export const useLabStore = create<LabState>((set) => ({
  activeStrategy: "ssg",
  activeScenario: "marketing-site",
  config: { ...DEFAULT_CONFIG },
  isRunning: false,
  isComplete: false,
  isPaused: false,
  completedStepIds: [],
  currentStepIndex: -1,

  setStrategy: (id: StrategyId) =>
    set({
      activeStrategy: id,
      isRunning: false,
      isComplete: false,
      isPaused: false,
      completedStepIds: [],
      currentStepIndex: -1,
    }),

  setScenario: (id: ScenarioId | "custom") => {
    if (id === "custom") {
      set({ activeScenario: "custom" });
      return;
    }
    const scenario = SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;
    set({
      activeScenario: id,
      config: { ...scenario.config },
      isRunning: false,
      isComplete: false,
      isPaused: false,
      completedStepIds: [],
      currentStepIndex: -1,
    });
  },

  updateConfig: (patch: Partial<SimConfig>) =>
    set((state) => ({
      config: { ...state.config, ...patch },
      activeScenario: "custom",
      isRunning: false,
      isComplete: false,
      isPaused: false,
      completedStepIds: [],
      currentStepIndex: -1,
    })),

  startSimulation: () =>
    set({
      isRunning: true,
      isComplete: false,
      isPaused: false,
      completedStepIds: [],
      currentStepIndex: 0,
    }),

  advanceStep: () =>
    set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),

  rewindStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(0, state.currentStepIndex - 1),
    })),

  pauseSimulation: () => set({ isPaused: true }),

  resumeSimulation: () => set({ isPaused: false }),

  completeSimulation: () =>
    set({ isRunning: false, isComplete: true, isPaused: false }),

  resetSimulation: () =>
    set({
      isRunning: false,
      isComplete: false,
      isPaused: false,
      completedStepIds: [],
      currentStepIndex: -1,
    }),
}));
