import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { TileModal } from './TileModal';
import { useEntity } from '../../hass';

interface HomelabHost {
  name: string;
  cpuEntityId: string;
  memoryEntityId: string;
  // Optional per-host extras used by the detail modal. Tiles read CPU/RAM only.
  diskEntityId?: string;
  uptimeEntityId?: string;
  statusEntityId?: string;
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <BaseTile label={label} icon={icon} pill={`${hosts.length} HOSTS`} onClick={() => setOpen(true)}>
        <div className="homelab-tile">
          {hosts.map((h) => <HostRow key={h.name} host={h} />)}
        </div>
      </BaseTile>
      {open && <HomelabModal title={label} hosts={hosts} onClose={() => setOpen(false)} />}
    </>
  );
};

interface HomelabModalProps {
  title: string;
  hosts: HomelabHost[];
  onClose: () => void;
}

const HomelabModal: FC<HomelabModalProps> = ({ title, hosts, onClose }) => (
  <TileModal title={title} subtitle={`${hosts.length} host${hosts.length === 1 ? '' : 's'}`} onClose={onClose} size="lg">
    <div className="homelab-modal">
      <div className="homelab-modal__head">
        <span>HOST</span>
        <span>STATUS</span>
        <span>CPU</span>
        <span>RAM</span>
        <span>DISK</span>
        <span>UPTIME</span>
      </div>
      {hosts.map((h) => <HomelabModalRow key={h.name} host={h} />)}
    </div>
  </TileModal>
);

const HomelabModalRow: FC<{ host: HomelabHost }> = ({ host }) => {
  const cpu = useEntity(host.cpuEntityId);
  const mem = useEntity(host.memoryEntityId);
  const disk = useEntity(host.diskEntityId ?? '');
  const uptime = useEntity(host.uptimeEntityId ?? '');
  const statusEnt = useEntity(host.statusEntityId ?? '');
  const cpuPct = cpu ? parseFloat(cpu.state) : NaN;
  const memPct = mem ? parseFloat(mem.state) : NaN;
  const diskPct = disk ? parseFloat(disk.state) : NaN;
  const cpuSafe = Number.isFinite(cpuPct) ? cpuPct : 0;
  const memSafe = Number.isFinite(memPct) ? memPct : 0;
  const diskSafe = Number.isFinite(diskPct) ? diskPct : 0;

  const isUp = statusEnt
    ? statusEnt.state === 'on' || statusEnt.state === 'online' || statusEnt.state === 'home'
    : Number.isFinite(cpuPct);

  return (
    <div className="homelab-modal__row">
      <div className="homelab-modal__cell homelab-modal__cell--name">{host.name}</div>
      <div className="homelab-modal__cell">
        <span className={`homelab-modal__dot homelab-modal__dot--${isUp ? 'ok' : 'alarm'}`} />
        <span>{isUp ? 'UP' : 'DOWN'}</span>
      </div>
      <Metric pct={cpuSafe} available={Number.isFinite(cpuPct)} />
      <Metric pct={memSafe} available={Number.isFinite(memPct)} />
      <Metric pct={diskSafe} available={!!host.diskEntityId && Number.isFinite(diskPct)} />
      <div className="homelab-modal__cell homelab-modal__cell--uptime">{uptime?.state ?? '—'}</div>
    </div>
  );
};

const Metric: FC<{ pct: number; available: boolean }> = ({ pct, available }) => {
  if (!available) return <div className="homelab-modal__cell homelab-modal__cell--muted">—</div>;
  const status: TileStatus = statusForPct(pct);
  return (
    <div className="homelab-modal__cell">
      <div className={`homelab-modal__bar homelab-modal__bar--${status}`}>
        <div className="homelab-modal__bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="homelab-modal__bar-val">{pct.toFixed(0)}%</span>
    </div>
  );
};
