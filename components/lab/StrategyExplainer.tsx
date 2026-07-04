"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLabStore } from "@/lib/store";
import { STRATEGY_MAP } from "@/lib/strategies";
import { cn } from "@/lib/utils";

const CONTENT: Record<
  string,
  {
    what: string;
    shines: string[];
    tradeoffs: string[];
    useCases: string[];
  }
> = {
  ssg: {
    what: "HTML is generated at build time. Your server doesn't render anything at request time - it just serves pre-built files from a CDN edge node near the user.",
    shines: [
      "Ultra-fast TTFB - CDN serves cached HTML without touching a server",
      "Excellent SEO - crawlers receive full HTML immediately",
      "Zero server cost per request - no compute on every visit",
      "Lowest infrastructure costs of any strategy",
    ],
    tradeoffs: [
      "Content is stale until the next build and deploy",
      "Build times grow with page count (100k pages = slow builds)",
      "Not suitable for personalised or frequently changing data",
    ],
    useCases: [
      "Blogs",
      "Marketing sites",
      "Documentation",
      "Portfolio sites",
      "Landing pages",
    ],
  },
  ssr: {
    what: "The page is rendered on the server on every request. When a user visits, the server fetches fresh data, builds the HTML, and sends it to the browser. Nothing is cached at the page level by default.",
    shines: [
      "Always-fresh content - never stale",
      "Fully SEO-friendly - complete HTML on first byte",
      "Works for personalised, per-user content",
      "Great for request-specific data (auth, cookies, geo)",
    ],
    tradeoffs: [
      "Higher TTFB - server must fetch data before responding",
      "Server load scales with traffic - expensive at scale without caching",
      "JS still hydrates client-side - not magically interactive",
      "Complex pages repeatedly rendered = infrastructure cost",
    ],
    useCases: [
      "Social media feeds",
      "Financial dashboards",
      "SaaS authenticated pages",
      "E-commerce checkout",
      "Live sports scoreboards",
    ],
  },
  isr: {
    what: "Pages are generated statically at build time and cached. After a configured revalidation window, the next request triggers a background regeneration. Users always get the cached version - never a slow server render.",
    shines: [
      "Static speed with dynamic flexibility",
      "Background regeneration - users never wait for a server render",
      "Scales to millions of pages without painful full rebuilds",
      "Supports on-demand and webhook-triggered revalidation",
    ],
    tradeoffs: [
      "Content can lag behind by up to one revalidation window",
      "Cache invalidation strategies require careful thought",
      "Shared cache means it can't cache per-user content",
      "More complexity than pure SSG or SSR",
    ],
    useCases: [
      "Large e-commerce platforms (product pages)",
      "News websites",
      "CMS-driven content",
      "Marketplace listings",
      "Sites with thousands to millions of pages",
    ],
  },
  csr: {
    what: "The server sends a near-empty HTML shell with script tags. The browser downloads JavaScript, executes it, fetches data via API, then renders the UI entirely on the client. The server is only involved in the initial shell and API calls.",
    shines: [
      "Rich, app-like interactivity after initial load",
      "Seamless page transitions without full reloads",
      "Real-time UI updates without server round-trips",
      "Reduced server rendering cost",
    ],
    tradeoffs: [
      "Blank screen while JS downloads and executes (FCP hurt badly)",
      "SEO is weakest here - crawlers may see an empty shell",
      "Large JS bundles tank Core Web Vitals on slow devices",
      "More complex client-side state management required",
    ],
    useCases: [
      "Admin dashboards",
      "Internal enterprise tools",
      "Chat and messaging apps",
      "Kanban / project management",
      "Real-time collaborative editors",
    ],
  },
  ppr: {
    what: "A hybrid of SSG and SSR. A static shell is prerendered and cached at the edge. Dynamic Suspense boundary slots stream in from the server progressively - without blocking the initial render.",
    shines: [
      "SSG-speed shell + SSR-fresh dynamic content in one page",
      "Users see meaningful content almost instantly",
      "Streaming avoids blocking the entire page on slow data",
      "Better Core Web Vitals than full SSR",
    ],
    tradeoffs: [
      "Still experimental / evolving in Next.js",
      "Suspense boundary design becomes critical",
      "Separating static and dynamic content requires planning",
      "Debugging streaming behaviour adds complexity",
    ],
    useCases: [
      "E-commerce product pages (static body + live price)",
      "News articles (static content + live comments)",
      "SaaS pages (static chrome + personalised dashboard)",
      "Any page that mixes mostly-static and truly-dynamic content",
    ],
  },
};

export function StrategyExplainer() {
  const activeStrategy = useLabStore((s) => s.activeStrategy);
  const strategy = STRATEGY_MAP[activeStrategy];
  const content = CONTENT[activeStrategy];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeStrategy}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-2 self-stretch rounded-full shrink-0",
              strategy.color,
            )}
          />
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {strategy.fullName}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {strategy.tagline}
            </p>
          </div>
        </div>

        {/* What is it */}
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
          {content.what}
        </p>

        {/* Where it shines */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Where it shines
          </p>
          <ul className="space-y-1.5">
            {content.shines.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Trade-offs */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Trade-offs
          </p>
          <ul className="space-y-1.5">
            {content.tradeoffs.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-700">
                <span className="text-amber-500 shrink-0 mt-0.5">△</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Use cases */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Common use cases
          </p>
          <div className="flex flex-wrap gap-1.5">
            {content.useCases.map((uc) => (
              <span
                key={uc}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600"
              >
                {uc}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
