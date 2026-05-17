import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
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

// Custom element HA mounts when the user opens the Realm panel.
// HA assigns hass/narrow/route/panel as properties on the element. Phase 2
// ignores them (App uses a mock store via context). Phase 6+ will reintroduce
// property setters that bridge HA state into a real HassStore.
class RealmPanel extends HTMLElement {
  private root: Root | null = null;
  private mountNode: HTMLElement | null = null;

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
        <App />
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
