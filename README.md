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

> **Current state:** Realm is actively evolving from "the author's personal dashboard" toward "fork-and-customize for anyone." Today the default layout assumes the author's entities — you'll need to remap them to yours via the Inspector (Settings → Profile → Theme: Realm Dark; then in Realm, click the pencil → click any tile → change the Entity field). The roadmap to make this painless is tracked in [`WIKI.md`](./WIKI.md) section 1.5.

## What's in here

- **Config-driven dashboard with explicit `(x, y, w, h)` tile placement** via [react-grid-layout v2](https://github.com/react-grid-layout/react-grid-layout). Drop tiles wherever, deliberate gaps allowed (iOS-home-screen style).
- **Edit mode** with a per-tile Inspector, searchable Palette to add tiles, drag-rearrange, drag-resize, duplicate, and per-tab layouts (multiple dashboard pages).
- **Per-tab alarm chips** — a pulsing strip at the top of each tab showing whichever entities you've designated as alarm-watch.
- **Mock data store** that mirrors HA's `hass.states` shape, so the whole UI develops without a live HA connection. Phase 6+ swaps in a `LiveHassStore` bridged to the HA-injected `hass` object.
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

Active development. The author posts incremental rounds of work — see `WIKI.md` section 9.0 for the changelog. Recent rounds (7–9): drag-to-resize, switched to react-grid-layout v2, multi-tab system, alarm chips, Inspector readability pass, ECharts plots.

## Not done yet

- Live HA wiring (mock store still in place — phase 6+).
- `EntityDetailModal` wiring per tile (infrastructure built, per-tile click-handlers pending).
- Floorplans route.
- Per-breakpoint layouts (currently the desktop layout reflows to fit mobile via RGL's compactor).
- Polish on edit chrome (window.prompt for tab rename should become an inline editor).

See `WIKI.md` section 10 for the full open-questions list.

## License

[MIT](./LICENSE) — feel free to fork, build on, or borrow ideas.

## Acknowledgements

Built with [Claude Code](https://claude.com/claude-code) as a co-author across many iterative rounds. The tile catalog grew incrementally: 5 tile types → 23 → 43 → 57 → ~60 as new use cases emerged.
