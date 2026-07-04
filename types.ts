// ─── Rendering Strategies ─────────────────────────────────────────────────────

export type StrategyId = "ssg" | "ssr" | "isr" | "csr" | "ppr";

export interface Strategy {
  id: StrategyId;
  label: string;
  fullName: string;
  tagline: string;
  color: string; // Tailwind bg class
  accentHex: string; // raw hex for canvas/SVG animations
  textColor: string; // Tailwind text class for badges
  borderColor: string; // Tailwind border class
}

// ─── Simulation Config ────────────────────────────────────────────────────────

export interface SimConfig {
  /** How frequently content changes, in seconds (0 = static/never) */
  dataChangeInterval: number;
  /** Artificial server latency in ms */
  serverLatency: number;
  /** JS bundle size in KB (affects CSR) */
  jsBundleKb: number;
  /** ISR revalidation window in seconds */
  isrRevalidate: number;
  /** Number of pages in the site (affects SSG build time) */
  sitePageCount: number;
  /** Avg daily unique visitors (affects SSR cost) */
  dailyVisitors: number;
}

export type ScenarioId =
  | "marketing-site"
  | "ecommerce"
  | "news-platform"
  | "saas-dashboard"
  | "blog"
  | "social-feed";

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  icon: string;
  config: SimConfig;
  /** Which strategies are recommended and why */
  recommendations: Record<
    StrategyId,
    { verdict: "great" | "ok" | "poor"; reason: string }
  >;
}

// ─── Simulation Step / Timeline ───────────────────────────────────────────────

export type ActorId = "browser" | "cdn" | "server" | "db" | "edge";

export interface TimelineStep {
  id: string;
  label: string;
  description: string;
  /** duration in ms this step takes visually */
  durationMs: number;
  from: ActorId;
  to: ActorId;
  /** what is travelling along the arrow */
  payload:
    | "request"
    | "html"
    | "js-bundle"
    | "api-call"
    | "data"
    | "stream"
    | "static-file";
  phase: "build" | "request" | "server" | "client" | "complete";
}

export interface SimulationResult {
  strategy: StrategyId;
  config: SimConfig;
  timeline: TimelineStep[];
  metrics: MetricsResult;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface MetricsResult {
  ttfb: number; // ms
  fcp: number; // ms
  lcp: number; // ms
  tti: number; // ms
  seoScore: number; // 0-100
  freshnessScore: number; // 0-100
  infraCostScore: number; // 0-100 (lower = cheaper, we invert for display)
  buildTimeMs: number; // ms (0 if not applicable)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface LabState {
  activeStrategy: StrategyId;
  activeScenario: ScenarioId | "custom";
  config: SimConfig;
  isRunning: boolean;
  isComplete: boolean;
  isPaused: boolean;
  currentStepIndex: number;

  setStrategy: (id: StrategyId) => void;
  setScenario: (id: ScenarioId | "custom") => void;
  updateConfig: (patch: Partial<SimConfig>) => void;
  startSimulation: () => void;
  advanceStep: () => void;
  rewindStep: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  completeSimulation: () => void;
  resetSimulation: () => void;
}
