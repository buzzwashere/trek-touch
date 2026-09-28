# trek-touch

A touch-first Vue 3 app styled after LCARS, the console interface from Star Trek: Voyager.
Fan-made; not affiliated with or endorsed by the owners of Star Trek.

The default route, **Bridge** (`src/views/TestTrek.vue`), is an LCARS console. It has
elbow frames, a department rail, a live stardate and a dozen status "ribbons":

- **Tap** a department on the rail to filter the ribbons.
- **Tap** a ribbon to expand its report and live data cascade.
- **Swipe right** on a ribbon to acknowledge it, or use the Acknowledge button.
- **Red Alert** and **Audio** (synthesised chirps, off by default) sit at the foot of the rail.

## Setup

```sh
npm install
npm run dev      # http://localhost:9006, also exposed on the LAN for testing on a phone
npm run build    # type-check + production build
```
