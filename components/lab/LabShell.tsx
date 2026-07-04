"use client";

import { useLabStore } from "@/lib/store";
import { STRATEGY_MAP } from "@/lib/strategies";
import { StrategySelector } from "@/components/lab/StrategySelector";
import { StrategyExplainer } from "@/components/lab/StrategyExplainer";
import { ScenarioPicker } from "@/components/lab/ScenarioPicker";
import {
  ScenarioVerdict,
  ScenarioComparisonTable,
} from "@/components/lab/ScenarioVerdict";
import { ConfigPanel } from "@/components/config/ConfigPanel";
import { FlowVisualiser } from "@/components/visualiser/FlowVisualiser";
import { MetricsPanel } from "@/components/metrics/MetricsPanel";

export function LabShell() {
  const activeStrategy = useLabStore((s) => s.activeStrategy);
  const strategy = STRATEGY_MAP[activeStrategy];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-slate-900">
              render<span className="text-slate-400">.</span>lab
            </span>
            <span className="hidden sm:block text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
              Interactive rendering strategy simulator - Built by Sanjeev Srithevan
            </span>
          </div>
          <a
            href="https://sanj.ninja/blog/yet-another-front-end-rendering-strategies-article/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            Based on sanj.ninja/blog →
          </a>
        </div>
      </header>

      {/* Strategy selector */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <StrategySelector />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6">
          {/* Left: visualiser + scenario */}
          <div className="space-y-6">
            {/* Animated flow visualiser */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: strategy.accentHex }}
                />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Request Lifecycle
                </h2>
              </div>
              <FlowVisualiser />
            </section>

            {/* Scenario selector + verdict */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <ScenarioPicker />
              <ScenarioVerdict />
            </section>

            {/* Comparison table */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <ScenarioComparisonTable />
            </section>

            {/* Strategy deep-dive */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <StrategyExplainer />
            </section>
          </div>

          {/* Right sidebar: metrics + config */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <MetricsPanel />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <ConfigPanel />
            </div>

            {/* Article attribution */}
            <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2 text-sm">
              <p className="font-bold text-xs uppercase tracking-widest text-slate-400">
                Article
              </p>
              <p className="leading-snug font-medium">
                Yet Another Front-end Rendering Strategies Article
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                A practical guide to SSR, CSR, SSG, ISR and PPR - written by
                Sanjeev Srithevan.
              </p>
              <a
                href="https://sanj.ninja/blog/yet-another-front-end-rendering-strategies-article/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-slate-300 hover:text-white transition-colors mt-1"
              >
                Read the article →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
