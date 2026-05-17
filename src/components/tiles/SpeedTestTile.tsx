import type { FC, MouseEvent, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface SpeedTestTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Service to call when "RUN TEST" is clicked. Defaults to button.press.
  runService?: { domain: string; service: string };
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return 'never';
  try {
    const d = new Date(iso);
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return '--'; }
}

export const SpeedTestTile: FC<SpeedTestTileProps> = ({ entityId, label, icon, runService }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const isRunning = entity.state === 'running' || entity.state === 'testing';
  const status: TileStatus = isRunning ? 'info' : 'ok';
  const down = entity.attributes.download as number | undefined;
  const up = entity.attributes.upload as number | undefined;
  const ping = entity.attributes.ping as number | undefined;
  const lastRun = entity.attributes.last_run as string | undefined;

  const runTest = (e: MouseEvent) => {
    e.stopPropagation();
    const dom = runService?.domain ?? 'button';
    const svc = runService?.service ?? 'press';
    store.callService(dom, svc, undefined, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={isRunning ? 'TESTING…' : fmtTime(lastRun)}>
      <div className="speedtest-tile">
        <div className="speedtest-tile__row speedtest-tile__row--down">
          <span className="speedtest-tile__arrow">↓</span>
          <span className="speedtest-tile__num">{down?.toFixed(0) ?? '--'}</span>
          <span className="speedtest-tile__unit">Mbps</span>
        </div>
        <div className="speedtest-tile__row speedtest-tile__row--up">
          <span className="speedtest-tile__arrow">↑</span>
          <span className="speedtest-tile__num">{up?.toFixed(1) ?? '--'}</span>
          <span className="speedtest-tile__unit">Mbps</span>
        </div>
        <div className="speedtest-tile__ping">
          <span className="speedtest-tile__ping-label">PING</span>
          <span className="speedtest-tile__ping-val">{ping ?? '--'} ms</span>
          <button type="button" className="speedtest-tile__run" onClick={runTest}>RUN TEST</button>
        </div>
      </div>
    </BaseTile>
  );
};
