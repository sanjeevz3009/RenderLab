"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { buildSimulation } from "@/lib/simulation/engine";
import { useLabStore } from "@/lib/store";
import { formatMs, scoreToBg, scoreToColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  invert?: boolean;
  accentHex: string;
}

function MetricBar({
  label,
  value,
  max,
  unit,
  invert,
  accentHex,
}: MetricBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const scorePct = invert ? 100 - pct : pct;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline text-sm">
        <span className="text-slate-600 font-medium">{label}</span>
        <span
          className={cn("font-mono font-bold text-xs", scoreToColor(scorePct))}
        >
          {unit ? `${value}${unit}` : formatMs(value)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentHex }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface ScoreGaugeProps {
  label: string;
  score: number;
  description: string;
  invert?: boolean;
}

function ScoreGauge({ label, score, description, invert }: ScoreGaugeProps) {
  const displayScore = invert ? Math.round(score) : Math.round(score);
  const colorScore = invert ? 100 - score : score;

  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div
        className={cn(
          "text-2xl font-black font-mono",
          scoreToColor(colorScore),
        )}
      >
        {displayScore}
      </div>
      <div className={cn("w-8 h-1.5 rounded-full", scoreToBg(colorScore))} />
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 leading-snug">{description}</div>
    </div>
  );
}

export function MetricsPanel() {
  const { activeStrategy, config } = useLabStore();
  const result = useMemo(
    () => buildSimulation(activeStrategy, config),
    [activeStrategy, config],
  );
  const { metrics } = result;

  // Get strategy accent colour
  const accentMap: Record<string, string> = {
    ssg: "#10b981",
    ssr: "#3b82f6",
    isr: "#8b5cf6",
    csr: "#f59e0b",
    ppr: "#f43f5e",
  };
  const accent = accentMap[activeStrategy] ?? "#64748b";

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Simulated Metrics
      </p>

      {/* Core Web Vitals timing */}
      <div className="space-y-3">
        <MetricBar
          label="TTFB"
          value={metrics.ttfb}
          max={2000}
          invert
          accentHex={accent}
        />
        <MetricBar
          label="FCP"
          value={metrics.fcp}
          max={4000}
          invert
          accentHex={accent}
        />
        <MetricBar
          label="LCP"
          value={metrics.lcp}
          max={6000}
          invert
          accentHex={accent}
        />
        <MetricBar
          label="TTI"
          value={metrics.tti}
          max={6000}
          invert
          accentHex={accent}
        />
      </div>

      {/* Score gauges */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        <ScoreGauge
          label="SEO"
          score={metrics.seoScore}
          description="Crawlability"
        />
        <ScoreGauge
          label="Freshness"
          score={metrics.freshnessScore}
          description="Content age"
        />
        <ScoreGauge
          label="Infra cost"
          score={metrics.infraCostScore}
          description="Lower = cheaper"
          invert
        />
      </div>

      {/* Build time badge */}
      {metrics.buildTimeMs > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          <span className="font-mono">⏱</span>
          <span>
            Estimated build time:{" "}
            <strong className="text-slate-800">
              {formatMs(metrics.buildTimeMs)}
            </strong>{" "}
            for {config.sitePageCount.toLocaleString()} pages
          </span>
        </div>
      )}
    </div>
  );
}
