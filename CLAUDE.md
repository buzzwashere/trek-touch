# CLAUDE.md

Touch-first Vue 3 app with an LCARS (Star Trek: Voyager) look.

## Stack

Vue 3.5 `<script setup lang="ts">`, Vue Router 5, Vite 8, TypeScript 6 (`vue-tsc`).
Scaffolded with `create-vue --ts --router --bare`. No UI library: LCARS is bespoke
shapes, so everything is plain scoped CSS over the tokens in `src/assets/main.css`.

## Layout

- `src/App.vue`: shell = `AppHeader` (north banner) / `<router-view>` center / `AppFooter`.
  The center fills the remaining `100dvh` and views are expected to fill it (`height: 100%`).
- `src/views/`: routed pages. `TestTrek.vue` is `/`, `AboutView.vue` is `/about`, and
  `NotFound.vue` is the catch-all.
- `src/components/LcarsRibbon.vue`: one status ribbon (tap to expand, swipe right to acknowledge).
- `src/data/ribbons.ts`: departments and faux ribbon content.
- `src/composables/`: `useLcarsAudio` (Web Audio chirps, created on first tap),
  `useStardate`, and `useMarkets` (fetch + 2-minute refresh while visible).
- `src/components/MarketsPanel.vue`: the Markets view, shown in the content column when
  the rail's Markets button is selected.

## Markets API

- `api/_markets-core.ts`: server-side fetching of Finnhub quotes (ETFs) and US Treasury
  yields (keyless CSV), normalised to `src/types/markets.ts` and cached for 60s. Provider
  failures become `notices`, never a thrown error, so partial data still renders.
- `api/markets.ts`: the Vercel function (`export function GET`). The leading `_` keeps the
  core from becoming a route.
- Relative imports under `api/` must end in `.js` (e.g. `'./_markets-core.js'`). The
  package is `"type": "module"`, so Vercel runs the compiled functions as native ESM,
  which fails on extensionless imports with `ERR_MODULE_NOT_FOUND`. Vite and `vue-tsc`
  don't catch this.
- Vercel type-checks `api/` against the root `tsconfig.json`, which has no Node types, so
  a function that uses Node globals such as `process` needs
  `/// <reference types="node" />` at the top (see `api/markets.ts`).
- `vite.config.ts` has a dev-only middleware serving `/api/markets` from the same core via
  `ssrLoadModule`, with the key from `loadEnv`.
- `FINNHUB_API_KEY` lives in `.env.local` (git-ignored) or Vercel env vars, never
  `VITE_*`, so it stays out of the client bundle.

## Touch conventions

- Tap targets are at least `--tap` (48px).
- Buttons get `touch-action: manipulation` and no tap highlight globally, and press
  feedback uses `:active`, never `:hover`.
- Swipeable surfaces use `touch-action: pan-y` plus pointer events, so vertical scrolling
  still belongs to the browser.
- Respect `prefers-reduced-motion`: animations are neutralised globally, and live
  readouts stop ticking.
- Layout accounts for notches with `viewport-fit=cover` + `env(safe-area-inset-*)`.

## Commands

- `npm run dev`: dev server on port 9006 with `--host`, for testing on a phone over the LAN.
- `npm run build`: `vue-tsc` type-check plus production build.

## Style

Match the scaffold: no semicolons, single quotes, 2-space indent, trailing commas in
multi-line literals. Custom components are kebab-case in templates.
