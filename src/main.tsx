import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import { createMockStore, type HassStore } from './hass';
import type { HassEntity } from './types';
import tokensCss from './styles/tokens.css?inline';
import componentsCss from './styles/components.css?inline';
// react-grid-layout ships its own stylesheets — pull them as ?inline so they
// land inside our Shadow DOM along with the rest of Realm's CSS.
import rglCss from 'react-grid-layout/css/styles.css?inline';
import resizableCss from 'react-resizable/css/styles.css?inline';

// Load Realm's typography (Barlow Condensed for labels, Share Tech Mono for
// values, Barlow for body) at the document level. Fonts loaded via a link in
// document.head are available to Shadow DOM children because font registration
// is global. Idempotent: re-mounting the element doesn't re-add the link.
function ensureFonts(): void {
  const id = 'realm-fonts';
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?' +
    'family=Barlow+Condensed:wght@400;600;700' +
    '&family=Barlow:wght@400;600' +
    '&family=Share+Tech+Mono' +
    '&display=swap';
  document.head.appendChild(link);
}

// Minimal shape of HA's `hass` object — only the fields Realm consumes. HA
// actually passes a much richer object (connection, language, themes…) but
// we only need states + callService for now.
interface HassLike {
  states?: Record<string, HassEntity>;
  callService?: (
    domain: string,
    service: string,
    data?: object,
    target?: object,
  ) => Promise<unknown> | void;
  callApi?: <T = unknown>(
    method: string,
    path: string,
    parameters?: Record<string, unknown>,
  ) => Promise<T>;
}

interface HistoryState {
  state?: string;
}

function sampleNumericHistory(values: number[], points: number): number[] {
  if (values.length <= points) return values;
  const sampled: number[] = [];
  const step = (values.length - 1) / Math.max(1, points - 1);
  for (let i = 0; i < points; i += 1) {
    sampled.push(values[Math.round(i * step)]);
  }
  return sampled;
}

// Custom element HA mounts when the user opens the Realm panel.
// HA assigns hass/narrow/route/panel as properties on the element. When `hass`
// is set we sync its states into our store (live wins over mock for collisions)
// and install a live service handler. Mock-only demo entities keep their local
// behavior so the dashboard stays usable during setup.
class RealmPanel extends HTMLElement {
  private root: Root | null = null;
  private mountNode: HTMLElement | null = null;
  // Mock store provides the demo baseline. syncFromLive overlays real HA
  // entities on top whenever HA pushes a `hass` property update.
  private store: HassStore = createMockStore();
  private _hass: HassLike | null = null;
  private liveHandlerInstalled = false;
  private liveHistoryInstalled = false;

  set hass(value: HassLike | null | undefined) {
    this._hass = value ?? null;
    if (!value) return;
    if (value.states) {
      this.store.syncFromLive(value.states);
    }
    if (!this.liveHandlerInstalled && typeof value.callService === 'function') {
      // We read `this._hass` at call time, not the captured `value`, so it
      // always uses the freshest callService reference.
      this.store.setLiveServiceHandler(async (domain, service, data, target) => {
        const hass = this._hass;
        if (!hass?.callService) return;
        try {
          await hass.callService(domain, service, data, target as object);
        } catch (e) {
          // Service errors shouldn't crash the dashboard.
          console.warn('[realm] callService failed:', e);
        }
      });
      this.liveHandlerInstalled = true;
    }
    if (!this.liveHistoryInstalled && typeof value.callApi === 'function') {
      this.store.setLiveHistoryProvider(async (entityId, points) => {
        const hass = this._hass;
        if (!hass?.callApi) return [];
        const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        try {
          const result = await hass.callApi<HistoryState[][]>('GET', `history/period/${start}`, {
            filter_entity_id: entityId,
            significant_changes_only: false,
          });
          const series = result?.[0] ?? [];
          const numeric = series
            .map((row) => Number.parseFloat(row.state ?? ''))
            .filter((value) => Number.isFinite(value));
          return sampleNumericHistory(numeric, points);
        } catch (e) {
          console.warn('[realm] history fetch failed:', e);
          return [];
        }
      });
      this.liveHistoryInstalled = true;
    }
  }
  get hass(): HassLike | null {
    return this._hass;
  }

  connectedCallback() {
    if (this.shadowRoot) return;

    ensureFonts();

    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `${tokensCss}\n${componentsCss}\n${rglCss}\n${resizableCss}`;
    shadow.appendChild(style);

    this.mountNode = document.createElement('div');
    this.mountNode.id = 'realm-root';
    shadow.appendChild(this.mountNode);

    this.root = createRoot(this.mountNode);
    this.root.render(
      <StrictMode>
        <App store={this.store} />
      </StrictMode>,
    );
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
    this.mountNode = null;
  }
}

if (!customElements.get('realm-panel')) {
  customElements.define('realm-panel', RealmPanel);
}
