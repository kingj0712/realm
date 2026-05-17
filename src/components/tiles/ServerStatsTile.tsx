import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface ServerStatsTileProps {
  label?: string;
  icon?: ReactNode;
  cpuEntityId: string;
  memoryEntityId: string;
  diskEntityId: string;
}

function statusForPct(pct: number): TileStatus {
  if (pct >= 90) return 'alarm';
  if (pct >= 75) return 'warn';
  return 'ok';
}

const StatRow: FC<{ label: string; entityId: string }> = ({ label, entityId }) => {
  const entity = useEntity(entityId);
  const pct = entity ? parseFloat(entity.state) : NaN;
  const safe = Number.isFinite(pct) ? pct : 0;
  const status = statusForPct(safe);
  return (
    <div className="server-stats__row">
      <span className="server-stats__label">{label}</span>
      <div className={`server-stats__bar server-stats__bar--${status}`}>
        <div className="server-stats__bar-fill" style={{ width: `${Math.min(100, safe)}%` }} />
      </div>
      <span className={`server-stats__value server-stats__value--${status}`}>{Number.isFinite(pct) ? pct.toFixed(1) : '--'}%</span>
    </div>
  );
};

export const ServerStatsTile: FC<ServerStatsTileProps> = ({ label = 'HA SERVER', icon, cpuEntityId, memoryEntityId, diskEntityId }) => (
  <BaseTile label={label} icon={icon}>
    <div className="server-stats">
      <StatRow label="CPU" entityId={cpuEntityId} />
      <StatRow label="RAM" entityId={memoryEntityId} />
      <StatRow label="DISK" entityId={diskEntityId} />
    </div>
  </BaseTile>
);
