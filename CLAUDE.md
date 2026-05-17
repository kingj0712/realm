# CLAUDE.md

Notes-to-future-Claude for this repo. **Read `WIKI.md` first** — it has the tile catalog, recent-round changelog, open questions, and conventions. This file is the quickstart. See also: `\\homeassistant.local\config\CLAUDE.md` for broader HA context.

## What this is

Realm is a custom React-based dashboard for a Home Assistant install. HA registers it as a `panel_custom` at sidebar slug `/realm` (icon `mdi:chess-rook`). Aesthetic: full SCADA — dense industrial HMI, neutral near-black surfaces, SCADA palette for state semantics, Barlow Condensed + Share Tech Mono typography, plus personality tiles (tank fills, animated flows, gauges, sliders). Intentionally separate from Lovelace and from the older `scada-panel` React app at `/scada`.

## How it deploys

Source lives here on the Windows dev machine. Build emits a single ES module to `dist/realm.js`. Deploy script copies that to `\\homeassistant.local\config\www\realm\realm.js`, which HA serves at `/local/realm/realm.js`, which `panel_custom:` in HA's `configuration.yaml` references.

Commands:

- `npm run dev` — Vite dev server, panel renders in a browser tab without HA. Uses the mock store.
- `npm run build` — type-check + Vite library build → `dist/realm.js` (single ES module, CSS inlined).
- `npm run deploy` — build, then copy to the HA share. Idempotent.
- `npm run deploy:only` — skip build, just copy the existing `dist/realm.js`.

After the first deploy, HA needs a full restart (not just YAML reload) for `panel_custom` to register. Subsequent bundle updates only need a hard browser refresh — in devtools, tick **Disable cache** then refresh, or use an incognito tab. Plain Ctrl+Shift+R doesn't always invalidate the ES module cache for `panel_custom` modules.

## Architecture (current state — round 9)

- **Entry point:** `src/main.tsx` defines the `<realm-panel>` custom element. Attaches a Shadow DOM, injects tokens.css + components.css + react-grid-layout.css + react-resizable.css (all `?inline`-imported), and renders React inside. Also loads Google Fonts (Barlow Condensed + Share Tech Mono) via a `<link>` injected into document head once.
- **App tree:** `App.tsx` → `HassProvider` (mock store) → `LayoutProvider` (tabs/items/edit state) → `HashRouter` → `Shell` → `Overview` or `ComponentsDemo`.
- **Layout system:** Each Overview tab uses **react-grid-layout v2** for fixed-position drag/resize. Tiles have explicit `(x, y, w, h)` coordinates. `compactor: noCompactor` so gaps are preserved. Row height is **20px**; per-tile `defaultRowSpan` in the registry sets sensible defaults. Drag uses RGL's `dragConfig.handle: '.editable-tile__handle'`; resize uses `resizeConfig` (bottom-right SE handle).
- **Tab system:** `LayoutContext` manages `tabs[]` + `activeTabId`. Each tab has its own `items` array and optional `alarmEntities` list. State persists to `localStorage` under `realm:layout:overview`. **LAYOUT_VERSION = 4** as of round 9 — v3 layouts auto-migrate by wrapping into a single tab.
- **Mock store:** `src/hass/MockHass.ts` seeds ~100 entities + a service handler that mutates state on calls (toggle, set_temperature, set_cover_position, set_hvac_mode, etc.) so tiles feel live without a real HA connection. A history provider returns cached random-walk series for sparklines/plots/charts. Swap to real HA in phase 6+ by replacing `createMockStore()` in `App.tsx`.
- **Subscription model:** `useEntity(id)` is a `useSyncExternalStore` selector hook. Per-entity subscription means only the components watching THIS entity re-render when its state changes. Never read `hass.states` directly in render.

## Where things live

- **Tile catalog + descriptions + recent-round changelog + future ideas + open questions:** `WIKI.md` — **read first**.
- **Tile components:** `src/components/tiles/*` (~60 tile types now).
- **Mock store + entities + service handlers:** `src/hass/MockHass.ts`.
- **Edit infrastructure:** `src/edit/*`
  - `LayoutContext.tsx` — multi-tab state + tile ops + persistence
  - `tileRegistry.tsx` — tile metadata + schema + render fns
  - `TabBar.tsx` — top-of-page tabs (rounds 9+)
  - `AlarmChips.tsx` — pulsing-red chip strip + per-tab alarm config (rounds 9+)
  - `Inspector.tsx` — side-panel property editor (large, readable as of round 9)
  - `Palette.tsx` — add-tile modal with text search (round 9)
  - `EntityPicker.tsx`, `IconPicker.tsx`, `RowEditor.tsx` — Inspector subcomponents
  - `EditModeBanner.tsx` — sticky banner with +ADD TILE / ALARMS / RESET / DONE
  - `EntityDetailModal.tsx` — generic detail modal (infra ready; per-tile wiring still pending)
- **Routes:** `src/pages/Overview.tsx` (config-driven, editable, RGL-backed) and `src/pages/ComponentsDemo.tsx` (static reference for every tile variant).
- **Tokens + component CSS:** `src/styles/tokens.css` + `src/styles/components.css`, both `?inline`-imported into Shadow DOM.

## Conventions

- **Tokens-first:** any new color, type style, spacing, or radius goes into `tokens.css` first; components reference via `var(--name)`. No ad-hoc hex/px values in component styles.
- **No `hass` in props.** Tiles take entity-id strings and subscribe via `useEntity` / `useHistory`. Never pass `hass` or its state through context (it mutates constantly).
- **Optional-entity hooks:** when an entity prop is optional, pass `entityId ?? ''` to `useEntity` so the hook is always called the same number of times. Never wrap `useEntity` in a conditional.
- **Serializable tile props:** any prop the Inspector should edit must be JSON-serializable. The `icon` prop is the only intentional exception — it's stored as a string mdi name and resolved to JSX by the registry render fn.
- **Tile composition:** Most tiles render inside `<BaseTile>` which owns label/status/pill/icon chrome. The exception is `HeaderTile`, which renders raw text + accent underline.
- **No em dashes** in code comments (per project preference). Use commas, parens, or sentence breaks.
- **`crypto.randomUUID()` is unsafe over plain HTTP** — HA on LAN is non-secure context. Use `uid()` from `src/hass/uid.ts` (Math.random fallback).

## Phases

- **Phase 1–9 (done):** scaffold + 60 tile types + iOS-style RGL grid + multi-tab system + alarm chips + edit-mode inspector/palette/duplicate/resize + ECharts plot + homestead-hq digest fetch.
- **Phase 10+ (next, in priority order):**
  1. Wire `EntityDetailModal` onto read-only tiles (Tank/Gauge/Donut/Bar/Value/Sparkline/HistoryBars/Weather/Camera) so clicking opens detail view with history chart.
  2. Swap mock store for live `hass` — reintroduce property setters in `main.tsx`, build a `LiveHassStore` matching the `HassStore` interface, change provider in `App.tsx`. Tiles, hooks, registry, edit infra all stay.
  3. Polish edit UX — replace `window.prompt` in TabBar rename + AlarmsConfig with proper modals + EntityPicker.
  4. Floorplans — `/realm#/floorplan/:floor` route with SVG exports from SweetHome3D + entity hotspots.
  5. Per-breakpoint layouts so phone/tablet/desktop can differ.
