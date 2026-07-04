# render.lab

> Interactive rendering strategy simulator — built alongside [Yet Another Front-end Rendering Strategies Article](https://sanj.ninja/blog/yet-another-front-end-rendering-strategies-article/) by Sanjeev Srithevan.

An interactive Next.js application that lets users feel the difference between **SSG, SSR, ISR, CSR and PPR** through animated request lifecycle visualisations, configurable scenarios, and live simulated metrics.

---

## What it does

### Strategy selector
Switch between all five rendering strategies. Every panel updates instantly.

### Animated flow visualiser
Step-by-step animation of the request lifecycle for each strategy:
- Actors: Browser, CDN/Edge, Origin Server, Database/API
- Travelling payloads: HTTP Request, HTML, JS Bundle, API Call, JSON Data, HTML Stream, Static File
- Timeline scrubber showing relative duration of each phase
- Step detail card explaining what's happening and why

### Scenario presets
Six real-world scenarios grounded in the article:
- Marketing Site, E-commerce Store, News Platform, SaaS Dashboard, Blog, Social Feed
- Each scenario configures realistic latency, page count, data freshness, and visitor numbers
- For every scenario, see a verdict (Great fit / Works / Poor fit) for each strategy with plain-language reasoning

### Config panel
Six sliders to tune the simulation:
- **Data change frequency** - how often content updates (affects staleness)
- **Server latency** - database round-trip time
- **JS bundle size** - total JS shipped to browser (hurts CSR)
- **ISR revalidation window** - how long ISR caches before background regen
- **Page count** - total site pages (affects SSG/ISR build times)
- **Daily visitors** - traffic volume (affects SSR infrastructure cost)

### Metrics panel
Live simulated performance metrics that react to config changes:
- TTFB, FCP, LCP, TTI (Core Web Vitals timing)
- SEO score, Content freshness score, Infrastructure cost score
- Estimated build time for applicable strategies

### Strategy explainer
Deep-dive per strategy: what it is, where it shines, trade-offs, and common use cases — all grounded in the article.

---

## Project structure

```
render-lab/
├── app/
│   ├── lab/
│   │   └── page.tsx          # Main interactive lab (client component)
│   ├── layout.tsx
│   ├── page.tsx              # Redirects to /lab
│   └── globals.css
├── components/
│   ├── config/
│   │   └── ConfigPanel.tsx   # Six slider controls
│   ├── lab/
│   │   ├── ScenarioPicker.tsx      # Scenario button grid
│   │   ├── ScenarioVerdict.tsx     # Verdict card + comparison table
│   │   ├── StrategyExplainer.tsx   # Deep-dive explainer
│   │   └── StrategySelector.tsx    # Tab bar for 5 strategies
│   ├── metrics/
│   │   └── MetricsPanel.tsx        # TTFB/FCP/LCP/TTI bars + score gauges
│   └── visualiser/
│       └── FlowVisualiser.tsx      # Animated request lifecycle diagram
├── data/
│   ├── scenarios.ts          # 6 scenario presets with recommendations
│   └── strategies.ts         # Strategy definitions (labels, colours)
├── lib/
│   ├── simulation/
│   │   └── engine.ts         # Timeline builders + metrics calculator
│   ├── store/
│   │   └── lab.ts            # Zustand global state
│   └── utils.ts              # cn(), formatMs(), score helpers
└── types/
    └── index.ts              # All TypeScript types
```

---

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** - animated arrows, step transitions, metric bars
- **Zustand** - global lab state
- **clsx + tailwind-merge** - conditional class composition

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/lab`.

---

## Deploy to Vercel

```bash
npx vercel
```

No environment variables needed. The entire simulation is client-side - the app itself is a static export.

---

## Extending

### Add a new scenario
Edit `data/scenarios.ts`. Add a new entry to the `SCENARIOS` array with:
- `config` — realistic SimConfig values
- `recommendations` — a verdict + reason for all 5 strategies

### Add a new rendering strategy
1. Add to `StrategyId` union in `types/index.ts`
2. Add strategy definition to `data/strategies.ts`
3. Add a timeline builder in `lib/simulation/engine.ts`
4. Add metrics calculation in `computeMetrics()`
5. Add actor layout in `components/visualiser/FlowVisualiser.tsx`
6. Add explainer content in `components/lab/StrategyExplainer.tsx`

### Tune simulation fidelity
All timing is in `lib/simulation/engine.ts`. The timeline builders and metrics calculator use the `SimConfig` values to produce realistic numbers — adjust the multipliers there to calibrate against real-world benchmarks.

---

## Article

This simulator is a companion to:

**[Yet Another Front-end Rendering Strategies Article](https://sanj.ninja/blog/yet-another-front-end-rendering-strategies-article/)**  
*A practical beginner-friendly guide to SSR, CSR, SSG, ISR and PPR — by Sanjeev Srithevan*
