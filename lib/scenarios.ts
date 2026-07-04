import type { Scenario } from "@/types";

export const SCENARIOS: Scenario[] = [
  {
    id: "marketing-site",
    label: "Marketing Site",
    description:
      "Company homepage and landing pages. Content rarely changes, SEO is critical, speed wins conversions.",
    icon: "🏠",
    config: {
      dataChangeInterval: 86400, // daily
      serverLatency: 80,
      jsBundleKb: 120,
      isrRevalidate: 3600,
      sitePageCount: 20,
      dailyVisitors: 5000,
    },
    recommendations: {
      ssg: {
        verdict: "great",
        reason:
          "Content is near-static. Pre-built pages served instantly from CDN edge.",
      },
      ssr: {
        verdict: "poor",
        reason:
          "Every visit re-renders the same content on a server. Wasted compute, slower TTFB with no freshness benefit.",
      },
      isr: {
        verdict: "ok",
        reason:
          "Works, but overkill. Revalidation adds complexity you don't need when content barely changes.",
      },
      csr: {
        verdict: "poor",
        reason:
          "SEO is critical here. CSR delays content visibility for crawlers. Blank shell on first load hurts Core Web Vitals.",
      },
      ppr: {
        verdict: "ok",
        reason:
          "Shell is essentially static anyway - PPR overhead isn't worth it. SSG wins here.",
      },
    },
  },
  {
    id: "ecommerce",
    label: "E-commerce Store",
    description:
      "Product pages with live pricing, stock levels, and user-specific cart. Mix of static structure and dynamic data.",
    icon: "🛍️",
    config: {
      dataChangeInterval: 300, // 5 min pricing updates
      serverLatency: 120,
      jsBundleKb: 280,
      isrRevalidate: 60,
      sitePageCount: 50000,
      dailyVisitors: 80000,
    },
    recommendations: {
      ssg: {
        verdict: "poor",
        reason:
          "50k product pages with live prices would need full rebuilds on every stock change. Build times become unmanageable.",
      },
      ssr: {
        verdict: "ok",
        reason:
          "Always-fresh pricing and stock data. Good for checkout flows. But 80k daily users means significant server cost without caching.",
      },
      isr: {
        verdict: "great",
        reason:
          "Static-speed product pages, background refresh when prices change. Scales to millions of SKUs.",
      },
      csr: {
        verdict: "ok",
        reason:
          "Good for cart interactions and live stock indicators. Layer it on top of ISR for the interactive bits.",
      },
      ppr: {
        verdict: "great",
        reason:
          "Static product shell loads instantly from edge. Live price/stock slots stream in. Best of all worlds for modern stacks.",
      },
    },
  },
  {
    id: "news-platform",
    label: "News Platform",
    description:
      "Breaking news articles, live feeds, constantly updating content. Freshness is everything, SEO drives discovery.",
    icon: "📰",
    config: {
      dataChangeInterval: 60, // articles every minute
      serverLatency: 90,
      jsBundleKb: 200,
      isrRevalidate: 30,
      sitePageCount: 500000,
      dailyVisitors: 500000,
    },
    recommendations: {
      ssg: {
        verdict: "poor",
        reason:
          "Breaking news can't wait for a full rebuild. 500k pages means a full rebuild takes hours - your content would be ancient.",
      },
      ssr: {
        verdict: "ok",
        reason:
          "Always fresh. But 500k daily visitors with pure SSR and no caching layer means massive infrastructure bills.",
      },
      isr: {
        verdict: "great",
        reason:
          "Pages cached statically, regenerated every 30s in background. Users see near-fresh content, cost stays manageable. Classic ISR win.",
      },
      csr: {
        verdict: "poor",
        reason:
          "News SEO lives and dies by crawlability. CSR means Google sees a blank shell. Organic traffic tanks.",
      },
      ppr: {
        verdict: "great",
        reason:
          "Article body prerendered at edge. Breaking news ticker and comment counts stream in. Excellent TTFB at scale.",
      },
    },
  },
  {
    id: "saas-dashboard",
    label: "SaaS Dashboard",
    description:
      "Authenticated user dashboard with personalised data, real-time analytics, interactive charts and project management tools.",
    icon: "📊",
    config: {
      dataChangeInterval: 5, // near real-time
      serverLatency: 150,
      jsBundleKb: 600,
      isrRevalidate: 10,
      sitePageCount: 50,
      dailyVisitors: 10000,
    },
    recommendations: {
      ssg: {
        verdict: "poor",
        reason:
          "Data is personalised per user and updates every few seconds. Can't pre-build per-user pages statically.",
      },
      ssr: {
        verdict: "ok",
        reason:
          "Works for initial personalised render. But real-time chart updates can't stay SSR - JS has to take over client-side.",
      },
      isr: {
        verdict: "poor",
        reason:
          "ISR caches are shared. Personalised data can't be cached at page level - you'd serve user A's data to user B.",
      },
      csr: {
        verdict: "great",
        reason:
          "App-like interactions, real-time updates, complex state. Users spend hours here - initial load cost amortises.",
      },
      ppr: {
        verdict: "ok",
        reason:
          "Static app shell streams fast from edge. Dynamic dashboard panels load in. Works well with auth-gated SSR fallback.",
      },
    },
  },
  {
    id: "blog",
    label: "Personal / Tech Blog",
    description:
      "Written articles, documentation, tutorials. Content published occasionally, SEO is the growth engine.",
    icon: "✍️",
    config: {
      dataChangeInterval: 604800, // weekly
      serverLatency: 60,
      jsBundleKb: 80,
      isrRevalidate: 86400,
      sitePageCount: 150,
      dailyVisitors: 2000,
    },
    recommendations: {
      ssg: {
        verdict: "great",
        reason:
          "150 posts, weekly publishes. Build takes seconds. Pages cached at CDN edge indefinitely. This is exactly what SSG was designed for.",
      },
      ssr: {
        verdict: "poor",
        reason:
          "Re-rendering the same article HTML on every visit is pure waste. No freshness benefit for static content.",
      },
      isr: {
        verdict: "ok",
        reason:
          "Works, but unnecessary complexity. If your blog publishes weekly, just trigger a rebuild on publish. SSG is simpler.",
      },
      csr: {
        verdict: "poor",
        reason:
          "Blog SEO is everything. CSR kills crawlability. Your article rankings disappear.",
      },
      ppr: {
        verdict: "ok",
        reason:
          "Could use PPR for a static article body + streamed comment section. Fun technically but over-engineered for a personal blog.",
      },
    },
  },
  {
    id: "social-feed",
    label: "Social Media Feed",
    description:
      "Personalised activity timelines, live notifications, user-specific content that changes every second.",
    icon: "💬",
    config: {
      dataChangeInterval: 1, // real-time
      serverLatency: 200,
      jsBundleKb: 800,
      isrRevalidate: 5,
      sitePageCount: 10,
      dailyVisitors: 1000000,
    },
    recommendations: {
      ssg: {
        verdict: "poor",
        reason:
          "Personalised feed that updates every second. SSG is structurally incompatible - there's no static page to build.",
      },
      ssr: {
        verdict: "great",
        reason:
          "Per-request render gives each user a fresh, personalised HTML response.",
      },
      isr: {
        verdict: "poor",
        reason:
          "ISR caches are shared across users. A social feed is user-specific by definition - shared cache means privacy nightmares.",
      },
      csr: {
        verdict: "great",
        reason:
          "After SSR initial load, real-time updates (WebSocket, polling) are pure CSR. Hybrid SSR + CSR is the standard pattern here.",
      },
      ppr: {
        verdict: "ok",
        reason:
          "App chrome (nav, sidebar) prerendered at edge. Feed slots stream per-user from server. Promising but adds complexity at this scale.",
      },
    },
  },
];

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
) as Record<string, Scenario>;

export const DEFAULT_CONFIG = SCENARIOS[0].config;
