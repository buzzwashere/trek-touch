// Market data for the Markets view, gathered server-side so the Finnhub key never
// reaches the browser. The leading underscore keeps Vercel from treating this file as
// a route; api/markets.ts (production) and the dev middleware in vite.config.ts both
// call getMarkets().
//
// Sources:
// - Finnhub /quote (free key, 60 calls/min, US-listed symbols) for ETF prices. Index
//   levels and foreign exchanges are paid-tier, so each market is tracked through a
//   US-listed ETF: SPY for the S&P 500, VGK for Europe, BNDX for international bonds.
// - US Treasury daily par yield curve (no key) for Treasury yields.

// Relative imports carry `.js`: Vercel runs these functions as native ESM, which needs
// the extension. TypeScript maps it to the .ts source.
import type { MarketRow, MarketSection, MarketsSnapshot } from '../src/types/markets.js'

interface Instrument {
  symbol: string
  name: string
}

const DOMESTIC_STOCKS: Instrument[] = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'DIA', name: 'Dow Jones 30' },
  { symbol: 'QQQ', name: 'Nasdaq-100' },
  { symbol: 'IWM', name: 'Russell 2000' },
]

const INTERNATIONAL_STOCKS: Instrument[] = [
  { symbol: 'VGK', name: 'Europe' },
  { symbol: 'EWJ', name: 'Japan' },
  { symbol: 'FXI', name: 'China Large-Cap' },
  { symbol: 'EEM', name: 'Emerging Markets' },
]

const DOMESTIC_BOND_FUNDS: Instrument[] = [
  { symbol: 'AGG', name: 'US Aggregate Bond' },
  { symbol: 'TLT', name: '20+ Yr Treasury Fund' },
  { symbol: 'LQD', name: 'Investment-Grade Corporate' },
]

const INTERNATIONAL_BONDS: Instrument[] = [
  { symbol: 'BNDX', name: 'Intl Aggregate (Hedged)' },
  { symbol: 'BWX', name: 'Intl Government' },
  { symbol: 'EMB', name: 'Emerging Mkt Sovereign' },
]

// Treasury CSV column header → how the row is labelled.
const TREASURY_MATURITIES: { column: string; symbol: string; name: string }[] = [
  { column: '3 Mo', symbol: 'UST 3M', name: '3-Month Treasury' },
  { column: '2 Yr', symbol: 'UST 2Y', name: '2-Year Treasury' },
  { column: '10 Yr', symbol: 'UST 10Y', name: '10-Year Treasury' },
  { column: '30 Yr', symbol: 'UST 30Y', name: '30-Year Treasury' },
]

const FINNHUB_QUOTE = 'https://finnhub.io/api/v1/quote'
const TREASURY_CSV =
  'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all'

const REQUEST_TIMEOUT_MS = 8000
// Quotes are 20 minutes delayed on the free tier anyway; a minute of caching keeps a
// burst of viewers well inside the 60 calls/minute limit.
const CACHE_TTL_MS = 60_000

let cache: { at: number; keyed: boolean; snapshot: MarketsSnapshot } | null = null

export interface MarketsOptions {
  finnhubKey?: string
}

export async function getMarkets({ finnhubKey }: MarketsOptions): Promise<MarketsSnapshot> {
  const keyed = Boolean(finnhubKey)
  if (cache && cache.keyed === keyed && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.snapshot
  }

  const notices: string[] = []

  const [domesticStocks, internationalStocks, domesticFunds, internationalBonds, treasuries] =
    await Promise.all([
      quotes(DOMESTIC_STOCKS, finnhubKey, notices),
      quotes(INTERNATIONAL_STOCKS, finnhubKey, notices),
      quotes(DOMESTIC_BOND_FUNDS, finnhubKey, notices),
      quotes(INTERNATIONAL_BONDS, finnhubKey, notices),
      treasuryYields(notices),
    ])

  if (!finnhubKey) {
    notices.unshift(
      'FINNHUB_API_KEY is not set, so fund and index prices are unavailable. ' +
        'Treasury yields do not need a key.',
    )
  }

  const sections: MarketSection[] = [
    {
      id: 'domestic-stocks',
      region: 'domestic',
      kind: 'stocks',
      title: 'US Equities',
      rows: domesticStocks,
    },
    {
      id: 'domestic-bonds',
      region: 'domestic',
      kind: 'bonds',
      title: 'US Treasuries & Bonds',
      rows: [...treasuries, ...domesticFunds],
    },
    {
      id: 'international-stocks',
      region: 'international',
      kind: 'stocks',
      title: 'International Equities',
      rows: internationalStocks,
    },
    {
      id: 'international-bonds',
      region: 'international',
      kind: 'bonds',
      title: 'International Bonds',
      rows: internationalBonds,
    },
  ]

  const snapshot: MarketsSnapshot = {
    fetchedAt: new Date().toISOString(),
    sections,
    // The same problem can surface once per symbol; say it once.
    notices: [...new Set(notices)],
  }
  cache = { at: Date.now(), keyed, snapshot }
  return snapshot
}

// --- Finnhub --------------------------------------------------------------------

interface FinnhubQuote {
  c: number // current price
  d: number | null // change
  dp: number | null // percent change
  pc: number // previous close
  t: number // unix seconds of the last trade
}

async function quotes(
  instruments: Instrument[],
  key: string | undefined,
  notices: string[],
): Promise<MarketRow[]> {
  if (!key) {
    return []
  }
  const rows = await Promise.all(instruments.map(i => quote(i, key, notices)))
  return rows.filter((r): r is MarketRow => r !== null)
}

async function quote(
  instrument: Instrument,
  key: string,
  notices: string[],
): Promise<MarketRow | null> {
  try {
    const res = await fetch(`${FINNHUB_QUOTE}?symbol=${encodeURIComponent(instrument.symbol)}`, {
      // The header keeps the key out of URLs that end up in logs.
      headers: { 'X-Finnhub-Token': key },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (res.status === 401 || res.status === 403) {
      notices.push('Finnhub rejected the API key; check FINNHUB_API_KEY.')
      return null
    }
    if (res.status === 429) {
      notices.push('Finnhub rate limit reached; some prices are missing. Try again in a minute.')
      return null
    }
    if (!res.ok) {
      notices.push(`Finnhub returned HTTP ${res.status} for ${instrument.symbol}.`)
      return null
    }
    const q = (await res.json()) as FinnhubQuote
    // Finnhub answers an unknown or unsupported symbol with zeros rather than an error.
    if (!q.c && !q.t) {
      notices.push(`No quote available for ${instrument.symbol}.`)
      return null
    }
    return {
      symbol: instrument.symbol,
      name: instrument.name,
      value: q.c,
      unit: 'usd',
      change: q.d ?? q.c - q.pc,
      changePercent: q.dp ?? (q.pc ? ((q.c - q.pc) / q.pc) * 100 : null),
      asOf: new Date(q.t * 1000).toISOString(),
    }
  } catch (err) {
    notices.push(`Could not reach Finnhub for ${instrument.symbol}: ${describe(err)}.`)
    return null
  }
}

// --- US Treasury ----------------------------------------------------------------

async function treasuryYields(notices: string[]): Promise<MarketRow[]> {
  try {
    const month = easternYearMonth(new Date())
    let rows = await treasuryMonth(month)
    // Early in a month there may be fewer than two published days; the change needs the
    // previous one, so reach back a month.
    if (rows.length < 2) {
      rows = [...rows, ...(await treasuryMonth(previousYearMonth(month)))]
    }
    const [latest, prior] = rows
    if (!latest) {
      notices.push('The Treasury has not published any yields for this month yet.')
      return []
    }
    return TREASURY_MATURITIES.flatMap(m => {
      const rate = latest.rates[m.column]
      if (rate === undefined) {
        return []
      }
      const before = prior?.rates[m.column]
      return [
        {
          symbol: m.symbol,
          name: m.name,
          value: rate,
          unit: 'percent' as const,
          change: before === undefined ? 0 : round(rate - before, 4),
          changePercent: null,
          asOf: latest.date,
        },
      ]
    })
  } catch (err) {
    notices.push(`Could not load Treasury yields: ${describe(err)}.`)
    return []
  }
}

interface TreasuryDay {
  date: string // YYYY-MM-DD
  rates: Record<string, number>
}

// One month of the daily par yield curve, newest day first (the order the CSV uses).
async function treasuryMonth(yearMonth: string): Promise<TreasuryDay[]> {
  const url =
    `${TREASURY_CSV}/${yearMonth}?type=daily_treasury_yield_curve` +
    `&field_tdr_date_value_month=${yearMonth}&page&_format=csv`
  const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const lines = (await res.text()).trim().split(/\r?\n/)
  const header = (lines.shift() ?? '').split(',').map(h => h.replace(/"/g, '').trim())
  const days: TreasuryDay[] = []
  for (const line of lines) {
    const cells = line.split(',')
    const [mm, dd, yyyy] = (cells[0] ?? '').split('/')
    if (!mm || !dd || !yyyy) {
      continue
    }
    const rates: Record<string, number> = {}
    header.forEach((col, i) => {
      const n = Number(cells[i])
      if (i > 0 && cells[i] !== '' && Number.isFinite(n)) {
        rates[col] = n
      }
    })
    days.push({ date: `${yyyy}-${mm}-${dd}`, rates })
  }
  return days
}

// The Treasury publishes on US Eastern business days, so "this month" is Eastern's.
function easternYearMonth(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d)
  const year = parts.find(p => p.type === 'year')?.value ?? String(d.getUTCFullYear())
  const month = parts.find(p => p.type === 'month')?.value ?? '01'
  return `${year}${month}`
}

function previousYearMonth(yearMonth: string): string {
  const year = Number(yearMonth.slice(0, 4))
  const month = Number(yearMonth.slice(4))
  return month === 1 ? `${year - 1}12` : `${year}${String(month - 1).padStart(2, '0')}`
}

function round(n: number, places: number): number {
  const f = 10 ** places
  return Math.round(n * f) / f
}

function describe(err: unknown): string {
  if (err instanceof Error) {
    return err.name === 'TimeoutError' ? 'timed out' : err.message
  }
  return String(err)
}
