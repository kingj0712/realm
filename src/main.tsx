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
