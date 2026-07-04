import type { Strategy } from "@/types";

export const STRATEGIES: Strategy[] = [
  {
    id: "ssg",
    label: "SSG",
    fullName: "Static Site Generation",
    tagline: "Pre-built at deploy time, served from CDN edge",
    color: "bg-emerald-500",
    accentHex: "#10b981",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-400",
  },
  {
    id: "ssr",
    label: "SSR",
    fullName: "Server-side Rendering",
    tagline: "Built on every request, always fresh",
    color: "bg-blue-500",
    accentHex: "#3b82f6",
    textColor: "text-blue-700",
    borderColor: "border-blue-400",
  },
  {
    id: "isr",
    label: "ISR",
    fullName: "Incremental Static Regeneration",
    tagline: "Static speed + background refresh on a schedule",
    color: "bg-violet-500",
    accentHex: "#8b5cf6",
    textColor: "text-violet-700",
    borderColor: "border-violet-400",
  },
  {
    id: "csr",
    label: "CSR",
    fullName: "Client-side Rendering",
    tagline: "JS shell first, data fetched in the browser",
    color: "bg-amber-500",
    accentHex: "#f59e0b",
    textColor: "text-amber-700",
    borderColor: "border-amber-400",
  },
  {
    id: "ppr",
    label: "PPR",
    fullName: "Partial Prerendering",
    tagline: "Static shell + streamed dynamic slots",
    color: "bg-rose-500",
    accentHex: "#f43f5e",
    textColor: "text-rose-700",
    borderColor: "border-rose-400",
  },
];

export const STRATEGY_MAP = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s]),
) as Record<string, Strategy>;
