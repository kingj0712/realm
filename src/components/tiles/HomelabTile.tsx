import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface HomelabHost {
  name: string;
  cpuEntityId: string;
  memoryEntityId: string;
}

interface HomelabTileProps {
  label?: string;
  icon?: ReactNode;
  hosts: HomelabHost[];
}

function statusForPct(pct: number): TileStatus {
  if (pct >= 90) return 'alarm';
  if (pct >= 75) return 'warn';
  return 'ok';
}

const HostRow: FC<{ host: HomelabHost }> = ({ host }) => {
  const cpu = useEntity(host.cpuEntityId);
  const memory = useEntity(host.memoryEntityId);
  const cpuPct = cpu ? parseFloat(cpu.state) : NaN;
  const memPct = memory ? parseFloat(memory.state) : NaN;
  const cpuSafe = Number.isFinite(cpuPct) ? cpuPct : 0;
  const memSafe = Number.isFinite(memPct) ? memPct : 0;
  const cpuStatus = statusForPct(cpuSafe);
  const memStatus = statusForPct(memSafe);

  return (
    <div className="homelab-tile__host">
      <span className="homelab-tile__host-name">{host.name}</span>
      <div className="homelab-tile__bars">
        <div className="homelab-tile__bar-line">
          <span className="homelab-tile__bar-label">CPU</span>
          <div className={`homelab-tile__bar homelab-tile__bar--${cpuStatus}`}>
            <div className="homelab-tile__bar-fill" style={{ width: `${Math.min(100, cpuSafe)}%` }} />
          </div>
          <span className="homelab-tile__bar-val">{cpuSafe.toFixed(0)}%</span>
        </div>
        <div className="homelab-tile__bar-line">
          <span className="homelab-tile__bar-label">RAM</span>
          <div className={`homelab-tile__bar homelab-tile__bar--${memStatus}`}>
            <div className="homelab-tile__bar-fill" style={{ width: `${Math.min(100, memSafe)}%` }} />
          </div>
          <span className="homelab-tile__bar-val">{memSafe.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export const HomelabTile: FC<HomelabTileProps> = ({ label = 'HOMELAB', icon, hosts }) => {
  return (
    <BaseTile label={label} icon={icon} pill={`${hosts.length} HOSTS`}>
      <div className="homelab-tile">
        {hosts.map((h) => <HostRow key={h.name} host={h} />)}
      </div>
    </BaseTile>
  );
};
