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
- `src/composables/`: `useLcarsAudio` (Web Audio chirps, created on first tap) and
  `useStardate`.

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
