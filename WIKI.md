# Realm — Internal Wiki

A living reference for the project owner and future Claude sessions. Capture decisions, tile capabilities, future ideas, and rationale here so we never re-litigate the same questions. Treat the **Future Ideas** and **Open Questions** sections as durable scratchpads — append to them as new ideas land.

Companion docs: `CLAUDE.md` (build/deploy quickstart for Claude sessions), `\\homeassistant.local\config\CLAUDE.md` (broader HA context).

---

## 1. What Realm Is

Realm is a custom React-based Home Assistant dashboard registered as a `panel_custom` at sidebar slug `/realm`. It's intentionally separate from Lovelace and from the existing `scada-panel` React app. The visual language is full SCADA: dense industrial HMI, dark neutral surfaces, SCADA palette for state semantics, Barlow Condensed + Share Tech Mono typography. Tiles emphasize personality (tank visuals, animated flow, gauges, charts) over flat data tables.

The app starts as a single-pane-of-glass overview and is intended to grow into:

- Interactive floorplans (SVG, sourced from SweetHome3D exports)
- Per-room and per-equipment deep-dive pages
- History plots and analytics
- Eventually replacing the older scada-panel entirely

---

## 1.5 Vision & Goals

Realm should be **the easiest HA dashboard to customize and the most fun to use**. Today it leans personal (the author's entities, the author's layout). The direction we're moving toward:

### Pillars (use these to evaluate every change)

1. **Easy to navigate.** Every action discoverable in ≤2 clicks from the active page. Tab bar always visible. Edit toggle obvious. No hidden menus or right-click-only essentials.
2. **Intuitive.** Gestures and patterns match what users expect — iOS-home-screen for drag, Notion-block for tile config, browser-tab for tab management. Click-in-view-mode = activate the tile. Click-in-edit-mode = configure it. Same actions always live in the same place.
3. **Extremely customizable.** Every tile has a rich Inspector. Themes, column counts, row heights, per-breakpoint layouts, tile templates that can be saved and shared. Power users can go deep; new users get sensible defaults.
4. **Fun.** Animations serve the data (tank fills, drum spins, alarm pulses, dashed flow lines) — not gratuitous, but never afraid of personality. Satisfying micro-interactions. Tiles that delight: more weird/specific tile types as inspiration strikes.

### Active backlog — pull from here when planning rounds

**Path to fork-and-customize (anyone can use this, not just the author):**
- [x] **Empty-state Overview / first-run welcome** — done in round 10, polished in round 14.1: new installs land on a Welcome tab (pure HeaderTiles, zero entity deps) + a curated Showcase tab (renamed from Demo). The exhaustive tile catalog lives on the `/components` page; the Showcase tab is a polished dashboard example, not a dump.
- [x] **Generic defaults** — done in round 12. Demo people now use `person.user_1` / `person.user_2` style IDs instead of author-specific examples.
- [x] **Sample dashboard library** — done in round 10. `src/edit/sampleLayouts.ts` exports four samples (Welcome, Smart Home Starter, Homestead Ops, Showcase) wired into a TEMPLATES button in the edit banner. Each loads as a new tab.
- [x] **Deploy target configuration** — done in v0.9.1: `REALM_DEPLOY_TARGET` env var overrides the hardcoded HA share path.
- [x] **Entity remapping helper** — done in round 14. Edit-mode REMAP button opens a modal that scans the active tab, lists every DEMO entity in use, and bulk-swaps to user-picked LIVE entities. See `src/edit/RemapEntitiesModal.tsx` + `src/edit/entityRemap.ts`.
- [x] **Build from my HA starter** — done in round 14. Edit-mode BUILD FROM HA button scans live entities by domain and offers a preview-before-add starter tab. `src/edit/StarterFromLiveModal.tsx`.
- [ ] **Onboarding flow** — first-run wizard that asks "scan my HA entities and build a starter layout?" vs. "give me the demo." Welcome layout from round 10 covers the static side; the BUILD FROM HA button is the manual entry point until we wrap it in a wizard.
- [ ] **Setup docs** — a tutorial walking from `git clone` → live HA panel in 10 minutes.

**Navigation polish:**
- [x] Keyboard shortcuts — `E` toggle edit, `/` open palette (focuses its autoFocus search), `Esc` deselect selected tile. `⌘D` duplicate still pending.
- [x] Inline tab rename instead of `window.prompt` — done in round 10.
- [x] Deep-dive routes scaffolded — `/entity/:entityId` and `/room/:roomId` routes ship in round 14 with title/state/attributes/history. Tiles still open modals by default; switching modal-vs-route on tile click is incremental work.
- [ ] Tab drag-reorder.

**Intuitive UX:**
- [x] Replace `window.prompt`/`confirm` in AlarmsConfig — done in round 10, now uses inline EntityPicker. Tab delete + Reset still use `window.confirm` for the dangerous-action acknowledgement (intentional).
- [x] **Visual feedback for service calls** — done in round 14. `HassStore.subscribeServiceEvents()` emits success/error/no-handler events; `ToastHost` renders a SCADA-styled toast stack via `ModalPortal`. Bottom-right on desktop, bottom-center on mobile.
- [x] **Tile error boundaries** — done in round 14. Each tile render is wrapped in `TileErrorBoundary`; a misconfigured tile shows an inline "Render error" placeholder with Retry/Edit Props/Delete actions instead of blanking the dashboard.
- [x] **Confirm before consequential actions** — done in round 14. `ButtonTile` gains `confirmBeforeAction` + `confirmMessage` props; `VehicleTile` always confirms remote start. Uses a shadow-root-friendly `ConfirmModal` rather than `window.confirm`.
- [x] **Standardized missing-entity states** — done in round 14. `getEntityDisplayState()` returns `UNMAPPED` for placeholders the user hasn't remapped, `UNAVAILABLE` for live HA entities in `unavailable`/`unknown`, and `NO ENTITY` for blank IDs. Wired into Value/Status/Gauge/Tank/Bar tiles.
- [ ] Loading skeleton instead of empty tile while history fetches.
- [ ] Drag preview that follows cursor with size badge (already partially done; polish).

**Customizability:**
- [x] **Per-breakpoint layouts — scaffold landed in round 14.** `LayoutItem.layouts?: Partial<Record<Breakpoint, {x,y,w,h}>>` is now part of the schema. `Overview` reads per-breakpoint slots when present and falls back to canonical x/y/w/h otherwise. Editing still writes canonical; per-breakpoint editing UI is the next step (advanced mode toggle in Inspector).
- [ ] Theme picker — surface palette and accent color, not just the SCADA defaults. See section 12.
- [ ] Custom row height / column count per tab.
- [x] Save layout snapshots — done in round 13 with edit-mode EXPORT / IMPORT JSON buttons.
- [x] **Named local snapshots** — done in round 14. Edit-mode SNAPSHOTS button manages localStorage-backed snapshots (`realm:layout:snapshots`). Save / restore / rename / delete / export-as-JSON. Independent from the file EXPORT — both ship.
- [x] **Entity picker improvements** — done in round 14. Domain chips + source filter (All / LIVE / DEMO). Live entities still sort first.
- [ ] User-defined tile templates (save a configured tile as a reusable preset).
- [ ] Custom CSS hook for power users.

**Fun:**
- [ ] More personality tiles — coop status with chicken icons, beehive with bee animation, rain-radar tile with falling raindrops.
- [ ] Satisfying drag/drop sound effects (off by default, toggleable).
- [ ] Tile reveal animation when entering edit mode.
- [ ] Easter egg tile types (Pong-Tile? Aquarium-Tile that shows fake fish?).
- [ ] Confetti animation when an alarm clears.
- [ ] Status-color "weather effects" on the dashboard background (subtle gradient shift when an alarm is active).

---

## 2. Architecture Overview

### Source & deploy
- **Source repo:** local Windows checkout (path varies per machine — author's is `C:\Users\kingj\dev\realm\`).
- **Build:** Vite library mode → single ES module bundle (`dist/realm.js`).
- **Deploy:** `npm run deploy` copies the bundle into `\\homeassistant.local\config\www\realm\realm.js` over SMB.
- **HA serves it** at `/local/realm/realm.js`, which `panel_custom:` in `configuration.yaml` references.
- After the very first deploy, HA needs a full restart for `panel_custom` to register. Subsequent bundle updates only need a hard browser refresh (devtools → Disable cache, or incognito tab).

### Runtime composition
- `src/main.tsx` defines `<realm-panel>` as a custom element, attaches Shadow DOM, injects fonts + tokens CSS + component CSS, mounts React into a div inside the shadow root.
- React 19 + React Router 7 (HashRouter — HA owns the URL above `/realm`).
- Routes: `/` (Overview — config-driven, editable) and `/components` (static demo of every tile variant).

### State layers
- **`HassProvider` + `useEntity(id)`** — `useSyncExternalStore`-backed selector hook. Subscribing per-entity avoids full-tree re-renders when HA state mutates constantly.
- **Live/demo store (`createMockStore()`)** powers everything. The demo pool keeps local dev and unmapped tiles interactive. In Home Assistant, `HassStore.syncFromLive()` overlays live entities on top, live wins on collisions, and service calls route to HA only when the target entity is live. A `setHistoryProvider` still returns cached random-walk series for sparklines/plots.
- **`LayoutProvider` + `useLayout()`** — owns the dashboard layout, edit mode flag, and selected tile id. Persists to `localStorage` under `realm:layout:overview`.

### Design tokens
- `src/styles/tokens.css` is the locked variables file (surfaces, type scale, status colors, status background tints for pills, spacing, radii).
- `src/styles/components.css` holds all component styles (shell, all tile types, edit mode chrome).
- Both injected into the Shadow DOM via `?inline` imports in `main.tsx`.
- Fonts: Barlow Condensed + Share Tech Mono + Barlow, loaded once via a `<link>` injected into `document.head` (Shadow DOM children inherit document-level font registrations).

### Why Shadow DOM?
- Isolates Realm's styling from HA's chrome and from user-installed themes. We fully own the surface inside the panel. The HA theme (`realm_dark.yaml`) governs only the surrounding HA chrome (sidebar, header) so the two read coherently side by side.

---

## 3. Tile Catalog

All 60+ tile types (60 in the registry today plus the `EntityDetailModal` infrastructure entry). Each tile is a React component that subscribes to its own entities via `useEntity`. Edit-mode adds a serializable config schema in `src/edit/tileRegistry.tsx`. The exhaustive live demo lives at `/components`; the Showcase tab is a curated subset.

| Tile | Category | Purpose / Visual |
|------|----------|------------------|
| **ValueTile** | Info | Single numeric value + unit. Optional thresholds tint the value (`warn`/`alarm`). |
| **StatusTile** | Info | Binary entity as a big labeled state (e.g. `OPEN` / `CLOSED`). State→status map configurable. |
| **AlarmTile** | Info | Active/clear alarm with pulsing outer glow when triggered and `●` indicator dot. |
| **ToggleTile** | Control | Click to toggle; visual pill switch + ON/OFF label. |
| **ButtonTile** | Control | Explicit action button with state-aware pill and button label. Defaults to `${domain}.toggle`. |
| **SetpointTile** | Control | Climate current → target with −/+ adjusters. Mode pill (heat/cool/off). |
| **SliderTile** | Control | Drag for brightness 0-100; commits `light.turn_on` with `brightness_pct` on release. |
| **ColorPickerTile** | Control | Hue strip (rainbow gradient) + brightness slider. Commits `rgb_color`. |
| **TankTile** | Visualization | Vertical tank SVG with animated liquid level. Color follows status thresholds. Tick marks at 25/50/75%. |
| **GaugeTile** | Visualization | 270° arc gauge. Min/max range, smooth fill animation, thresholds. |
| **DonutTile** | Visualization | Full radial percentage ring with center label. |
| **BarTile** | Visualization | Horizontal level meter with min/max scale labels and tinted fill. |
| **SparklineTile** | Visualization | Current value + mini trend line under it. Line draws in on mount. |
| **PlotTile** | Visualization | Larger SVG line chart with Y-axis gridlines, axis labels, area fill. Hand-rolled (no chart lib). |
| **HistoryBarsTile** | Visualization | Vertical bar chart for daily/aggregated history. Reads from history attribute or generated series. |
| **HeatmapTile** | Visualization | Calendar-style grid colored by intensity (GitHub-contribution-graph style). |
| **WeatherTile** | Info | Current condition icon + temp hero + humidity/wind/pressure strip + 3-day forecast row. |
| **CameraTile** | Info | Camera viewport with corner brackets, REC dot pulse, live timestamp. NO-SIGNAL placeholder. |
| **MediaPlayerTile** | Control | Album art + title/artist + progress + transport. Animated equalizer bars when playing. |
| **EnergyFlowTile** | Visualization | Animated dashed flow lines from sources (grid/solar/battery) → home. Battery direction reverses on charging. |
| **ClockTile** | Info | Big mono time + day/date. Minute-aligned by default; optional seconds. |
| **AreaListTile** | Group | Multiple entities per row, each cell typed (`value` / `binary` / `toggle`). The bedroom-style group tile. |
| **MultiMetricTile** | Group | Grid of label+value cells in one tile (e.g. boiler Supply/Return/Delta-T/PSI). Per-metric thresholds. |
| **StatusListTile** | Group | List of binary entities with `●`/`○` symbology and per-row state labels. |
| **PresenceListTile** | Group | List of people with avatar (initials) and zone state. |
| **CalendarTile** | Info | Upcoming events from a `calendar.*` entity with day/time + summary. |
| **TodoListTile** | Info | Checkable items from a `todo.*` entity; clicking toggles status via `todo.update_item`. |
| **PersonTile** | Info | Single person presence with avatar + zone + colored ring indicator. |
| **SceneButtonTile** | Control | Large tap-to-activate scene button with flash animation on activation. |
| **NotificationFeedTile** | Info | Scrollable list of recent notifications with level dot (info/warn/alarm/ok). |
| **WindCompassTile** | Visualization | Compass rose with rotating arrow + speed/unit center label. |
| **SunMoonTile** | Visualization | Sunrise/sunset arc with sun position + sunrise/sunset times + moon phase glyph. |
| **NetworkTile** | Info | Internet status with down/up Mbps and ping. Down arrow = info, up arrow = warn. |
| **ServerStatsTile** | Info | CPU / RAM / Disk bars with threshold-colored values. |
| **VacuumTile** | Control | Battery + state with start/stop/dock buttons. Spinner while active. |
| **BeehiveTile** | Homestead | Weight + temp + humidity with brood-temperature health check. |
| **IrrigationTile** | Homestead | Per-zone running indicator, click to toggle. |
| **TrashScheduleTile** | Homestead | Countdown days + next pickup date + type pill. |
| **GeneratorTile** | Homestead | State pill + fuel bar (color by level) + last run + total runtime. |
| **MailboxTile** | Homestead | Package count + mail count + last-delivery time. |
| **TimerTile** | Info | Circular countdown ring with start/pause/cancel; ticks down each second. |
| **HVACScheduleTile** | Info | 24-hour stepped setpoint timeline with a current-hour cursor. |
| **ClimateThermostatTile** | Control | Detailed thermostat: current/target+humidity, mode/fan/preset buttons. Boolean props (`showModeButtons`, `showFanButtons`, `showPresetButtons`, `showHumidity`, `showAction`) toggle each section. Use instead of SetpointTile for full control. |
| **AirPurifierTile** | Control | PM1/2.5/10 + filter life bar + fan preset selector. Animated airflow when active. |
| **LightFanTile** | Control | Combined ceiling light brightness slider + fan speed selector + direction toggle. |
| **CurtainTile** | Control | Animated curtain panels that slide based on cover position. Position slider (0-100%) + OPEN/CLOSE buttons. |
| **NASTile** | Info | Storage donut + read/write throughput + connected users. |
| **SpeedTestTile** | Info | Down/up/ping with manual RUN TEST trigger (configurable service). |
| **StarlinkTile** | Info | Throughput + ping + uptime + obstruction bar. |
| **UDMTile** | Info | UniFi Dream Machine: WAN status, client count, throughput, uptime. |
| **VehicleTile** | Control | Battery + range + lock/unlock/start/climate quick controls. |
| **LaundryTile** | Info | Washer + dryer side-by-side with spinning-drum animation when running. Optional `washerExtras` / `dryerExtras` arrays add `{label, entityId}` rows below each appliance (door, mode, time remaining, etc.). |
| **SankeyTile** | Visualization | Hand-rolled Sankey: sources → consumers, proportional ribbon widths. |
| **CountdownTile** | Info | D/H/M/S countdown to a target. Optional repeat (daily/weekly/monthly/yearly). |
| **WeatherRadarTile** | Visualization | Iframe slot for windy/rainviewer; animated radar placeholder when no URL. |
| **ApplianceTile** | Info | Generic Samsung/SmartThings appliance (cycle, time remaining, temps, door, power). |
| **HomelabTile** | Info | Multi-host overview with CPU + RAM bars per host. |
| **BlindsTile** | Control | Blinds descend from top of window, scale with cover position. Smooth CSS-animated SVG matrix transform. |
| **WeeklyDigestTile** | Info | Pulls weekly digest text from a configurable endpoint. Default URL is empty so the tile shows a SAMPLE digest until you point it at your own service. Server must allow CORS from the HA origin. |
| **EntityDetailModal** | (infra) | Generic detail modal — shows a chart + attributes table for an entity. Wire from any tile's `onClick`. Pattern: `useState(false)` → modal element conditional → onClick on BaseTile. |
| **HeaderTile** | Misc | Section header text (no BaseTile chrome). Configurable text, optional subtitle, accent underline color (default/ok/warn/alarm/info). Drop above a group of tiles to label that section. Defaults to full width × 40px. |

---

## 4. Edit Mode

### How to use
1. Open Realm. The Overview is the only config-driven page (Components is a static demo).
2. Click the pencil icon in the top-right of the header to enter edit mode. The banner appears at the top with `+ ADD TILE`, `RESET`, `DONE` buttons.
3. **Rearrange:** Grab the `⋮⋮` handle on any tile and drag to a new position. The grid uses react-grid-layout v2 with fixed slots and collision prevention.
4. **Resize:** Click a tile to open the Inspector. Use the WIDTH preset buttons (`XS`/`SM`/`MD`/`LG`/`XL`/`FULL` = col spans 2/3/4/6/8/12).
5. **Reassign entities:** Click a tile. In the Inspector, use the Entity field's searchable picker. The list filters by allowed domains for that tile (e.g. only `binary_sensor` for StatusTile).
6. **Change icon:** Click the icon field's swatch to open the IconPicker (search + grid of available mdi icons).
7. **Edit multi-entity rows:** For AreaListTile, MultiMetricTile, StatusListTile, IrrigationTile, PresenceListTile — the Rows section has add/remove/reorder controls per entry. AreaListTile rows additionally manage typed cells inside each row.
8. **Add a tile:** Click `+ ADD TILE` to open the Palette. Pick a category, click a tile type — it appears at the end of the grid with default props, ready to configure.
9. **Delete a tile:** Inspector → `DELETE TILE` button (red, at the bottom).
10. **Reset to defaults:** Banner → `RESET`. Confirms first.
11. Click `DONE` (green) to exit edit mode.

### Layout schema
```ts
interface LayoutItem {
  id: string;       // unique
  type: string;     // tile registry key, e.g. 'TankTile'
  x: number;        // grid column
  y: number;        // grid row
  w: number;        // width in columns
  h: number;        // height in 20px rows
  props: Record<string, unknown>;  // tile-specific config, all JSON-serializable
}
```

The `icon` prop is stored as a string name (e.g. `"mdiBarrel"`); the tile registry resolves it to a React element when rendering. This keeps the whole layout JSON-serializable.

### Persistence
- localStorage key: `realm:layout:overview`.
- Schema is versioned (`LAYOUT_VERSION`). If the version doesn't match on load, fall back to defaults.
- Future: sync to HA `frontend.set_user_data` for cross-device.

### Responsive grid
- Mobile (<600px): 4 columns.
- Tablet (600–1024px): 8 columns.
- Desktop (>1024px): 12 columns.
- A tile with `w: 6` takes up to 4/6/6 cols at the current breakpoint, depending on available columns.
- The compactor is disabled and collision prevention is enabled, so deliberate gaps stay put and occupied cells do not cascade downward during drag.

---

## 5. Live/Demo Data Approach

The demo store (`src/hass/MockHass.ts`) ships with ~100 seed entities covering every tile type. It also implements service handlers for the operations tiles actually call: `light.turn_on/turn_off/toggle`, `switch.turn_on/turn_off/toggle`, `climate.set_temperature`, `cover.*`, `media_player.*`, `scene.turn_on`, `todo.update_item`, `vacuum.start/stop/return_to_base`, `timer.start/pause/cancel`.

History (for sparklines, plots, history bars) is generated via a random-walk function that lands exactly at the entity's current state. Cached per entity_id so the line doesn't jitter on unrelated state changes.

When Realm runs inside Home Assistant:
- `main.tsx` receives HA's injected `hass` object and calls `HassStore.syncFromLive(value.states)`.
- Live entities overlay demo entities by entity_id, so real HA wins on collisions and demo-only entities remain available.
- `HassStore.callService()` routes actions to HA only when the target entity is live. Demo-only targets keep using the local mock handler.
- `useEntity`, `useHistory`, all tiles, and the edit-mode registry do not need to know whether an entity is live or demo.

Live entities now use HA's `history/period` API for detail charts when `hass.callApi` is available. Demo-only entities keep generated history. Future work: statistics/long-term history for better performance and longer date ranges.

---

## 6. Deploy Workflow

```
cd C:\Users\kingj\dev\realm
npm run dev          # local Vite dev server (renders panel in browser without HA)
npm run build        # tsc --noEmit + Vite library build → dist/realm.js
npm run deploy       # build + node scripts/deploy.mjs (copies bundle to /config/www/realm/)
npm run deploy:only  # skip build, just copy existing dist/
```

After deploy, hard-refresh Realm in the browser. If you've changed `panel_custom:` (added/removed entries), HA needs a full restart.

If the HA theme needs reloading: Developer Tools → YAML → Themes.

---

## 7. Watch-Outs / Gotchas

- **Non-secure context:** HA accessed at `http://homeassistant.local:8123` is non-secure. `crypto.randomUUID()`, `crypto.subtle.*`, and other secure-context-only Web Crypto APIs are unavailable. Use `src/hass/uid.ts` (Math.random fallback) for any non-cryptographic uniqueness needs.
- **Vite library mode + NODE_ENV:** Library mode doesn't substitute `process.env.NODE_ENV` automatically. `vite.config.ts` does this via `define`. If you ever see `process is not defined` in console, check this.
- **HA MDC text-field vars:** Older `input-*` theme vars don't reach HA's MD3 text fields. `realm_dark.yaml` sets both old and `--mdc-text-field-*` / `--mdc-select-*` / `--mdc-dialog-*` vars.
- **Hooks rules:** `useEntity(undefined)` would violate rules of hooks if guarded conditionally. Always call with a string (use `entityId ?? ''` for optionals — store handles missing entities by returning null).
- **Bundle cache:** Hard refresh doesn't always bypass cached ES module imports for `panel_custom`. Use devtools → Disable cache, or incognito, when iterating.
- **scada-panel Google Fonts bug:** The older scada-panel JS at `/local/scada-panel/scada-panel.js` does an ES `import` of a Google Fonts CSS URL, which always fails MIME-type check. Shows in console regardless of which panel is open. Pre-existing, not Realm's problem.

---

## 8. Themes

Two themes coexist in `\\homeassistant.local\config\themes\`:

- **`scada_dark.yaml`** — paired with the older scada-panel React app. Navy `#05101e` surfaces.
- **`realm_dark.yaml`** — paired with Realm. Neutral near-black `#0d0f12` surfaces. SCADA state palette and Barlow Condensed / Share Tech Mono fonts preserved.

Switch in **Settings → Profile → Theme**. Eventually `scada_dark` may be retired when scada-panel is sunset.

---

## 9. Future Ideas (append freely)

Tile concepts not yet built. Add to this list as they come up.

- **PlotTile v2** — multi-series, zoomable, with crosshair tooltip. Probably needs ECharts or uPlot.
- **MapTile** — leaflet map for device_tracker / GPS entities.
- **FloorplanTile** — SVG floor plan with overlaid live entity hotspots.
- **CompassTile (generic)** — bearing-only compass for vehicles, etc.
- **CounterTile** — generic up-only counter with optional trend arrow.
- **RingProgressTile** — like Donut but for arbitrary 0-N progress (not %).
- **DualGaugeTile** — two arcs (e.g. supply + return temp) on one tile.
- **PhaseDiagramTile** — V/A/PF for electrical phases.
- **WaterFlowTile** — flow-rate dial for well/cistern.
- **GreenhouseTile** — temp/humidity/CO2/vent in one composite.
- **CoopTile** — chicken coop: temp + door state + egg count + light.
- **SoilZoneTile** — moisture/temp/EC per garden zone.
- **TideTile** — coastal tide info (for users near a coast).
- **BirdCamTile** — game cam with recent capture thumbnails.
- **Sankey/EnergySankey** — energy in/out flow with proportional links.
- **TopologyTile** — network topology with live status dots.
- **VoiceTile** — last command + transcript.
- **MarkdownTile** — free-form notes/markdown.
- **IframeTile** — embed external dashboards.
- **NextEventTile** — single biggest upcoming calendar event hero.
- **FrostWarningTile** — overnight low + frost advisory.
- **AirQualityTile** — AQI rose with PM2.5/PM10/VOC.
- **TideCalendarTile** — moon phase + tide schedule combo.
- **HouseEnergyToday** — kWh used today + cost.
- **SchedulerTile** — visual editor for automations/schedules.

### Bigger features

- **Multiple dashboards / pages** — beyond Overview, support per-room and per-equipment deep-dives (route + layout per slug).
- **Floorplans** — Sweet Home 3D SVG exports, with entity hotspots, become its own route at `/realm#/floorplan/:floor`.
- **Real-time graphs** — proper history view at `/realm#/plot` with date pickers, comparison series.
- **Notifications inbox** — central feed of HA events with snooze/dismiss.
- **Sync layout across devices** — write to `frontend.set_user_data` so phone + tablet + wall mount agree.
- **Tile-level conditional visibility** — hide a tile when an entity is unavailable, or only show alarms when active.
- **Tile groups / Panels** — a Panel container that wraps tiles in a category-colored top-border frame (like the SCADA Lovelace card's stack-in-card pattern). Useful for grouping related tiles visually.
- **Undo/redo for edit mode** — track layout history; ⌘Z reverts.
- **Tile linking** — clicking a tile navigates to its deep-dive page (per-entity history view).
- **Mobile-tuned tile variants** — some tiles want different visuals on small screens (e.g. PlotTile collapses to sparkline below 600px).

---

## 9.0 Recent rounds — quick changelog

Most recent first. Sections 9.1–9.5 below have round-specific detail.

| Round | Headline shipped |
|-------|------------------|
| **14.4** (current) | **Stabilization / docs / QA pass**. Playwright smoke suite covers app shell, fresh-install tabs, Components route, edit-mode entry (pencil + `E`), the grouped banner clusters, and Palette/Templates/Snapshots/Remap/Build-From-HA modals. `tests/smoke.spec.ts` + `playwright.config.ts` with a dedicated dev-server port (4173) so it doesn't collide with interactive `npm run dev` on 5173. CI gained an `e2e` job. Edit-mode banner regrouped into ADD / CONFIGURE / BACKUP / DANGER / DONE clusters so ten actions read calmly; mobile wraps cleanly. Public-demo defaults genericized: `WeatherRadarTile` ships with empty `iframeUrl` and a non-Casco description; `WeeklyDigestTile` default URL is empty and the SAMPLE digest text is generic-flavored. Docs caught up: README current-state line, WIKI tile-count + open-questions cleanup, CLAUDE.md round-13→round-14 callouts, MockHass.ts stale phase-6 TODO removed. New WIKI sections 10.8 (Repo Health / QA), 10.9 (Visual QA Checklist), 10.10 (Dependency upgrade triage). |
| **14.3** | **Showcase visual QA pass**. Comfort section: dropped LightFan (two buttons swimming in h=13) and swapped in HVACScheduleTile, whose 24-hour timeline now flex-fills its body instead of staying at a fixed 70px. Security right column: cameras widened to w=5 each, garage ButtonTile dropped to h=4 + BlindsTile stacked at h=7 so neither tile is a single control in a 258px box. Systems row: h=6→8 so NAS donut and Homelab per-host bars stop cramping. Household + Homestead bands: h=11→10 to remove looseness from Vehicle, Beehive, Generator. CameraTile viewport now uses `flex:1 + max-height:100% + min-height:0` so the 16:9 aspect ratio defers to the tile height when needed (no bottom clip at w=5). |
| **14.2** | **Showcase clipping fixes**: `.tile__body` now allows flex/SVG children to shrink (`min-height:0; overflow:hidden`). ClockTile time text scales via `clamp()` + container queries instead of overflowing at small h. EnergyFlowTile + SankeyTile SVGs use `preserveAspectRatio="xMidYMid meet"` and fill 100% of available height. Tank/Gauge/Donut SVGs become `height:100%` with max-size caps. Showcase layout heights bumped per the sizing band rules (WeatherTile 9→11, EnergyFlow/Sankey 10→12, Climate 10→13, Camera 9→11, etc.). CameraTile gains a `placeholderLabel` prop that renders a designed test-pattern with a DEMO badge instead of NO SIGNAL. WeeklyDigestTile gains a `demo: true` prop that renders a styled SAMPLE digest without fetching (no console noise). Registry defaults updated for Tank/Gauge/Donut/Camera/Climate/AirPurifier/Vehicle/Laundry so new instances aren't created too short. Sizing rules documented in WIKI section 10.7. |
| **14.1** | **Showcase tab redesign**: replaced the "tile dump" Demo tab with a curated, sectioned Showcase. Eight named sections (Environment, House Status, Energy, Comfort, Security, Systems, Household, Homestead), ~25 tiles total, explicit x/y/w/h so heights cluster per section and there are no blank vertical gaps. Renamed the default tab from "Demo" to "Showcase" (fresh installs only — existing users keep their tab name). `sampleLayouts.ts` now has a top-of-file comment laying out the three distinct roles: Welcome (first-run instructions), Showcase (curated dashboard), `/components` page (exhaustive catalog). |
| **14** | **Fork-and-customize pivot**: edit-mode **REMAP** modal scans active-tab tile props for demo entity IDs and bulk-swaps to user-picked LIVE entities (`src/edit/RemapEntitiesModal.tsx` + `entityRemap.ts`). **BUILD FROM HA** offers a preview-before-add starter tab from live entities by domain. **SNAPSHOTS** modal manages named localStorage rollbacks alongside file EXPORT/IMPORT. **Service-call toasts** centralize feedback through a `HassStore.subscribeServiceEvents` emitter and a shadow-root `ToastHost`. **Per-tile error boundaries** prevent one bad tile from blanking the dashboard. **Standardized missing-entity states** (`UNMAPPED` vs `UNAVAILABLE` vs `NO ENTITY`). **Per-breakpoint layout types** + migration (UI for editing per breakpoint still pending). **Confirm before action** for ButtonTile + VehicleTile remote start, via a SCADA-styled `ConfirmModal`. **EntityPicker** gains domain + LIVE/DEMO chips. **Composite tile modals** for ClimateThermostat, Laundry, Vehicle, Sankey, Homelab. **Deep-dive routes** `/entity/:entityId` and `/room/:roomId` scaffolded. |
| **13.1** | **Modal regression fix**: hardened the modal portal by creating the shadow-root modal layer directly in `main.tsx`, and fixed `useHistory()` so async live-history loading does not churn modal renders. |
| **13** | **Live history + layout snapshots**: `HassStore` now supports async live history separately from generated demo history. `main.tsx` installs a live history provider using HA's `history/period` API when `hass.callApi` exists. Detail charts for live numeric entities can show real recent history. Edit mode now has EXPORT / IMPORT JSON buttons for full dashboard snapshots, with import validation and version normalization. |
| **12** | **Stabilization / forkability pass**: removed duplicate `EntityDetailModal` component and stale `@dnd-kit` dependencies, tightened modal stacking with a dedicated shadow-root modal layer, labeled EntityPicker rows as LIVE/DEMO and made them easier to read, preserved demo-only service behavior while live HA is connected, genericized demo person entities, added detail modals for Calendar/Appliance/MultiMetric/AreaList, and synced docs to the round-11 live HA state. |
| **11** | **Live HA entities**: `main.tsx` now consumes the `hass` property HA passes to the panel. `HassStore.syncFromLive()` overlays real entities on top of the mock store (live wins on entity-id collision; mock fills gaps). Service calls proxy to the live `hass.callService()` for live entities. Mock store remains for dev and demo-only tiles. **Modal portal**: all modals (`TileModal`, `Palette`, `SampleBrowser`, `AlarmsConfig`) render via `createPortal` into a sibling `<div id="realm-modal-root">` at shadow-root level so RGL's grid-item transforms can't trap them. **RGL `preventCollision: true`** on the noCompactor so dragging onto an occupied cell snaps back instead of cascading other tiles down. **Duplicate-tile button** moved to a right-side action cluster next to delete (was floating awkwardly between drag handle and X). **Entity picker font** enlarged + switched to sans-serif. **Detail modals** added on Network/Alarm/Heatmap/SpeedTest/NAS. |
| **10** | **EntityDetailModal wired** on Tank/Gauge/Donut/Bar/Value/Sparkline/HistoryBars (click outside edit mode → modal with 60-pt history plot + attributes table). **Custom detail modals** for WeatherTile (extended forecast + full conditions) and CameraTile (full-image viewport + metadata). **Sample dashboard library** (Welcome, Smart Home Starter, Homestead Ops, Showcase) browsable via TEMPLATES button in edit banner; each loads as a new tab. **First-run Welcome** layout — pure HeaderTiles, zero entity dependencies, so a fresh install looks intentional. **Inline tab rename** replaces `window.prompt`. **EntityPicker** inside AlarmsConfig replaces `window.prompt`. **Keyboard shortcuts**: `E` toggle edit, `/` open palette (autofocuses search), `Esc` deselect. LAYOUT_VERSION 5 (v4 migrates forward cleanly). |
| **9** | Multi-tab system (per-tab layout + alarm config), alarm chips strip, duplicate tile, Inspector + Palette readability pass with text search, Blinds/Curtain position sliders, Thermostat `showX` checkboxes, Laundry `washerExtras`/`dryerExtras`, HeaderTile, switched to `noCompactor` (iOS-style fixed positions, gaps allowed). LAYOUT_VERSION 4. |
| **8** | Migrated Overview from @dnd-kit/sortable + custom-drag to **react-grid-layout v2**. Explicit `(x, y, w, h)` coordinates per tile. RGL handles drag (via `dragConfig.handle`) and resize (via `resizeConfig`). EditableTile.tsx deprecated; rendering inlined in `Overview.tsx`. LAYOUT_VERSION 3. |
| **7** | Drag-to-resize handle (bottom-right corner). Base row height dropped to 20px with per-tile `defaultRowSpan`. Inspector HEIGHT preset buttons (XS/SM/MD/LG/XL). Simplified `LightFanTile` to two on/off buttons. New `BlindsTile`. **PlotTile rewritten with ECharts** (interactive hover crosshair + value tooltip). New `WeeklyDigestTile` (fetches homestead-hq at `homestead-hq.local:3000`, needs CORS). `WeatherRadarTile` ships with an empty `iframeUrl` (user sets in inspector). LAYOUT_VERSION 2. |
| **6** | 14 new tiles (Climate/AirPurifier/LightFan/Curtain/NAS/SpeedTest/Starlink/UDM/Vehicle/Laundry/Sankey/Countdown/WeatherRadar/Appliance/Homelab). CameraTile auto-reads `entity.attributes.entity_picture` with configurable refresh. Drag pixel rounding, weather alignment + overflow fix, HA theme MDC vars for inputs. `TileModal` + `EntityDetailModal` infrastructure shipped (per-tile wiring still pending). |
| **5** | 20 new tiles (Calendar/Todo/Person/PresenceList/SceneButton/NotificationFeed/WindCompass/SunMoon/Heatmap/Network/ServerStats/Vacuum/Beehive/Irrigation/TrashSchedule/Generator/Mailbox/Timer/HVACSchedule/HistoryBars). Components demo page covers everything. |

## 9.4 Feedback follow-ups (round 6)

Items from this round's feedback:
- ✅ **Vertical alignment / messy grid** — overview grid now uses `grid-auto-rows: var(--row-height)` (110/120/130px at mobile/tablet/desktop). Each tile has a `defaultRowSpan` in its registry entry (1 for compact, 2 default, 3 for taller charts/lists). Inspector adds **HEIGHT** preset buttons (1-5 rows) so you can tune any individual tile.
- ✅ **LightFanTile simplified** — now two big on/off buttons (light + fan). Slider + speed picker removed; use `SliderTile` + dedicated fan tile if you want finer control.
- ✅ **BlindsTile** — new tile, animated blinds descend from the top of the window and scale via SVG matrix transform with CSS transition. Replaces `CurtainTile` in the default layout (CurtainTile is still in the palette for actual curtains).
- ✅ **ECharts PlotTile** — `PlotTile` now uses ECharts with interactive crosshair tooltip on hover. Bundle grew from ~175KB → ~385KB gzipped (echarts is the bulk). SVG renderer; works inside Shadow DOM.
- ✅ **WeeklyDigestTile** — new tile, fetches from `http://homestead-hq.local:3000/api/digest/weekly` by default. Accepts JSON (`content`/`text`/`body` field) or plain text. Refreshes every 60 min by default. **Note: homestead-hq must allow CORS** from the HA origin (`http://homeassistant.local:8123`) — add `Access-Control-Allow-Origin: *` or specific origin to its responses. Override `url` in the inspector if your endpoint path differs.
- ✅ **WeatherRadarTile iframe slot** — ships with empty `iframeUrl` (placeholder visible). Set your own embed URL (windy.com / rainviewer / NOAA) via the inspector.
- ✅ **Drag/drop improvements** — fractional transforms now rounded to integer pixels; transform transition removed from `.tile`; hover effects suppressed in edit mode.
- ✅ **CameraTile real feeds** — auto-reads `entity.attributes.entity_picture` when `snapshotUrl` is empty, with configurable `refreshSeconds` polling.
- 🟡 **Modal popups on individual tiles** — `EntityDetailModal` + `TileModal` pattern shipped (`src/components/EntityDetailModal.tsx`). **Wiring onto each tile is incremental work** — pattern per tile: `useState` + add `onClick` to `BaseTile` + conditional `<EntityDetailModal entityId=... title=... onClose=... />`. Wire incrementally as bandwidth allows.

## 9.5 Feedback follow-ups (round 5)

Items addressed this round:
- ✅ Readability — bumped `--type-label`/`--type-label-sm` sizes and lightened the faint slate scale.
- ✅ Weather tile alignment — hero now `justify-content: center`, forecast cells stack vertically and use `minmax(0, 1fr)` so they don't overflow narrow tiles.
- ✅ Drag/drop scaling/blur — transform values rounded to integer pixels; transform transition removed from `.tile`; hover effects disabled on tiles during edit mode.
- ✅ Real camera feeds — CameraTile now auto-reads `entity.attributes.entity_picture` when `snapshotUrl` is empty, with a configurable `refreshSeconds` polling loop.
- ✅ Detailed thermostat — `ClimateThermostatTile` shipped (use alongside or instead of `SetpointTile`).
- ✅ Curtain / animated cover — `CurtainTile`.
- ✅ Air purifier — `AirPurifierTile`.
- ✅ Light + fan combo — `LightFanTile`.
- ✅ Countdown — `CountdownTile` with repeat options.
- ✅ Vehicle — `VehicleTile`.
- ✅ Laundry with animations — `LaundryTile` (spinning drums via CSS).
- ✅ Power Sankey — `SankeyTile`.
- ✅ NAS / Starlink / UDM / SpeedTest — all four shipped.
- ✅ Weather radar — `WeatherRadarTile` (iframe slot + placeholder).
- ✅ Samsung appliances — `ApplianceTile` (generic; wires to any appliance entity).
- ✅ Homelab — `HomelabTile`.
- ✅ Ideal default Overview layout — `src/edit/defaultLayouts.ts` curates a thoughtful starting arrangement; user customizes from there.
- ✅ Components demo coverage — every tile (now 57) has a section on `/components`.
- 🟡 Modal popups on most tiles — `TileModal` infrastructure ships but wiring `onClick → modal` per-tile is the next pass (see section 10).
- 🟡 Interactive chart hover — deferred (see section 9).
- 🟡 homestead-hq digest — needs API endpoint + auth details before building.
- 🟡 Google Calendar — already works via the generic `CalendarTile` pointed at any `calendar.*` HA entity.

## 10. Open Questions / TODOs

Track decisions we've deferred and known issues.

- **Live history provider:** Basic recent HA history is wired through `history/period`. Next step is statistics/long-term history plus date-range controls.
- **scada-panel sunset:** When Realm has feature parity, retire `scada-panel`. Remove `panel_custom` entry, delete `/config/www/scada-panel/`, remove `scada_dark.yaml` (or keep as a personal backup).
- **PlotTile zoom/pan:** Currently no interactive zoom. Worth adding via uPlot once we have real history data.
- **Edit mode on phone:** Drag works on touch. Inspector is full-screen on <700px. Verify ergonomics on real phone use.
- **CameraTile real wiring:** Pass `entity.attributes.entity_picture` as `snapshotUrl` once real cameras are connected. May need to proxy through HA for auth.
- **Energy flow accuracy:** Mock assumes home = grid + solar + battery. Real flow needs proper sign conventions for selling-back-to-grid and battery discharge.
- **Layout schema migration:** v4 → v5 was a no-op rename (round 10) because the shape was identical. Future schema changes should ship a real migration rather than dropping local state.
- **Theme switching from inside Realm:** Currently the user switches in HA Profile. Could expose a quick toggle from Realm itself. Plan in section 10.6.
- **More tiles still want custom detail modals:** MultiMetric and AreaList are candidates next. SankeyTile, LaundryTile, ClimateThermostatTile, VehicleTile, HomelabTile shipped in round 14.

---

## 10.5 Per-breakpoint layouts — schema & migration (round 14 scaffold)

`LayoutItem` now carries an optional `layouts?: Partial<Record<Breakpoint, {x,y,w,h}>>` field where `Breakpoint = 'lg' | 'md' | 'sm' | 'xs'`. The canonical `x/y/w/h` on the item are still the fallback used when the active breakpoint has no override, so saved layouts written before this field existed Just Work.

`Overview` builds four RGL layouts (one per breakpoint), preferring the matching `layouts[bp]` slot when present and falling back to canonical otherwise. The existing `onLayoutChange` still writes to canonical only; per-breakpoint editing UI (advanced toggle in Inspector, "Edit desktop/tablet/phone layout" buttons) lands in a future slice.

**Migration:** none required. v5 layouts continue to load as v5. Tiles without `layouts` behave identically to before.

**Future UI sketch:**
- Default edit mode is "all breakpoints" — edits go to canonical, every breakpoint follows.
- Advanced mode is "current breakpoint only" — edits write to `layouts[bp]`. Show a chip indicating which breakpoint is active.
- Add "reset to canonical" per tile to drop a breakpoint override.

## 10.6 Theme & density controls — planning (round 14 placeholder)

Adding density/theme support is a tokens-layer change first, components-layer change second. Outline:

- `:root` (or `.realm-density-comfortable`/`-compact`/`-large` on the shadow root container) toggles spacing/font-size tokens. `tokens.css` already centralizes these, so a single class flip rescales the whole UI.
- Accent color is one CSS variable away (`--accent`, currently SCADA cyan). Surfacing it as a user choice means writing the value to localStorage and applying it to `realm-root` via inline style.
- Chart palette: ECharts and the hand-rolled SVG bars both read from a small set of `--status-*` vars and per-tile color tokens. Centralize before exposing.
- Reduced motion: respect `prefers-reduced-motion` first; layer a manual toggle on top.

Default stays dense SCADA. Large mode is for tablet/wall-panel deployments. Reduced motion should quiet animations without removing state cues (alarm pulses, charging dot, drum spin).

## 10.7 Tile sizing rules (round 14.2)

Tiles render inside their row-spans (20px each + 8px margin). Each tile has a minimum useful height; going below it produces clipped content even with `overflow: hidden` on the body. The Showcase layout follows these bands so nothing clips out of the box:

| Tile kind | Recommended h | Notes |
|-----------|---------------|-------|
| HeaderTile | 2 | One-line section divider. |
| ClockTile | 4-8 | Time text scales via `clamp()` + container queries. Won't clip at h=4. |
| ValueTile / StatusTile / Toggle / Button / Network | 5-6 | Single value or pill. h=4 is the registry default and is fine for compact tiles. |
| MailboxTile / TrashScheduleTile / SunMoonTile / WindCompassTile | 7-9 | Multi-row info with icons. |
| StatusListTile / AlarmTile (with subtitle) | 7-9 | Depends on row count. |
| WeatherTile | 11-13 | Hero numbers + 3-day forecast row. |
| TankTile / GaugeTile / DonutTile | 9-10 | SVGs scale to fit; below 8 the readout gets cramped. |
| SankeyTile / EnergyFlowTile | 10-13 | SVGs use `preserveAspectRatio="xMidYMid meet"` so they shrink uniformly. |
| ClimateThermostatTile | 12-14 | Hero current + target + mode/fan/preset rows. |
| LaundryTile / VehicleTile | 10-12 | Two appliance cells / battery + controls. |
| CameraTile | 10-12 | 16:9 viewport + REC overlay. `placeholderLabel` prop produces a polished demo placeholder. |
| WeeklyDigestTile | 10-13 | `demo: true` shows a styled SAMPLE digest without fetching. |
| PlotTile / HistoryBarsTile / HeatmapTile | 9-13 | ECharts/SVG charts need room for axes. |

**Anti-clipping primitives** baked into `components.css`:

- `.tile__body` has `min-height: 0; overflow: hidden;` so SVG/flex children can shrink.
- Tiles that wrap an SVG (energy, sankey, tank, gauge, donut) flex to fill the body and the SVG uses `width: 100%; height: 100%;` with explicit `preserveAspectRatio`.
- ClockTile body is `container-type: size` and the time/date use `clamp(min, Ncqh, max)` so the font scales with the tile.

Showcase respects each tile's minimum useful size; the `/components` page remains the exhaustive catalog where every tile renders at its registry default.

## 10.8 Repo health / QA

Three layers, run in this order before any deploy:

1. **Type check + build.** `npm run build` runs `tsc --noEmit` then Vite library build. Must pass before deploy. The CI workflow at `.github/workflows/build.yml` runs the same on every push and PR.
2. **Playwright smoke tests.** `npm run test:e2e` spins up the Vite dev server and exercises the app shell, navigation, edit-mode entry, modal stacking, and tile detail modals against the mock store. Tests live in `tests/smoke.spec.ts` and `tests/playwright.config.ts`. Each test clears `localStorage` before navigating so fresh-install defaults always apply. Run headed (`npm run test:e2e:headed`) when chasing a flaky selector.
3. **Manual visual QA pass.** See section 10.9 — short checklist for what to eyeball before tagging a release.

A deploy is considered successful when (a) build is clean, (b) Playwright passes, (c) the bundle copies to the HA share, and (d) a hard refresh shows the new version banner / tab layout. Bumping `package.json` version on every behavior-changing commit makes step (d) verifiable.

## 10.9 Visual QA checklist

Lightweight manual sanity check. Targeted at "is anything visibly broken before I push?" — not a regression suite. Run after each visible UX change.

**Resolutions to spot-check:**
- [ ] 1440 desktop — Showcase reads as intentional, no overflow at any section, no horizontal scrollbar.
- [ ] 2560 desktop — tiles scale up cleanly, large tiles (Weather, Camera, Sankey, EnergyFlow) don't develop dead space.
- [ ] Tablet (~1024px) — RGL crosses the 12→8 col breakpoint, sections still align.
- [ ] Phone (~480px) — 6→4 col breakpoint, no clipping in modals, Inspector goes full-screen.

**View-mode interaction:**
- [ ] Click an info tile (Tank/Gauge/Value/Weather/Camera) in Showcase — detail modal opens above the page, Esc closes it, no shadow-DOM clipping.
- [ ] Switch tabs — Welcome and Showcase both render, no flash of unmapped tiles.
- [ ] Trigger a service call (toggle a ToggleTile, scene button) — toast appears bottom-right, auto-dismisses.

**Edit mode:**
- [ ] Press `E` (or pencil) — banner appears with all action groups visible, no horizontal overflow on 1440.
- [ ] Add Tile / Templates / Build From HA / Remap / Snapshots / Alarms each open their modal above the grid.
- [ ] Drag a tile — handle grab works, fixed slots prevent collision, drop preserves position.
- [ ] Resize a tile — bottom-right handle drags smoothly.
- [ ] Mobile edit banner — wraps cleanly without overlapping the alarm chips.

**Flows:**
- [ ] REMAP flow on Showcase — pick a demo entity, swap to a live one, Apply persists.
- [ ] BUILD FROM HA — scan, unchecked preview, Add Tab creates a new tab without disturbing existing tabs.
- [ ] SNAPSHOTS — Save current, restore, rename, delete each work; restore really loads.
- [ ] EXPORT — downloads a JSON file with the expected shape. IMPORT — round-trips that file without errors.
- [ ] RESET — confirms first, then clears to Welcome + Showcase fresh install state.

**Catch-alls:**
- [ ] No red console errors on Overview load.
- [ ] No tile shows `Render error` placeholder unless deliberately broken.
- [ ] Modal stacking — opening Palette over Inspector keeps both keyboard-dismissable in order.

## 10.10 Dependency upgrade triage

Dependabot opens PRs whenever a watched package publishes. Don't blind-merge anything that could break a build or a visual regression we can't catch from CI alone. Bucket by risk:

**Safe-ish (CI is usually enough to validate):**
- GitHub Actions updates (`actions/checkout`, `actions/setup-node`). The build workflow exercises them on the next push. Merge one at a time and watch the next green run.
- Patch and minor `@types/*` updates. Type-only; either the build passes or it doesn't.

**Moderate (run Playwright locally before merging):**
- `@vitejs/plugin-react` minor bumps.
- React 19 patch releases.
- ECharts minor updates.

**Hold until smoke tests have grown coverage (don't merge in this pass):**
- Vite **major** (e.g. 6 → 7/8). Library-mode behavior and CSS injection have shifted between majors in the past; needs a manual deploy + browser sanity pass.
- TypeScript **major** (5 → 6). Type errors that surface from a major bump can be wide-ranging; absorb separately from any feature work.
- `@vitejs/plugin-react` **major**.
- React **major** (we're already on 19; any 20 bump is its own project).

**Policy:**
- Upgrade one dependency at a time. If multiple Dependabot PRs are open, merge the safest first, push to main, watch CI, then move to the next.
- For majors: branch locally, run `npm.cmd run build && npm.cmd run test:e2e && npm.cmd run deploy:only`, hard-refresh Realm against HA, manually verify the Visual QA Checklist (10.9). Only then merge.
- Never accept a Dependabot PR that touches a major and another major at once. Split it.

## 11. Conventions

- **Tokens-first.** Any new color, type style, spacing, or radius lands in `tokens.css` before any component references it. No ad-hoc values.
- **Entity subscription.** Always use `useEntity(id)` — never read from `hass.states` directly in render. The selector hook is what keeps render scope tight.
- **Optional entities.** Pass `entityId ?? ''` to `useEntity` when an entity prop is optional. The store handles unknown IDs by returning null. Never wrap `useEntity` in `if`/`?:`.
- **Tile composition.** Every tile renders inside `<BaseTile>` which owns the chrome (label, status, pill, icon, status accent border). Tile bodies are the differentiation.
- **No `hass` in props.** Tiles receive entityIds and ask the store via the hook. Avoids prop drilling and excessive re-renders.
- **Serializable props.** Any new tile prop that an Inspector should edit must be JSON-serializable. The `icon` exception (ReactNode in tile API, string in config) is handled by the registry's render function — follow that pattern.
- **No em dashes in copy.** Project-wide preference. Use commas, parens, or sentence breaks.
- **No `crypto.randomUUID()`** unless we're sure we're in a secure context. Use `uid()` from `hass/uid.ts`.

---

*Last touched during the autonomous build that landed the 20-tile expansion + edit mode. Subsequent sessions: append to Future Ideas freely, update Open Questions as we resolve them, and treat the rest as authoritative — change those sections only if reality has shifted.*
