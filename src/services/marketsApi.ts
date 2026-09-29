import type { MarketsSnapshot } from '../types/markets'

// Served by api/markets.ts on Vercel and by the dev middleware in vite.config.ts.
const ENDPOINT = '/api/markets'

export async function fetchMarkets(signal?: AbortSignal): Promise<MarketsSnapshot> {
  const res = await fetch(ENDPOINT, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) {
        detail = body.error
      }
    } catch {
      // Not JSON; the status is all there is.
    }
    throw new Error(detail)
  }
  return (await res.json()) as MarketsSnapshot
}
