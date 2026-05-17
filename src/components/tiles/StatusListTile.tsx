import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface StatusListEntry {
  entityId: string;
  label: string;
  // Which entity state means "active" / "tripped" / "open". Default: 'on'.
  activeWhen?: 'on' | 'off';
  // Override the state text shown on the right. Defaults to uppercased entity.state.
  stateLabels?: { on?: string; off?: string };
  // Color treatment for active rows. Default 'info' (cyan/blue accent).
  activeStatus?: TileStatus;
}

interface StatusListTileProps {
  label: string;
  icon?: ReactNode;
  pill?: string;
  entries: StatusListEntry[];
}

const StatusListRow: FC<StatusListEntry> = ({
  entityId,
  label,
  activeWhen = 'on',
  stateLabels,
  activeStatus = 'info',
}) => {
  const entity = useEntity(entityId);
  const state = entity?.state;
  const active = state === activeWhen;

  const stateText =
    (active ? stateLabels?.on : stateLabels?.off) ?? state?.toUpperCase() ?? 'n/a';

  const rowClasses = ['status-list-tile__row'];
  if (active) rowClasses.push('status-list-tile__row--active');
  if (active) rowClasses.push(`status-list-tile__row--${activeStatus}`);

  return (
    <div className={rowClasses.join(' ')}>
      <span className="status-list-tile__dot">{active ? '●' : '○'}</span>
      <span className="status-list-tile__label">{label}</span>
      <span className="status-list-tile__state">{stateText}</span>
    </div>
  );
};

export const StatusListTile: FC<StatusListTileProps> = ({ label, icon, pill, entries }) => (
  <BaseTile label={label} icon={icon} pill={pill}>
    <div className="status-list-tile">
      {entries.map((e) => (
        <StatusListRow key={e.entityId} {...e} />
      ))}
    </div>
  </BaseTile>
);
