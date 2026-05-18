# Realm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/kingj0712/realm)](./package.json)
[![Build](https://github.com/kingj0712/realm/actions/workflows/build.yml/badge.svg)](https://github.com/kingj0712/realm/actions/workflows/build.yml)

A custom React-based dashboard for Home Assistant. Built as a `panel_custom` that lives alongside Lovelace, with a SCADA-leaning visual language: dense industrial HMI, near-black surfaces, Barlow Condensed + Share Tech Mono typography, and ~60 tile types ranging from simple value displays to animated visualizations (tanks that fill, blinds that descend, energy-flow Sankey diagrams, spinning washer drums, ECharts plots with hover tooltips).

## Goals

The four pillars guiding every change:

1. **Easy to navigate** — every action discoverable in ≤2 clicks.
2. **Intuitive** — gestures match expectations (iOS-home-screen drag, Notion-block config, click-to-activate / click-to-configure).
3. **Extremely customizable** — rich per-tile Inspector, themes, per-breakpoint layouts, tile templates.
4. **Fun** — animations serve the data; personality tiles invited; tiles that delight.

> **Current state:** Realm is actively evolving from "the author's personal dashboard" toward "fork-and-customize for anyone." Fresh installs now land on a **Welcome tab** with zero entity dependencies, plus a separate **Demo tab** showing every tile type. Use the **TEMPLATES** button in edit mode to drop in a Smart Home Starter / Homestead Ops / Showcase layout as a brand-new tab. To remap demo entities to yours, click the pencil → click any tile → change its Entity field. Roadmap in [`WIKI.md`](./WIKI.md) section 1.5.

## What's in here

- **Config-driven dashboard with explicit `(x, y, w, h)` tile placement** via [react-grid-layout v2](https://github.com/react-grid-layout/react-grid-layout). Drop tiles wherever, deliberate gaps allowed (iOS-home-screen style).
- **Edit mode** with a per-tile Inspector, searchable Palette to add tiles, drag-rearrange, drag-resize, duplicate, and per-tab layouts (multiple dashboard pages).
- **Per-tab alarm chips** — a pulsing strip at the top of each tab showing whichever entities you've designated as alarm-watch.
- **Live HA plus demo data store** that mirrors HA's `hass.states` shape. Inside Home Assistant, live entities overlay the demo pool and live service calls route to HA. In local dev, the same demo pool keeps every tile interactive.
- **Shadow DOM isolation** — Realm fully owns its styling and doesn't leak into HA's chrome.
- **60+ tile types** covering most home-automation use cases. See `WIKI.md` section 3 for the full catalog.

## Architecture

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript + Vite |
| Layout | react-grid-layout v2 (iOS-style fixed positioning, `compactor: noCompactor`) |
| Charts | ECharts (PlotTile only — sparkline/heatmap/etc. are hand-rolled SVG) |
| Subscriptions | `useSyncExternalStore` selector hooks per entity, so only components watching a state change re-render |
| Persistence | localStorage; layout schema is JSON-serializable and versioned |
| Hosting | Built as a single ES module bundle, served by HA via `panel_custom` from `/local/realm/realm.js` |

Read [`CLAUDE.md`](./CLAUDE.md) for the architectural quickstart and [`WIKI.md`](./WIKI.md) for the tile catalog, change log, and open questions.

## Quick start

```bash
npm install
npm run dev      # local Vite server with mock data (no HA needed)
npm run build    # type-check + library build → dist/realm.js
npm run deploy   # build + copy to \\homeassistant.local\config\www\realm\
```

The deploy script defaults to `\\homeassistant.local\config\www\realm\`. Override with an environment variable if your HA install is elsewhere:

```powershell
# PowerShell
$env:REALM_DEPLOY_TARGET = '\\your-ha-host\config\www\realm'
npm run deploy
```

```bash
# bash
REALM_DEPLOY_TARGET='/path/to/ha/config/www/realm' npm run deploy
```

After the first deploy, register the panel in your HA `configuration.yaml`:

```yaml
panel_custom:
  - name: realm-panel
    url_path: realm
    sidebar_title: Realm
    sidebar_icon: mdi:chess-rook
    module_url: /local/realm/realm.js
    embed_iframe: false
    require_admin: false
    trust_external_script: false
```

Then restart HA (full restart, not yaml-only reload). The new panel appears in the sidebar.

## Theming

Realm ships with a companion HA theme (`themes/realm_dark.yaml` in the author's HA config — not in this repo) that matches the near-black surface palette so the HA chrome around Realm doesn't clash. The themes directory is part of the HA config, not this React project.

## Status

Active development. The author posts incremental rounds of work. See `WIKI.md` section 9.0 for the changelog. Recent rounds (7 to 12): react-grid-layout v2, multi-tab system, alarm chips, Inspector readability pass, ECharts plots, detail modals, first-run Welcome layout, sample dashboard library, live HA entity overlay, modal portal fixes, and live/demo entity picker labels.

## Keyboard shortcuts

- `E` — toggle edit mode
- `/` — open the tile palette (autofocuses its search box)
- `Esc` — deselect the active tile (modals own their own Esc)

Shortcuts are skipped while typing in any input.

## Not done yet

- Live history/statistics provider. Current history charts still use generated demo history.
- More tiles deserve custom detail modals, especially Sankey, MultiMetric, AreaList, Calendar, and appliance-style tiles.
- Tab drag-to-reorder.
- Floorplans route.
- Per-breakpoint layouts (currently all breakpoints share the lg layout).
- Theme picker / custom CSS hook.

See `WIKI.md` section 10 for the full open-questions list.

## License

[MIT](./LICENSE) — feel free to fork, build on, or borrow ideas.

## Acknowledgements

Built with [Claude Code](https://claude.com/claude-code) as a co-author across many iterative rounds. The tile catalog grew incrementally: 5 tile types → 23 → 43 → 57 → ~60 as new use cases emerged.
