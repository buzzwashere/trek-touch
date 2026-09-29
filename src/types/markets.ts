// The shape /api/markets returns. Shared by the serverless function and the app, so
// the UI never deals with a provider's own field names.

export type MarketRegion = 'domestic' | 'international'
export type MarketKind = 'stocks' | 'bonds'

export interface MarketRow {
  symbol: string
  name: string
  // A price in dollars, or a yield in percent — see `unit`.
  value: number
  unit: 'usd' | 'percent'
  // Change since the previous close, in the row's unit. For a yield that is percentage
  // points, which the UI shows as basis points.
  change: number
  // Percent change for prices; null for yields, where it would mean little.
  changePercent: number | null
  // When the value was last updated, ISO 8601. Outside market hours this is the last
  // close, so it can be an earlier day.
  asOf: string
}

export interface MarketSection {
  id: string
  region: MarketRegion
  kind: MarketKind
  title: string
  rows: MarketRow[]
}

export interface MarketsSnapshot {
  fetchedAt: string
  sections: MarketSection[]
  // Human-readable problems that left some rows out, e.g. a missing API key.
  notices: string[]
}
