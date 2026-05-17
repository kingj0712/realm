import type { FC } from 'react';

interface HeaderTileProps {
  text: string;
  subtitle?: string;
  // Accent line color on the underline.
  accent?: 'default' | 'ok' | 'warn' | 'alarm' | 'info';
}

// Section header for organizing tiles within a page. Renders raw text +
// underline accent — no BaseTile chrome.
export const HeaderTile: FC<HeaderTileProps> = ({ text, subtitle, accent = 'default' }) => (
  <div className={`header-tile header-tile--${accent}`}>
    <div className="header-tile__text">{text}</div>
    {subtitle && <div className="header-tile__sub">{subtitle}</div>}
  </div>
);
