# trek-touch

A touch-first Vue 3 app styled after LCARS, the console interface from Star Trek: Voyager.
Fan-made; not affiliated with or endorsed by the owners of Star Trek.

The default route, **Bridge** (`src/views/TestTrek.vue`), is an LCARS console. It has
elbow frames, a department rail, a live stardate and a dozen status "ribbons":

- **Tap** a department on the rail to filter the ribbons.
- **Tap** a ribbon to expand its report and live data cascade.
- **Swipe right** on a ribbon to acknowledge it, or use the Acknowledge button.
- **Red Alert** and **Audio** (synthesised chirps, off by default) sit at the foot of the rail.
- **Markets** shows the day's domestic and international stock and bond markets.

## Setup

```sh
npm install
cp .env.example .env.local   # then add a free Finnhub key (see Markets data below)
npm run dev      # http://localhost:9006, also exposed on the LAN for testing on a phone
npm run build    # type-check + production build
```

## Markets data

`GET /api/markets` gathers everything server-side, so the API key never reaches the browser:

| Data | Source | Key |
| --- | --- | --- |
| Stock and bond fund prices (SPY, DIA, QQQ, IWM, VGK, EWJ, FXI, EEM, AGG, TLT, LQD, BNDX, BWX, EMB) | [Finnhub](https://finnhub.io) `/quote`, free tier: 60 calls/min, US-listed symbols | `FINNHUB_API_KEY` |
| Treasury yields (3M, 2Y, 10Y, 30Y) | [US Treasury daily par yield curve](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve) CSV | none |

Index levels and foreign exchanges are paid-tier on Finnhub, so each market is tracked
through a US-listed ETF. Without a key the view still shows Treasury yields and says why
the rest is missing.

- `api/_markets-core.ts` does the fetching and normalising, with a 60-second cache.
- `api/markets.ts` is the Vercel function; set `FINNHUB_API_KEY` in the Vercel project.
- In dev, `vite.config.ts` serves the same core at `/api/markets` and reads the key from
  `.env.local`.
