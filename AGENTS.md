## Project context

render-lab - companion project to AimFinder (same author, same conventions).
Interactive Next.js simulator for SSG/SSR/ISR/CSR/PPR rendering strategies,
built alongside sanj.ninja/blog article on rendering strategies.

## Conventions

- Package manager: npm (not pnpm - despite AimFinder using pnpm, this migration is deferred)
- Flat `lib/` structure - no nested single-file directories (e.g. `lib/store.ts` not `lib/store/index.ts`)
- Types live in `types.ts` at root, not a `types/` directory
- Pages are server components by default - push `"use client"` down into a
  dedicated wrapper component (see `components/lab/LabShell.tsx` pattern)
- Zustand stores are plain modules - never add `"use client"` to a store file

## Before considering any change complete

Run both and confirm zero errors, zero warnings:

    npm run build
    npx eslint . --ext .ts,.tsx
