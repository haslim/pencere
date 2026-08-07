# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js 16 is NOT training-data Next.js

@AGENTS.md — read the bundled guides in `node_modules/next/dist/docs/` before touching Next.js APIs. The App Router and file conventions in this repo version (`next` 16.2.9, `react` 19.2.4) differ from older Next.js. Heed deprecation notices.

## What this app is

A single-page **PVC/aluminum window (pencere) manufacturing & quoting SaaS** in Turkish. All UI text is Turkish; keep new strings in Turkish. One route (`src/app/page.tsx`), everything else is client components and a pure calculation engine. There is no backend, no DB, no build-time data — state lives in React + `localStorage`.

## Commands

```bash
npm run dev      # dev server, http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (config: eslint.config.mjs)
```

No test runner is configured. No `test` script, no vitest/jest/playwright. Do not invent one.

## Architecture

Single-page dashboard (`src/app/page.tsx`, `"use client"`) that owns all order state and passes it down. Three layers:

1. **Pure engine — `src/lib/pencereEngine.ts`** (no React, fully unit-testable). Domain types + all calculations. This is the real logic and the file most worth reading first.
   - `WindowItem` = one "poz" (window position): width/height in mm, profile color, series/kasa/sash profile types, mullion counts + custom offsets, and `divisions[]` (the mullion grid cells).
   - `calculateWindowDimensions(item, settings)` → cut pieces, glasses, meters, cost/price/profit.
   - `resolveMullionPositions()` — mullion mm placement: positive offset = from left/top, negative = from right/bottom.
   - `optimizeCutList()` — 1D stock-cutting optimization (First-Fit Decreasing).
   - `exportToCNCData()`, `calculateOrderSummary()` — mill/optimizer exports and whole-order totals.
   - Constants: `EGEPEN_SERIES` (5 profile series), `PROFILE_COLORS`, `KasaProfileType`/`SashProfileType`/`DivisionType` unions.

2. **Settings/config — `src/components/SettingsModal.tsx`** defines `AppSettings` + `DEFAULT_SETTINGS` (company info, weld/sash/glass/steel tolerances in mm, all TL unit prices, profit margin, stock bar length). Engine imports defaults from here.

3. **UI components — `src/components/`** (`"use client"`). All views are modals driven by `isOpen`/`onClose`/`onSave` props:
   - `WindowCanvas.tsx` — SVG interactive window drawing + mullion/tool surface; emits changes via callbacks (`onUpdateDivisionType`, `onAddCustomMullion`, ...) which the page applies immutably.
   - `CutListModal`, `GlassOrderModal`, `QuoteModal`, `CustomerModal`, `SettingsModal` — read-only (or form) exports of the computed results.

## Conventions to follow

- **TypeScript only**, strict mode, path alias `@/*` → `src/*`. Components are `.tsx`, engine/logic `.ts`.
- **Tailwind v4** (`@tailwindcss/postcss`) + `cn()` from `src/lib/utils.ts` (shadcn-style `clsx` + `tailwind-merge`). Theme via `@base-ui/react`. System of styles uses the existing emoji/Tailwind class idiom.
- **Immutability**: every update creates a new object (`updateActiveItem` spreads); never mutate `items`/`divisions` in place.
- **Derive, don't store**: sums and cut lists are recomputed with `useMemo` from `items` + `settings` — do not persist derived state.
- **Currency**: all money is integer TL, formatted `toLocaleString("tr-TR")`.
- **Kilograms/mm everywhere**: `WindowItem` dims and allowances are mm; unit prices are per meter (profil/sac) and per m² (cam).
- **State flows one way**: `page.tsx` owns `settings`, `items`, `activeItemIndex`, customers; modals/canvas are presentational and report back through callbacks. Keep it that way.
- UI copy and comments are Turkish — match the existing tone (informative, emoji-decorated).

## Gotchas

- `localStorage` keys `app_factory_settings` and `app_theme` are read once on mount (`useEffect`). Saving is manual (`handleSaveSettings`).
- Dark/light/system theming is toggled via `ThemeMode` + `prefers-color-scheme`.
- The global keydown `"` (double-quote) shortcut calls `handleAddNewPoz` — don't break it.
- `kasaProfileType === "ESIKLI_KASA"` (aluminium-threshold) and sliding series (`EGEPEN_LEGEND_SLIDE` / `EGEPEN_HS76`) change both drawing and cutting logic — check the `isSurme` special-casing in both `pencereEngine.ts` and `WindowCanvas.tsx`.