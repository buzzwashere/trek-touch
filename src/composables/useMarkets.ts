import { onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchMarkets } from '../services/marketsApi'
import type { MarketsSnapshot } from '../types/markets'

// Refresh cadence while the Markets view is open. The server caches for a minute and
// free-tier quotes are delayed, so anything faster only spends rate limit.
const REFRESH_MS = 120_000

export function useMarkets() {
  const snapshot = ref<MarketsSnapshot | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let controller: AbortController | null = null
  let timer: ReturnType<typeof setInterval> | undefined

  async function refresh() {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    error.value = null
    try {
      snapshot.value = await fetchMarkets(controller.signal)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  // No polling while the tab is in the background; catch up when it returns.
  function onVisibility() {
    if (document.visibilityState === 'visible') {
      void refresh()
    }
  }

  onMounted(() => {
    void refresh()
    timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
    controller?.abort()
  })

  return { snapshot, loading, error, refresh }
}
