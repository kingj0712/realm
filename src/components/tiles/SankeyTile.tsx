import { useState, type FC, type ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { TileModal } from './TileModal';
import { useEntity } from '../../hass';

interface SankeyNode {
  entityId: string;
  label: string;
}

interface SankeyTileProps {
  label?: string;
  icon?: ReactNode;
  sources: SankeyNode[];
  consumers: SankeyNode[];
}

// Hand-rolled Sankey: each side stacks proportional rectangles. A cubic bezier
// ribbon connects each source segment to each consumer segment. Width is
// proportional to a (uniform) split — real per-device allocation would need
// submetering from HA.
export const SankeyTile: FC<SankeyTileProps> = ({ label = 'POWER FLOW', icon, sources, consumers }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BaseTile label={label} icon={icon} onClick={() => setOpen(true)}>
        <div className="sankey-tile">
          <svg className="sankey-tile__svg" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <SankeyContent sources={sources} consumers={consumers} />
          </svg>
        </div>
      </BaseTile>
      {open && (
        <SankeyModal title={label} sources={sources} consumers={consumers} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

interface SankeyContentProps {
  sources: SankeyNode[];
  consumers: SankeyNode[];
}

const SankeyContent: FC<SankeyContentProps> = ({ sources, consumers }) => {
  const srcEnts = sources.map((s) => ({ node: s, ent: useEntity(s.entityId) }));
  const conEnts = consumers.map((c) => ({ node: c, ent: useEntity(c.entityId) }));

  const srcVals = srcEnts.map(({ node, ent }) => {
    const v = ent ? Math.abs(parseFloat(ent.state)) : 0;
    return { label: node.label, value: Number.isFinite(v) ? v : 0 };
  });
  const conVals = conEnts.map(({ node, ent }) => {
    const v = ent ? Math.abs(parseFloat(ent.state)) : 0;
    return { label: node.label, value: Number.isFinite(v) ? v : 0 };
  });

  const srcTotal = srcVals.reduce((a, b) => a + b.value, 0) || 1;
  const conTotal = conVals.reduce((a, b) => a + b.value, 0) || 1;
  const usableH = 140;
  const top = 10;

  let srcY = top;
  const srcRects = srcVals.map((s) => {
    const h = (s.value / srcTotal) * usableH;
    const rect = { y: srcY, h, label: s.label, value: s.value };
    srcY += h + 2;
    return rect;
  });

  let conY = top;
  const conRects = conVals.map((c) => {
    const h = (c.value / conTotal) * usableH;
    const rect = { y: conY, h, label: c.label, value: c.value };
    conY += h + 2;
    return rect;
  });

  const ribbons: Array<{ d: string; key: string; status: string }> = [];
  for (let ci = 0; ci < conRects.length; ci++) {
    const con = conRects[ci];
    let conCursor = con.y;
    for (let si = 0; si < srcRects.length; si++) {
      const src = srcRects[si];
      const share = (con.h / usableH) * src.h;
      const srcSegY = src.y + (ci * src.h) / Math.max(conRects.length, 1);
      const srcSegH = src.h / Math.max(conRects.length, 1);
      const conSegY = conCursor;
      const conSegH = share;
      conCursor += conSegH;
      const x1 = 60;
      const x2 = 240;
      const cx = (x1 + x2) / 2;
      const d = `M ${x1},${srcSegY} C ${cx},${srcSegY} ${cx},${conSegY} ${x2},${conSegY} L ${x2},${conSegY + conSegH} C ${cx},${conSegY + conSegH} ${cx},${srcSegY + srcSegH} ${x1},${srcSegY + srcSegH} Z`;
      const status = si === 0 ? 'info' : si === 1 ? 'warn' : 'ok';
      ribbons.push({ d, key: `${si}-${ci}`, status });
    }
  }

  return (
    <>
      {ribbons.map((r) => (
        <path key={r.key} className={`sankey-tile__ribbon sankey-tile__ribbon--${r.status}`} d={r.d} />
      ))}
      {srcRects.map((s, i) => (
        <g key={`s-${i}`}>
          <rect x="50" y={s.y} width="10" height={s.h} className="sankey-tile__node" />
          <text x="46" y={s.y + s.h / 2 + 3} textAnchor="end" className="sankey-tile__label">{s.label}</text>
          <text x="46" y={s.y + s.h / 2 + 12} textAnchor="end" className="sankey-tile__value">{s.value.toFixed(1)}</text>
        </g>
      ))}
      {conRects.map((c, i) => (
        <g key={`c-${i}`}>
          <rect x="240" y={c.y} width="10" height={c.h} className="sankey-tile__node sankey-tile__node--con" />
          <text x="254" y={c.y + c.h / 2 + 3} textAnchor="start" className="sankey-tile__label">{c.label}</text>
          <text x="254" y={c.y + c.h / 2 + 12} textAnchor="start" className="sankey-tile__value">{c.value.toFixed(1)}</text>
        </g>
      ))}
    </>
  );
};

interface SankeyModalProps {
  title: string;
  sources: SankeyNode[];
  consumers: SankeyNode[];
  onClose: () => void;
}

// Pulls live values for every node, totals each side, and renders two ordered
// tables: sources (descending by current value) and consumers (same). Skips
// the proportional ribbon view here; the tile already shows that and a table
// is easier to read in a modal.
const SankeyModal: FC<SankeyModalProps> = ({ title, sources, consumers, onClose }) => {
  const srcRows = sources.map((s) => ({ node: s, ent: useEntity(s.entityId) }));
  const conRows = consumers.map((c) => ({ node: c, ent: useEntity(c.entityId) }));

  const srcVals = srcRows.map(({ node, ent }) => {
    const v = ent ? Math.abs(parseFloat(ent.state)) : 0;
    return { entityId: node.entityId, label: node.label, value: Number.isFinite(v) ? v : 0, unit: (ent?.attributes?.unit_of_measurement as string | undefined) ?? '' };
  });
  const conVals = conRows.map(({ node, ent }) => {
    const v = ent ? Math.abs(parseFloat(ent.state)) : 0;
    return { entityId: node.entityId, label: node.label, value: Number.isFinite(v) ? v : 0, unit: (ent?.attributes?.unit_of_measurement as string | undefined) ?? '' };
  });
  const srcTotal = srcVals.reduce((a, b) => a + b.value, 0);
  const conTotal = conVals.reduce((a, b) => a + b.value, 0);
  const srcSorted = [...srcVals].sort((a, b) => b.value - a.value);
  const conSorted = [...conVals].sort((a, b) => b.value - a.value);

  return (
    <TileModal title={title} subtitle="Power flow breakdown" onClose={onClose} size="lg">
      <div className="sankey-modal">
        <div className="sankey-modal__totals">
          <div className="sankey-modal__total">
            <span className="sankey-modal__total-label">SOURCES TOTAL</span>
            <span className="sankey-modal__total-value">{srcTotal.toFixed(1)}{srcVals[0]?.unit && ` ${srcVals[0].unit}`}</span>
          </div>
          <div className="sankey-modal__total">
            <span className="sankey-modal__total-label">LOADS TOTAL</span>
            <span className="sankey-modal__total-value">{conTotal.toFixed(1)}{conVals[0]?.unit && ` ${conVals[0].unit}`}</span>
          </div>
        </div>

        <div className="sankey-modal__columns">
          <div className="sankey-modal__column">
            <div className="sankey-modal__column-head">SOURCES</div>
            <SankeyRows rows={srcSorted} total={srcTotal} accent="info" />
          </div>
          <div className="sankey-modal__column">
            <div className="sankey-modal__column-head">CONSUMERS</div>
            <SankeyRows rows={conSorted} total={conTotal} accent="ok" />
          </div>
        </div>
      </div>
    </TileModal>
  );
};

interface SankeyRow { entityId: string; label: string; value: number; unit: string }

const SankeyRows: FC<{ rows: SankeyRow[]; total: number; accent: 'ok' | 'info' }> = ({ rows, total, accent }) => (
  <div className="sankey-modal__rows">
    {rows.map((r) => {
      const pct = total > 0 ? (r.value / total) * 100 : 0;
      return (
        <div key={r.entityId} className="sankey-modal__row">
          <div className="sankey-modal__row-head">
            <span className="sankey-modal__row-label">{r.label}</span>
            <span className="sankey-modal__row-value">{r.value.toFixed(1)} {r.unit}</span>
          </div>
          <div className="sankey-modal__bar">
            <div className={`sankey-modal__bar-fill sankey-modal__bar-fill--${accent}`} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <div className="sankey-modal__row-pct">{pct.toFixed(1)}%</div>
        </div>
      );
    })}
    {rows.length === 0 && <div className="sankey-modal__empty">No nodes configured.</div>}
  </div>
);
