import type {
  StrategyId,
  SimConfig,
  SimulationResult,
  TimelineStep,
  MetricsResult,
} from "@/types";

// Timeline builders
function buildSSGTimeline(config: SimConfig): TimelineStep[] {
  const buildMs = Math.round(config.sitePageCount * 8 + 500);
  return [
    {
      id: "ssg-build",
      label: "Build phase",
      description: `At deploy time, Next.js pre-renders all ${config.sitePageCount.toLocaleString()} pages into static HTML. This happens once, not per visitor.`,
      durationMs: Math.min(buildMs, 3000),
      from: "server",
      to: "cdn",
      payload: "static-file",
      phase: "build",
    },
    {
      id: "ssg-request",
      label: "User requests page",
      description:
        "Browser sends a GET request. It routes to the nearest CDN edge node - no origin server involved.",
      durationMs: 300,
      from: "browser",
      to: "cdn",
      payload: "request",
      phase: "request",
    },
    {
      id: "ssg-serve",
      label: "CDN serves cached HTML",
      description:
        "CDN finds the pre-built HTML file and returns it immediately. TTFB is near-instant - no database, no compute.",
      durationMs: 200,
      from: "cdn",
      to: "browser",
      payload: "html",
      phase: "complete",
    },
    {
      id: "ssg-render",
      label: "Browser renders page",
      description:
        "Full HTML arrives in one shot. FCP happens as the browser paints the pre-built content. No waiting for JavaScript to run.",
      durationMs: 150,
      from: "browser",
      to: "browser",
      payload: "html",
      phase: "complete",
    },
  ];
}

function buildSSRTimeline(config: SimConfig): TimelineStep[] {
  return [
    {
      id: "ssr-request",
      label: "User requests page",
      description:
        "Browser sends a GET. This goes to an origin server - no edge cache for the initial HTML.",
      durationMs: 300,
      from: "browser",
      to: "server",
      payload: "request",
      phase: "request",
    },
    {
      id: "ssr-db",
      label: "Server fetches data",
      description: `Server makes database or API calls to get fresh data. Your configured latency: ${config.serverLatency}ms. This blocks the HTML response.`,
      durationMs: config.serverLatency,
      from: "server",
      to: "db",
      payload: "api-call",
      phase: "server",
    },
    {
      id: "ssr-db-return",
      label: "Data returns to server",
      description:
        "Fresh data arrives from the database. Server now has everything it needs to build the HTML.",
      durationMs: Math.round(config.serverLatency * 0.5),
      from: "db",
      to: "server",
      payload: "data",
      phase: "server",
    },
    {
      id: "ssr-render",
      label: "Server renders HTML",
      description:
        "Server builds the complete HTML document with live data embedded. React Server Components run here.",
      durationMs: 180,
      from: "server",
      to: "server",
      payload: "html",
      phase: "server",
    },
    {
      id: "ssr-send",
      label: "Server sends HTML to browser",
      description:
        "Fully rendered HTML travels back. TTFB is higher than SSG but content is always fresh.",
      durationMs: 250,
      from: "server",
      to: "browser",
      payload: "html",
      phase: "complete",
    },
    {
      id: "ssr-hydrate",
      label: "Browser hydrates",
      description:
        "Browser renders the HTML, then downloads JS bundles to attach interactivity. Page is visible before hydration completes.",
      durationMs: Math.round(config.jsBundleKb * 0.8),
      from: "browser",
      to: "browser",
      payload: "js-bundle",
      phase: "complete",
    },
  ];
}

function buildISRTimeline(config: SimConfig, isStale: boolean): TimelineStep[] {
  const base: TimelineStep[] = [
    {
      id: "isr-request",
      label: "User requests page",
      description:
        "Request hits CDN edge. ISR pages are cached statically - just like SSG until the cache expires.",
      durationMs: 300,
      from: "browser",
      to: "cdn",
      payload: "request",
      phase: "request",
    },
    {
      id: "isr-serve",
      label: "CDN serves cached version",
      description: isStale
        ? `Cache is stale (older than ${config.isrRevalidate}s revalidation window). User still receives the cached page immediately - no waiting.`
        : "Cache is fresh. Instant delivery from CDN edge, same speed as SSG.",
      durationMs: 200,
      from: "cdn",
      to: "browser",
      payload: "html",
      phase: "complete",
    },
  ];

  if (isStale) {
    const bgFetch: TimelineStep = {
      id: "isr-bg-fetch",
      label: "Background: server regenerates",
      description:
        "In the background (not blocking the user), the server fetches fresh data and rebuilds this page. Next visitor gets the updated version.",
      durationMs: config.serverLatency + 300,
      from: "server",
      to: "db",
      payload: "api-call",
      phase: "server",
    };
    const cacheUpdate: TimelineStep = {
      id: "isr-cache-update",
      label: "Background: cache updated",
      description:
        "Regenerated HTML is pushed to CDN. The cache is now fresh for the next revalidation window.",
      durationMs: 200,
      from: "server",
      to: "cdn",
      payload: "static-file",
      phase: "complete",
    };
    base.push(bgFetch, cacheUpdate);
  }

  return base;
}

function buildCSRTimeline(config: SimConfig): TimelineStep[] {
  return [
    {
      id: "csr-request",
      label: "User requests page",
      description:
        "Browser sends a GET. The server responds almost instantly - but not with real content.",
      durationMs: 300,
      from: "browser",
      to: "server",
      payload: "request",
      phase: "request",
    },
    {
      id: "csr-shell",
      label: "Server sends HTML shell",
      description:
        "Server returns a near-empty HTML document with a `<div id='root'></div>` and script tags. No visible content yet - user sees a blank page.",
      durationMs: 150,
      from: "server",
      to: "browser",
      payload: "html",
      phase: "server",
    },
    {
      id: "csr-js",
      label: "Browser downloads JS bundle",
      description: `${config.jsBundleKb}KB of JavaScript must download, parse, and execute before anything is visible. This is the notorious CSR blank-screen window.`,
      durationMs: Math.round(config.jsBundleKb * 2.5),
      from: "cdn",
      to: "browser",
      payload: "js-bundle",
      phase: "client",
    },
    {
      id: "csr-api",
      label: "JS makes API calls",
      description:
        "React mounts, effect hooks fire, and data-fetching begins. Another round-trip to the server - this time for JSON data.",
      durationMs: config.serverLatency,
      from: "browser",
      to: "server",
      payload: "api-call",
      phase: "client",
    },
    {
      id: "csr-data",
      label: "API returns data",
      description:
        "JSON data arrives. React can now render meaningful content. This is where FCP finally happens.",
      durationMs: Math.round(config.serverLatency * 0.7),
      from: "server",
      to: "browser",
      payload: "data",
      phase: "client",
    },
    {
      id: "csr-render",
      label: "Browser renders UI",
      description:
        "React renders the full UI client-side. The app is now interactive. Subsequent navigations are near-instant without full page reloads.",
      durationMs: 200,
      from: "browser",
      to: "browser",
      payload: "html",
      phase: "complete",
    },
  ];
}

function buildPPRTimeline(config: SimConfig): TimelineStep[] {
  return [
    {
      id: "ppr-request",
      label: "User requests page",
      description:
        "Request arrives at the edge. PPR pages have a static shell prebuilt and cached at the CDN, just like SSG.",
      durationMs: 300,
      from: "browser",
      to: "edge",
      payload: "request",
      phase: "request",
    },
    {
      id: "ppr-shell",
      label: "Edge serves static shell instantly",
      description:
        "The static parts of the page (nav, layout, above-the-fold structure) are served from edge cache immediately. TTFB is SSG-fast.",
      durationMs: 150,
      from: "edge",
      to: "browser",
      payload: "html",
      phase: "server",
    },
    {
      id: "ppr-stream-start",
      label: "Server begins streaming dynamic slots",
      description:
        "While the browser starts rendering the static shell, the server begins resolving dynamic Suspense boundaries (e.g. user data, live prices).",
      durationMs: config.serverLatency,
      from: "server",
      to: "db",
      payload: "api-call",
      phase: "server",
    },
    {
      id: "ppr-stream-html",
      label: "Dynamic content streams in",
      description:
        "As each Suspense boundary resolves, its HTML chunk streams to the browser via the same HTTP connection. No second round-trip.",
      durationMs: 300,
      from: "server",
      to: "browser",
      payload: "stream",
      phase: "complete",
    },
    {
      id: "ppr-hydrate",
      label: "Browser hydrates progressively",
      description:
        "React selectively hydrates interactive islands as they arrive. Static parts are already interactive. Page feels complete much faster than full SSR.",
      durationMs: Math.round(config.jsBundleKb * 0.6),
      from: "browser",
      to: "browser",
      payload: "js-bundle",
      phase: "complete",
    },
  ];
}

// Metrics calculator

function computeMetrics(
  strategy: StrategyId,
  config: SimConfig,
): MetricsResult {
  switch (strategy) {
    case "ssg": {
      const buildMs = config.sitePageCount * 8 + 500;
      return {
        ttfb: 80,
        fcp: 200,
        lcp: 350,
        tti: 500,
        seoScore: 98,
        freshnessScore: Math.max(
          5,
          100 -
            Math.round((3600 / Math.max(config.dataChangeInterval, 1)) * 20),
        ),
        infraCostScore: 95,
        buildTimeMs: buildMs,
      };
    }
    case "ssr": {
      const ttfb = 200 + config.serverLatency;
      const visitorCostPenalty = Math.round(config.dailyVisitors / 2000);
      return {
        ttfb,
        fcp: ttfb + 150,
        lcp: ttfb + 300,
        tti: ttfb + config.jsBundleKb * 0.8 + 100,
        seoScore: 95,
        freshnessScore: 99,
        infraCostScore: Math.max(10, 80 - visitorCostPenalty),
        buildTimeMs: 0,
      };
    }
    case "isr": {
      const staleness =
        config.isrRevalidate / Math.max(config.dataChangeInterval, 1);
      return {
        ttfb: 90,
        fcp: 220,
        lcp: 380,
        tti: 550,
        seoScore: 96,
        freshnessScore: Math.max(20, 100 - Math.round(staleness * 15)),
        infraCostScore: 85,
        buildTimeMs: Math.round(config.sitePageCount * 1.2 + 300), // partial builds
      };
    }
    case "csr": {
      const jsDelay = config.jsBundleKb * 2.5;
      return {
        ttfb: 100,
        fcp: jsDelay + config.serverLatency + 200,
        lcp: jsDelay + config.serverLatency + 400,
        tti: jsDelay + config.serverLatency + 300,
        seoScore: 55,
        freshnessScore: 95,
        infraCostScore: 90,
        buildTimeMs: 0,
      };
    }
    case "ppr": {
      const ttfb = 80;
      return {
        ttfb,
        fcp: ttfb + 100,
        lcp: ttfb + config.serverLatency + 200,
        tti: ttfb + config.jsBundleKb * 0.6 + 200,
        seoScore: 97,
        freshnessScore: 90,
        infraCostScore: 78,
        buildTimeMs: Math.round(config.sitePageCount * 4 + 400),
      };
    }
  }
}

// Public API

export function buildSimulation(
  strategy: StrategyId,
  config: SimConfig,
): SimulationResult {
  let timeline: TimelineStep[];

  switch (strategy) {
    case "ssg":
      timeline = buildSSGTimeline(config);
      break;
    case "ssr":
      timeline = buildSSRTimeline(config);
      break;
    case "isr":
      // Show stale scenario when data changes faster than revalidation window
      timeline = buildISRTimeline(
        config,
        config.dataChangeInterval < config.isrRevalidate,
      );
      break;
    case "csr":
      timeline = buildCSRTimeline(config);
      break;
    case "ppr":
      timeline = buildPPRTimeline(config);
      break;
  }

  return {
    strategy,
    config,
    timeline,
    metrics: computeMetrics(strategy, config),
  };
}
