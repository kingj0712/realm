import { useState, type FC, type ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { TileModal } from './TileModal';
import { useEntity } from '../../hass';

interface ExtraEntity {
  label: string;
  entityId: string;
}

interface LaundryTileProps {
  label?: string;
  icon?: ReactNode;
  washerEntityId: string;
  dryerEntityId: string;
  // Additional entity rows shown below each appliance — e.g. time remaining,
  // mode, door open. Each appears as a small "LABEL: state" line.
  washerExtras?: ExtraEntity[];
  dryerExtras?: ExtraEntity[];
}

const ExtraRow: FC<ExtraEntity> = ({ label, entityId }) => {
  const e = useEntity(entityId);
  if (!e) return null;
  return (
    <div className="laundry-tile__extra">
      <span className="laundry-tile__extra-label">{label}</span>
      <span className="laundry-tile__extra-value">{e.state}</span>
    </div>
  );
};

const ApplianceCell: FC<{ entityId: string; kind: 'WASHER' | 'DRYER'; extras: ExtraEntity[] }> = ({ entityId, kind, extras }) => {
  const entity = useEntity(entityId);
  if (!entity) return null;
  const state = entity.state;
  const isActive = state === 'running' || state === 'active' || state === 'on';
  const cycle = (entity.attributes.cycle as string | undefined) ?? '—';
  const remaining = (entity.attributes.time_remaining as string | undefined) ?? '0:00';

  return (
    <div className={`laundry-tile__cell${isActive ? ' laundry-tile__cell--active' : ''}`}>
      <div className="laundry-tile__cell-head">
        <span className="laundry-tile__kind">{kind}</span>
        <span className={`laundry-tile__state${isActive ? ' laundry-tile__state--active' : ''}`}>{state.toUpperCase()}</span>
      </div>
      <svg className="laundry-tile__svg" viewBox="0 0 60 60" aria-hidden>
        <rect x="4" y="4" width="52" height="52" rx="3" fill="var(--surface-container)" stroke="var(--on-surface-faint)" strokeWidth="1" />
        <circle cx="30" cy="34" r="18" fill="var(--surface-container-lowest)" stroke="var(--on-surface-faint)" strokeWidth="1" />
        <g className={isActive ? 'laundry-tile__drum laundry-tile__drum--spinning' : 'laundry-tile__drum'}>
          <circle cx="30" cy="34" r="14" fill="none" stroke="var(--status-info)" strokeWidth="0.6" strokeDasharray="3 2" />
          <line x1="30" y1="20" x2="30" y2="48" stroke="var(--status-info)" strokeWidth="0.5" opacity="0.4" />
          <line x1="16" y1="34" x2="44" y2="34" stroke="var(--status-info)" strokeWidth="0.5" opacity="0.4" />
        </g>
        <circle cx="48" cy="10" r="1.5" fill={isActive ? 'var(--status-info)' : 'var(--on-surface-faint)'} />
      </svg>
      <div className="laundry-tile__cycle">{cycle}</div>
      <div className="laundry-tile__remaining">{isActive ? remaining : '—'}</div>
      {extras.length > 0 && (
        <div className="laundry-tile__extras">
          {extras.map((x, i) => <ExtraRow key={i} {...x} />)}
        </div>
      )}
    </div>
  );
};

export const LaundryTile: FC<LaundryTileProps> = ({
  label = 'LAUNDRY', icon, washerEntityId, dryerEntityId,
  washerExtras = [], dryerExtras = [],
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BaseTile label={label} icon={icon} onClick={() => setOpen(true)}>
        <div className="laundry-tile">
          <ApplianceCell entityId={washerEntityId} kind="WASHER" extras={washerExtras} />
          <ApplianceCell entityId={dryerEntityId} kind="DRYER" extras={dryerExtras} />
        </div>
      </BaseTile>
      {open && (
        <LaundryModal
          title={label}
          washerEntityId={washerEntityId}
          dryerEntityId={dryerEntityId}
          washerExtras={washerExtras}
          dryerExtras={dryerExtras}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

interface LaundryModalProps {
  title: string;
  washerEntityId: string;
  dryerEntityId: string;
  washerExtras: ExtraEntity[];
  dryerExtras: ExtraEntity[];
  onClose: () => void;
}

// Side-by-side appliance summary: state pill, mode/cycle, remaining time,
// then a stacked list of configured extras (door, power, etc.). Data-forward;
// no spinning animations needed at this size.
const LaundryModal: FC<LaundryModalProps> = ({ title, washerEntityId, dryerEntityId, washerExtras, dryerExtras, onClose }) => (
  <TileModal title={title} subtitle="Washer & Dryer" onClose={onClose} size="lg">
    <div className="laundry-modal">
      <ApplianceDetail entityId={washerEntityId} kind="WASHER" extras={washerExtras} />
      <ApplianceDetail entityId={dryerEntityId} kind="DRYER" extras={dryerExtras} />
    </div>
  </TileModal>
);

const ApplianceDetail: FC<{ entityId: string; kind: 'WASHER' | 'DRYER'; extras: ExtraEntity[] }> = ({ entityId, kind, extras }) => {
  const entity = useEntity(entityId);
  if (!entity) {
    return (
      <div className="laundry-modal__cell">
        <div className="laundry-modal__kind">{kind}</div>
        <div className="laundry-modal__empty">Entity unavailable.</div>
      </div>
    );
  }
  const state = entity.state;
  const isActive = state === 'running' || state === 'active' || state === 'on';
  const cycle = (entity.attributes.cycle as string | undefined) ?? '—';
  const remaining = (entity.attributes.time_remaining as string | undefined) ?? '0:00';
  return (
    <div className={`laundry-modal__cell${isActive ? ' laundry-modal__cell--active' : ''}`}>
      <div className="laundry-modal__head">
        <span className="laundry-modal__kind">{kind}</span>
        <span className={`laundry-modal__state${isActive ? ' laundry-modal__state--active' : ''}`}>{state.toUpperCase()}</span>
      </div>
      <div className="laundry-modal__metrics">
        <div className="laundry-modal__metric">
          <span className="laundry-modal__metric-label">CYCLE</span>
          <span className="laundry-modal__metric-value">{cycle}</span>
        </div>
        <div className="laundry-modal__metric">
          <span className="laundry-modal__metric-label">REMAINING</span>
          <span className="laundry-modal__metric-value">{isActive ? remaining : '—'}</span>
        </div>
      </div>
      {extras.length > 0 && (
        <div className="laundry-modal__extras">
          {extras.map((x, i) => <ExtraDetail key={i} {...x} />)}
        </div>
      )}
    </div>
  );
};

const ExtraDetail: FC<ExtraEntity> = ({ label, entityId }) => {
  const e = useEntity(entityId);
  return (
    <div className="laundry-modal__extra">
      <span className="laundry-modal__extra-label">{label}</span>
      <span className="laundry-modal__extra-value">{e ? e.state : '—'}</span>
    </div>
  );
};
