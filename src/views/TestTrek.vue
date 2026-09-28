<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LcarsRibbon from '../components/LcarsRibbon.vue'
import { DEPARTMENTS, RIBBONS } from '../data/ribbons'
import type { Department } from '../data/ribbons'
import { useLcarsAudio } from '../composables/useLcarsAudio'
import { useStardate } from '../composables/useStardate'

const audio = useLcarsAudio()
const stardate = useStardate()

const filter = ref<Department | 'all'>('all')
const expanded = ref<Record<string, boolean>>({})
const acknowledged = ref<Record<string, boolean>>({})
const redAlert = ref(false)

const deptColor = Object.fromEntries(DEPARTMENTS.map(d => [d.id, d.color])) as Record<Department, string>

const visibleRibbons = computed(() =>
  filter.value === 'all' ? RIBBONS : RIBBONS.filter(r => r.department === filter.value),
)

const filterLabel = computed(() =>
  filter.value === 'all' ? 'All Departments' : DEPARTMENTS.find(d => d.id === filter.value)!.label,
)

const ackCount = computed(() => RIBBONS.filter(r => acknowledged.value[r.id]).length)

const stardateText = computed(() => stardate.value.toFixed(1))

// One shared clock for every live readout, paused for people who asked for less motion.
const tick = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  timer = setInterval(() => {
    tick.value++
  }, 900)
})

onBeforeUnmount(() => clearInterval(timer))

function selectFilter(id: Department | 'all') {
  filter.value = id
  audio.chirp()
}

function toggleRibbon(id: string) {
  expanded.value[id] = !expanded.value[id]
  audio.chirp()
}

function acknowledgeRibbon(id: string) {
  acknowledged.value[id] = !acknowledged.value[id]
  audio.confirm()
}

function toggleRedAlert() {
  redAlert.value = !redAlert.value
  if (redAlert.value) {
    audio.klaxon()
  } else {
    audio.confirm()
  }
}
</script>

<template>
  <section
    class="lcars"
    :class="{ 'red-alert': redAlert }"
    aria-label="LCARS console"
  >
    <div class="elbow elbow-top" aria-hidden="true"></div>

    <header class="top">
      <div class="top-bar">
        <span class="bar-fill"></span>
        <h1 class="title">Test Trek</h1>
        <span class="bar-seg seg-1"></span>
        <span class="bar-seg seg-2"></span>
      </div>
      <div class="readouts">
        <span class="readout">
          <small>Stardate</small>
          <strong>{{ stardateText }}</strong>
        </span>
        <span
          class="readout status"
          role="status"
        >
          <small>Condition</small>
          <strong>{{ redAlert ? 'Red Alert' : 'Green' }}</strong>
        </span>
        <span class="readout hide-narrow">
          <small>Acknowledged</small>
          <strong>{{ ackCount }} / {{ RIBBONS.length }}</strong>
        </span>
      </div>
    </header>

    <nav
      class="rail"
      aria-label="Departments"
    >
      <button
        type="button"
        class="rail-btn"
        :class="{ active: filter === 'all' }"
        :aria-pressed="filter === 'all'"
        style="--c: var(--lc-violet)"
        @click="selectFilter('all')"
      >
        <small>00-0000</small>
        <span class="long">All</span>
        <span class="short">All</span>
      </button>
      <button
        v-for="dept in DEPARTMENTS"
        :key="dept.id"
        type="button"
        class="rail-btn"
        :class="{ active: filter === dept.id }"
        :aria-pressed="filter === dept.id"
        :style="{ '--c': dept.color }"
        @click="selectFilter(dept.id)"
      >
        <small>{{ dept.code }}</small>
        <span class="long">{{ dept.label }}</span>
        <span class="short">{{ dept.short }}</span>
      </button>
      <span
        class="rail-fill"
        aria-hidden="true"
      ></span>
      <button
        type="button"
        class="rail-btn alert-btn"
        :aria-pressed="redAlert"
        style="--c: var(--lc-red)"
        @click="toggleRedAlert"
      >
        <small>99-0001</small>
        <span class="long">Red Alert</span>
        <span class="short">Alert</span>
      </button>
      <button
        type="button"
        class="rail-btn"
        :aria-pressed="audio.enabled.value"
        style="--c: var(--lc-blue)"
        @click="audio.toggle"
      >
        <small>98-4410</small>
        <span class="long">Audio {{ audio.enabled.value ? 'On' : 'Off' }}</span>
        <span class="short">{{ audio.enabled.value ? 'Snd' : 'Mute' }}</span>
      </button>
    </nav>

    <div class="content">
      <p class="content-head">
        <span>{{ filterLabel }}</span>
        <span class="count">{{ visibleRibbons.length }} systems</span>
      </p>
      <ul class="ribbons">
        <lcars-ribbon
          v-for="ribbon in visibleRibbons"
          :key="ribbon.id"
          :ribbon="ribbon"
          :color="deptColor[ribbon.department]"
          :expanded="!!expanded[ribbon.id]"
          :acknowledged="!!acknowledged[ribbon.id]"
          :alert="redAlert"
          :tick="tick"
          @toggle="toggleRibbon(ribbon.id)"
          @acknowledge="acknowledgeRibbon(ribbon.id)"
        />
      </ul>
    </div>

    <div class="elbow elbow-bottom" aria-hidden="true"></div>

    <footer class="bottom">
      <div class="bottom-bar">
        <span class="bar-fill"></span>
        <span class="bar-seg seg-3"></span>
        <span class="bar-label">LCARS 74656</span>
        <span class="bar-seg seg-4"></span>
      </div>
    </footer>
  </section>
</template>

<style scoped>
/* The frame: an elbow at top-left curving into a horizontal bar, a rail of buttons down
   the left, and a mirrored elbow at the bottom. The content column scrolls on its own
   so the frame always fills the routed area exactly. */
.lcars {
  --frame: var(--lc-lilac);
  --frame-2: var(--lc-periwinkle);
  --rail: clamp(84px, 17vw, 176px);
  --bar: 28px;
  --elbow-r: 56px;

  display: grid;
  grid-template-columns: var(--rail) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) 64px;
  row-gap: 6px;
  height: 100%;
  padding: 10px 10px 10px 10px;
  background: var(--lc-black);
}

.lcars.red-alert {
  --frame: var(--lc-red);
  --frame-2: var(--lc-alert);
}

/* --- elbows ------------------------------------------------------------------ */
.elbow {
  background: var(--frame);
  transition: background 300ms;
}

.elbow-top {
  grid-column: 1;
  grid-row: 1;
  min-height: 92px;
  border-top-left-radius: var(--elbow-r);
}

.elbow-bottom {
  grid-column: 1;
  grid-row: 3;
  border-bottom-left-radius: var(--elbow-r);
}

.red-alert .elbow,
.red-alert .bar-fill {
  animation: alert-pulse 1.1s ease-in-out infinite;
}

/* --- top bar ------------------------------------------------------------------ */
.top {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.top-bar,
.bottom-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: var(--bar);
}

/* The concave fillet where the bar meets the rail. */
.top-bar::before,
.bottom-bar::before {
  content: '';
  position: absolute;
  left: 0;
  width: var(--bar);
  height: var(--bar);
  transition: background 300ms;
}

.top-bar::before {
  top: 100%;
  background: radial-gradient(circle at 100% 100%, transparent calc(var(--bar) - 1px), var(--frame) var(--bar));
}

.bottom-bar::before {
  bottom: 100%;
  background: radial-gradient(circle at 100% 0%, transparent calc(var(--bar) - 1px), var(--frame) var(--bar));
}

.bar-fill {
  flex: 1;
  align-self: stretch;
  background: var(--frame);
  transition: background 300ms;
}

.title {
  margin: 0;
  padding: 0 4px;
  color: var(--frame-2);
  font-size: clamp(1.9rem, 6vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 0.8;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 300ms;
}

.bar-seg {
  align-self: stretch;
}

.seg-1 {
  flex: 0 0 clamp(24px, 6vw, 72px);
  background: var(--lc-orange);
}

.seg-2 {
  flex: 0 0 clamp(20px, 4vw, 48px);
  border-radius: 0 14px 14px 0;
  background: var(--frame-2);
}

.readouts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 28px;
  padding: 12px 0 8px calc(var(--bar) + 12px);
}

.readout {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.readout small {
  color: var(--lc-dim);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.readout strong {
  color: var(--lc-ice);
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
}

.red-alert .status strong {
  color: var(--lc-alert);
  animation: blink 0.9s steps(2, jump-none) infinite;
}

/* --- rail ------------------------------------------------------------------- */
.rail {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.rail-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  flex: 0 0 auto;
  min-height: 60px;
  padding: 4px 10px 6px;
  background: var(--c);
  color: var(--lc-black);
  filter: brightness(0.72) saturate(0.85);
  text-transform: uppercase;
  transition: filter 150ms;
}

.rail-btn small {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  opacity: 0.8;
}

.rail-btn span {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.05;
  text-align: right;
}

.rail-btn .short {
  display: none;
}

.rail-btn.active,
.rail-btn[aria-pressed='true'] {
  filter: none;
}

.rail-btn:active {
  filter: brightness(1.3);
}

.alert-btn[aria-pressed='true'] {
  animation: alert-pulse 1.1s ease-in-out infinite;
}

.rail-fill {
  flex: 1 0 24px;
  background: var(--frame);
  transition: background 300ms;
}

/* --- content ---------------------------------------------------------------- */
.content {
  grid-column: 2;
  grid-row: 2;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 4px 12px calc(var(--bar) + 8px);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--frame) transparent;
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 12px;
  color: var(--lc-orange);
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.content-head .count {
  color: var(--lc-dim);
}

.ribbons {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
  padding: 0;
}

/* --- bottom bar -------------------------------------------------------------- */
.bottom {
  grid-column: 2;
  grid-row: 3;
  display: flex;
  align-items: flex-end;
  min-width: 0;
}

.bottom-bar {
  flex: 1;
}

.seg-3 {
  flex: 0 0 clamp(28px, 8vw, 96px);
  background: var(--lc-gold);
}

.seg-4 {
  flex: 0 0 clamp(20px, 4vw, 48px);
  border-radius: 0 14px 14px 0;
  background: var(--lc-blue);
}

.bar-label {
  padding: 0 4px;
  color: var(--frame-2);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 0.8;
  white-space: nowrap;
  transition: color 300ms;
}

@keyframes alert-pulse {
  50% {
    filter: brightness(1.6);
  }
}

@keyframes blink {
  50% {
    opacity: 0.25;
  }
}

/* --- phones ------------------------------------------------------------------ */
@media (max-width: 560px) {
  .lcars {
    --bar: 20px;
    --elbow-r: 36px;
    padding: 6px;
  }

  .rail-btn {
    min-height: 56px;
    padding: 4px 6px 6px;
  }

  .rail-btn .long {
    display: none;
  }

  .rail-btn .short {
    display: inline;
  }

  .rail-btn small {
    font-size: 0.62rem;
  }

  .readouts {
    gap: 2px 16px;
  }

  .readout strong {
    font-size: 1.1rem;
  }

  .hide-narrow {
    display: none;
  }

  .bar-label {
    font-size: 1rem;
  }
}
</style>
