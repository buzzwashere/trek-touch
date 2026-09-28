<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ribbon } from '../data/ribbons'

const props = defineProps<{
  ribbon: Ribbon
  color: string
  expanded: boolean
  acknowledged: boolean
  alert: boolean
  // Advances on a timer; drives the live readout wobble and the data cascade.
  tick: number
}>()

const emit = defineEmits<{
  toggle: []
  acknowledge: []
}>()

// Distance a right swipe must travel before letting go acknowledges the ribbon.
const SWIPE_COMMIT = 96
const SWIPE_MAX = 160
// Movement under this is still a tap.
const SLOP = 10

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

const seed = hash(props.ribbon.id)

// Integer readouts are counts and stay put; fractional ones drift a little, like a
// live sensor would.
const liveValue = computed(() => {
  const v = props.ribbon.value
  if (Number.isInteger(v)) {
    return String(v)
  }
  const wobble = Math.sin(props.tick * 0.9 + (seed % 97)) * 0.15
  return (v + wobble).toFixed(1)
})

const liveLevel = computed(() => {
  const wobble = Math.sin(props.tick * 0.7 + (seed % 31)) * 0.02
  return Math.min(1, Math.max(0.02, props.ribbon.level + wobble))
})

// Three rows of changing numbers under an expanded ribbon — the LCARS data cascade.
const cascade = computed(() =>
  Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => {
      const n = hash(`${props.ribbon.id}:${row}:${col}:${props.tick}`)
      return String(n % 100000).padStart(5, '0')
    }),
  ),
)

const detailId = computed(() => `ribbon-detail-${props.ribbon.id}`)

// --- swipe to acknowledge -------------------------------------------------------
const offset = ref(0)
const dragging = ref(false)
let startX = 0
let startY = 0
let tracking = false
let suppressClick = false

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) {
    return
  }
  tracking = true
  dragging.value = false
  startX = e.clientX
  startY = e.clientY
}

function onPointerMove(e: PointerEvent) {
  if (!tracking) {
    return
  }
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!dragging.value) {
    // Only a mostly-horizontal rightward drag becomes a swipe; anything else is left to
    // the browser (vertical scroll) or treated as a tap.
    if (Math.abs(dx) < SLOP || Math.abs(dx) < Math.abs(dy) || dx < 0) {
      return
    }
    dragging.value = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  offset.value = Math.min(SWIPE_MAX, Math.max(0, dx))
}

function endSwipe() {
  if (dragging.value) {
    if (offset.value >= SWIPE_COMMIT) {
      emit('acknowledge')
    }
    suppressClick = true
  }
  tracking = false
  dragging.value = false
  offset.value = 0
}

function onPointerCancel() {
  tracking = false
  dragging.value = false
  offset.value = 0
}

function onClick() {
  // A swipe ends with a click on most browsers; it was not a tap.
  if (suppressClick) {
    suppressClick = false
    return
  }
  emit('toggle')
}

const swipeReady = computed(() => offset.value >= SWIPE_COMMIT)
</script>

<template>
  <li
    class="ribbon"
    :class="{
      'is-expanded': expanded,
      'is-ack': acknowledged,
      'is-dragging': dragging,
    }"
    :style="{ '--c': alert ? 'var(--lc-red)' : color }"
  >
    <div class="track">
      <div
        class="underlay"
        :class="{ ready: swipeReady }"
        aria-hidden="true"
      >
        {{ acknowledged ? 'Restore' : 'Acknowledge' }} &#9656;
      </div>
      <button
        type="button"
        class="face"
        :style="{ transform: offset ? `translateX(${offset}px)` : undefined }"
        :aria-expanded="expanded"
        :aria-controls="detailId"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endSwipe"
        @pointercancel="onPointerCancel"
        @click="onClick"
      >
        <span class="cap"></span>
        <span class="code">{{ acknowledged ? 'ACK' : ribbon.code }}</span>
        <span class="title">{{ ribbon.title }}</span>
        <span class="meter" aria-hidden="true">
          <span
            class="fill"
            :style="{ width: `${liveLevel * 100}%` }"
          ></span>
        </span>
        <span class="value">
          {{ liveValue }}<small>{{ ribbon.unit }}</small>
        </span>
      </button>
    </div>

    <p class="summary">{{ ribbon.summary }}</p>

    <div
      v-if="expanded"
      :id="detailId"
      class="detail"
    >
      <span class="bracket" aria-hidden="true"></span>
      <div class="detail-body">
        <p class="detail-text">{{ ribbon.detail }}</p>
        <div class="cascade" aria-hidden="true">
          <div
            v-for="(row, r) in cascade"
            :key="r"
            class="cascade-row"
          >
            <span
              v-for="(n, i) in row"
              :key="i"
            >{{ n }}</span>
          </div>
        </div>
        <div class="detail-actions">
          <button
            type="button"
            class="pill"
            @click="emit('acknowledge')"
          >
            {{ acknowledged ? 'Restore' : 'Acknowledge' }}
          </button>
          <span class="hint">or swipe the ribbon right</span>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.ribbon {
  list-style: none;
  transition: opacity 200ms;
}

.ribbon.is-ack {
  opacity: 0.45;
}

.track {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
}

/* Revealed behind the face as it slides right. */
.underlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding-left: 20px;
  background: #222;
  color: var(--lc-dim);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: background 120ms, color 120ms;
}

.underlay.ready {
  background: var(--c);
  color: var(--lc-black);
}

.face {
  position: relative;
  display: grid;
  grid-template-columns: 28px 96px minmax(0, 1fr) minmax(56px, 20%) auto;
  align-items: stretch;
  gap: 6px;
  width: 100%;
  min-height: 56px;
  background: var(--lc-black);
  text-align: left;
  /* Vertical pans still scroll the list; horizontal movement comes to us. */
  touch-action: pan-y;
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.is-dragging .face {
  transition: none;
}

.face:active .cap,
.face:active .value {
  filter: brightness(1.35);
}

.cap {
  border-radius: 28px 0 0 28px;
  background: var(--c);
}

.code {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 8px 6px;
  background: var(--c);
  color: var(--lc-black);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.title {
  align-self: center;
  overflow: hidden;
  padding-left: 6px;
  color: var(--c);
  font-size: clamp(1.15rem, 3.2vw, 1.6rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.meter {
  align-self: center;
  height: 14px;
  border: 2px solid var(--c);
  border-radius: 7px;
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  background: var(--c);
  transition: width 900ms ease-in-out;
}

.value {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 96px;
  justify-content: flex-end;
  padding: 0 18px 0 12px;
  border-radius: 0 28px 28px 0;
  background: var(--c);
  color: var(--lc-black);
  font-size: 1.35rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.value small {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.summary {
  margin: 4px 0 0 40px;
  color: var(--lc-text);
  font-size: 1rem;
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.detail {
  display: flex;
  gap: 12px;
  margin: 10px 0 4px 12px;
  animation: unfold 240ms ease-out;
}

.bracket {
  flex: 0 0 16px;
  border: 6px solid var(--c);
  border-right: 0;
  border-radius: 16px 0 0 16px;
}

.detail-body {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
}

.detail-text {
  margin: 0 0 12px;
  color: var(--lc-ice);
  font-size: 1.05rem;
  line-height: 1.45;
  letter-spacing: 0.02em;
}

.cascade {
  display: grid;
  gap: 2px;
  margin-bottom: 12px;
  color: var(--c);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
  opacity: 0.85;
}

.cascade-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.pill {
  min-height: var(--tap);
  padding: 0 24px;
  border-radius: 24px;
  background: var(--c);
  color: var(--lc-black);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pill:active {
  filter: brightness(1.35);
}

.hint {
  color: var(--lc-dim);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes unfold {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Phones: drop the meter, shrink the code block, keep every tap target 48px+. */
@media (max-width: 560px) {
  /* The title needs the width more than the code does, so the code goes and the
     title may wrap onto a second line. */
  .face {
    grid-template-columns: 18px minmax(0, 1fr) auto;
  }

  .meter,
  .code {
    display: none;
  }

  .title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    padding: 4px 0 4px 4px;
    font-size: 1.15rem;
    white-space: normal;
  }

  .value {
    min-width: 72px;
    padding: 0 14px 0 8px;
    font-size: 1.1rem;
  }

  .summary {
    margin-left: 24px;
  }

  .detail {
    margin-left: 4px;
  }
}
</style>
