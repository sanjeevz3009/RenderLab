"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLabStore } from "@/lib/store";

const COMMIT_DELAY_MS = 120;

interface SliderProps {
  id: string;
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function ConfigSlider({
  id,
  label,
  description,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: SliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const commitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Adjust local state when the store's committed value changes externally
  // (e.g. a scenario switch), without an Effect - see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, []);

  function handleChange(v: number) {
    setLocalValue(v);
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    commitTimerRef.current = setTimeout(() => onChange(v), COMMIT_DELAY_MS);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        <span className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
          {format(localValue)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full accent-slate-900 h-1.5"
      />
      <p className="text-xs text-slate-400 leading-snug">{description}</p>
    </div>
  );
}

function formatDataChange(v: number): string {
  if (v < 60) return `${v}s`;
  if (v < 3600) return `${Math.round(v / 60)}min`;
  if (v < 86400) return `${Math.round(v / 3600)}hr`;
  return `${Math.round(v / 86400)}d`;
}

export function ConfigPanel() {
  const { config, updateConfig } = useLabStore(
    useShallow((s) => ({ config: s.config, updateConfig: s.updateConfig })),
  );

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Configuration
      </p>

      <ConfigSlider
        id="config-data-change-interval"
        label="Data change frequency"
        description="How often your content updates. Affects whether cached pages go stale."
        value={config.dataChangeInterval}
        min={1}
        max={86400}
        step={1}
        format={formatDataChange}
        onChange={(v) => updateConfig({ dataChangeInterval: v })}
      />

      <ConfigSlider
        id="config-server-latency"
        label="Server latency"
        description="Time for the server to fetch data from the database."
        value={config.serverLatency}
        min={20}
        max={2000}
        step={10}
        format={(v) => `${v}ms`}
        onChange={(v) => updateConfig({ serverLatency: v })}
      />

      <ConfigSlider
        id="config-js-bundle-kb"
        label="JS bundle size"
        description="Total JavaScript shipped to the browser. Directly hurts CSR performance."
        value={config.jsBundleKb}
        min={20}
        max={2000}
        step={10}
        format={(v) => `${v}KB`}
        onChange={(v) => updateConfig({ jsBundleKb: v })}
      />

      <ConfigSlider
        id="config-isr-revalidate"
        label="ISR revalidation window"
        description="How long ISR keeps a cached page before triggering a background regeneration."
        value={config.isrRevalidate}
        min={5}
        max={86400}
        step={5}
        format={formatDataChange}
        onChange={(v) => updateConfig({ isrRevalidate: v })}
      />

      <ConfigSlider
        id="config-site-page-count"
        label="Page count"
        description="Total pages in the site. Affects SSG and ISR build times."
        value={config.sitePageCount}
        min={1}
        max={100000}
        step={100}
        format={(v) => v.toLocaleString()}
        onChange={(v) => updateConfig({ sitePageCount: v })}
      />

      <ConfigSlider
        id="config-daily-visitors"
        label="Daily visitors"
        description="Affects SSR infrastructure costs and CDN pressure."
        value={config.dailyVisitors}
        min={100}
        max={1000000}
        step={1000}
        format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString())}
        onChange={(v) => updateConfig({ dailyVisitors: v })}
      />
    </div>
  );
}
