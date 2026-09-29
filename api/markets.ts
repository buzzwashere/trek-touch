// GET /api/markets on Vercel. Set FINNHUB_API_KEY in the project's environment
// variables; without it only Treasury yields are returned.
//
// The `.js` extension is required: Vercel runs this as native ESM, which does not
// resolve extensionless relative imports. TypeScript maps it to the .ts source.
import { getMarkets } from './_markets-core.js'

export async function GET(): Promise<Response> {
  const snapshot = await getMarkets({ finnhubKey: process.env.FINNHUB_API_KEY })
  return Response.json(snapshot, {
    headers: {
      // Let Vercel's edge cache serve repeat visits for a minute.
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
