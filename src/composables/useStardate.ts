import { onBeforeUnmount, ref } from 'vue'

// A Voyager-flavoured stardate: 1 Jan 2026 is pinned to 48315.6 and it advances 1000
// units per year, so it ticks visibly (about 0.1 every 53 minutes) without meaning much —
// which is faithful to the source material.
const EPOCH = Date.UTC(2026, 0, 1)
const EPOCH_STARDATE = 48315.6
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000

export function stardateAt(ms: number): number {
  return EPOCH_STARDATE + ((ms - EPOCH) / MS_PER_YEAR) * 1000
}

export function useStardate(intervalMs = 10_000) {
  const stardate = ref(stardateAt(Date.now()))
  const timer = setInterval(() => {
    stardate.value = stardateAt(Date.now())
  }, intervalMs)
  onBeforeUnmount(() => clearInterval(timer))
  return stardate
}
