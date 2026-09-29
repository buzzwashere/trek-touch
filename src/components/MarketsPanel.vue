<script setup lang="ts">
import { computed } from 'vue'
import { useMarkets } from '../composables/useMarkets'
import type { MarketRegion, MarketRow, MarketSection } from '../types/markets'

const { snapshot, loading, error, refresh } = useMarkets()

const REGIONS: { id: MarketRegion; label: string }[] = [
  { id: 'domestic', label: 'Domestic' },
  { id: 'international', label: 'International' },
]

const SECTION_COLORS: Record<string, string> = {
  'domestic-stocks': 'var(--lc-periwinkle)',
  'domestic-bonds': 'var(--lc-ice)',
  'international-stocks': 'var(--lc-lilac)',
  'international-bonds': 'var(--lc-peach)',
}

function sectionsFor(region: MarketRegion): MarketSection[] {
  return snapshot.value?.sections.filter(s => s.region === region) ?? []
}

const ET = 'America/New_York'

const fetchedText = computed(() => {
  const at = snapshot.value?.fetchedAt
  if (!at) {
    return ''
  }
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(at))
})

const etDay = new Intl.DateTimeFormat('en-CA', { timeZone: ET })
const shortDate = (d: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric' }).format(d)

// Today's quotes show their time; anything older (a weekend, a holiday, a Treasury
// yield, which is published once a day) shows the day it closed.
function asOfText(row: MarketRow): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(row.asOf)) {
    return `${shortDate(new Date(`${row.asOf}T00:00:00Z`), 'UTC')} close`
  }
  const at = new Date(row.asOf)
  if (etDay.format(at) !== etDay.format(new Date())) {
    return `${shortDate(at, ET)} close`
  }
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    hour: 'numeric',
    minute: '2-digit',
  }).format(at)
  return `${time} ET`
}

function valueText(row: MarketRow): string {
  return row.unit === 'percent' ? `${row.value.toFixed(2)}%` : `$${row.value.toFixed(2)}`
}

function signed(n: number, digits: number): string {
  const s = Math.abs(n).toFixed(digits)
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s
}

// Yields move in basis points; prices in dollars and percent.
function changeText(row: MarketRow): string {
  if (row.unit === 'percent') {
    return `${signed(Math.round(row.change * 100), 0)} bp`
  }
  const pct = row.changePercent === null ? '' : ` (${signed(row.changePercent, 2)}%)`
  return `${signed(row.change, 2)}${pct}`
}

function direction(row: MarketRow): 'up' | 'down' | 'flat' {
  if (row.change > 0) {
    return 'up'
  }
  return row.change < 0 ? 'down' : 'flat'
}

const ARROWS = { up: '▲', down: '▼', flat: '■' }
</script>

<template>
  <div class="markets">
    <div class="status-row">
      <p
        class="status"
        role="status"
      >
        <template v-if="loading && !snapshot">Accessing financial database&hellip;</template>
        <template v-else-if="snapshot">Updated {{ fetchedText }} ET</template>
      </p>
      <button
        type="button"
        class="refresh"
        :disabled="loading"
        @click="refresh"
      >
        {{ loading ? 'Scanning' : 'Refresh' }}
      </button>
    </div>

    <div
      v-if="error"
      class="notice notice-error"
      role="alert"
    >
      <span
        class="notice-bar"
        aria-hidden="true"
      ></span>
      <p>Market data unavailable: {{ error }}</p>
    </div>

    <div
      v-for="notice in snapshot?.notices ?? []"
      :key="notice"
      class="notice"
    >
      <span
        class="notice-bar"
        aria-hidden="true"
      ></span>
      <p>{{ notice }}</p>
    </div>

    <div
      v-if="snapshot"
      class="regions"
    >
      <section
        v-for="region in REGIONS"
        :key="region.id"
        class="region"
        :aria-labelledby="`region-${region.id}`"
      >
        <h2
          :id="`region-${region.id}`"
          class="region-title"
        >
          <span
            class="region-cap"
            aria-hidden="true"
          ></span>
          {{ region.label }}
        </h2>

        <div
          v-for="section in sectionsFor(region.id)"
          :key="section.id"
          class="section"
          :style="{ '--c': SECTION_COLORS[section.id] }"
        >
          <h3 class="section-title">{{ section.title }}</h3>
          <p
            v-if="section.rows.length === 0"
            class="empty"
          >
            No readings
          </p>
          <ul
            v-else
            class="rows"
          >
            <li
              v-for="row in section.rows"
              :key="row.symbol"
              class="row"
            >
              <span
                class="cap"
                aria-hidden="true"
              ></span>
              <span class="symbol">{{ row.symbol }}</span>
              <span class="name">
                {{ row.name }}
                <small>{{ asOfText(row) }}</small>
              </span>
              <span class="value">{{ valueText(row) }}</span>
              <span
                class="change"
                :class="direction(row)"
              >
                <span aria-hidden="true">{{ ARROWS[direction(row)] }}</span>
                {{ changeText(row) }}
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <p class="source">
      Fund prices: Finnhub (free tier, delayed). Treasury yields: U.S. Department of the
      Treasury. Markets are tracked through US-listed ETFs. Not investment advice.
    </p>
  </div>
</template>

<style scoped>
.markets {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status {
  margin: 0;
  color: var(--lc-ice);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.refresh {
  min-height: var(--tap);
  padding: 0 24px;
  border-radius: 24px;
  background: var(--lc-gold);
  color: var(--lc-black);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.refresh:active {
  filter: brightness(1.3);
}

.refresh:disabled {
  opacity: 0.6;
  cursor: progress;
}

.notice {
  display: flex;
  gap: 10px;
}

.notice-bar {
  flex: 0 0 8px;
  border-radius: 4px;
  background: var(--lc-gold);
}

.notice-error .notice-bar {
  background: var(--lc-red);
}

.notice p {
  margin: 0;
  color: var(--lc-peach);
  font-size: 1rem;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.regions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
  /* The row gap only shows when International wraps under Domestic. */
  gap: 36px 48px;
}

.region {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.region-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--lc-orange);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.region-cap {
  width: 28px;
  height: 22px;
  border-radius: 11px 0 0 11px;
  background: var(--lc-orange);
}

.section-title {
  margin: 0 0 6px;
  color: var(--c);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.empty {
  margin: 0;
  padding: 10px 14px;
  border-left: 6px solid var(--c);
  color: var(--lc-dim);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: grid;
  grid-template-columns: 14px 68px minmax(0, 1fr) auto auto;
  align-items: stretch;
  gap: 6px;
  min-height: var(--tap);
}

.cap {
  border-radius: 24px 0 0 24px;
  background: var(--c);
}

.symbol {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 0 8px 5px;
  background: var(--c);
  color: var(--lc-black);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.name {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding-left: 4px;
  overflow: hidden;
  color: var(--c);
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.15;
  text-transform: uppercase;
  /* Two-column layouts leave the name little room; wrap rather than truncate. */
  overflow-wrap: anywhere;
}

.name small {
  color: var(--lc-dim);
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.08em;
}

.value {
  align-self: center;
  color: var(--lc-text);
  font-size: 1.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.change {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 92px;
  padding: 0 14px 0 8px;
  border-radius: 0 24px 24px 0;
  background: #1a1a1a;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.change.up {
  color: var(--lc-ice);
}

.change.down {
  color: var(--lc-orange);
}

.change.flat {
  color: var(--lc-dim);
}

.source {
  margin: 4px 0 0;
  color: var(--lc-dim);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

/* Phones: drop the symbol block into the name column and let the change pill shrink. */
@media (max-width: 560px) {
  .row {
    grid-template-columns: 10px minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    row-gap: 2px;
  }

  .cap {
    grid-row: 1 / 3;
  }

  .symbol {
    display: none;
  }

  .name {
    grid-column: 2;
    grid-row: 1 / 3;
  }

  .value {
    grid-column: 3;
    grid-row: 1;
    padding-right: 4px;
    font-size: 1.05rem;
  }

  .change {
    grid-column: 3;
    grid-row: 2;
    min-width: 0;
    padding: 2px 10px 2px 6px;
    font-size: 0.8rem;
  }
}
</style>
