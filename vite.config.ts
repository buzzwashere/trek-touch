import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// `vite` does not run Vercel's /api functions, so in dev this serves /api/markets from
// the same core module the production function uses.
function devMarketsApi(finnhubKey: string | undefined): Plugin {
  return {
    name: 'dev-markets-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/markets', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        try {
          // Loaded through Vite so edits to the core apply without a restart.
          const core = (await server.ssrLoadModule(
            '/api/_markets-core.ts',
          )) as typeof import('./api/_markets-core')
          res.end(JSON.stringify(await core.getMarkets({ finnhubKey })))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The '' prefix loads every variable, not just VITE_* ones. The key stays on the
  // server side of the dev middleware; nothing here is exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      devMarketsApi(env.FINNHUB_API_KEY),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
