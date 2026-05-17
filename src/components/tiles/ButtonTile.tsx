import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface StateConfig {
  pill?: string;
  status?: TileStatus;
  buttonText?: string;
}

interface ButtonTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  buttonText?: string;
  // Service to call. Defaults to `${entity_domain}.toggle`.
  service?: { domain: string; service: string; data?: Record<string, unknown> };
  // Per-state overrides for pill text, status accent, and button label.
  states?: Record<string, StateConfig>;
}

export const ButtonTile: FC<ButtonTileProps> = ({
  entityId,
  label,
  icon,
  buttonText = 'TOGGLE',
  service,
  states,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <button type="button" className="button-tile__btn" disabled>
          {buttonText}
        </button>
      </BaseTile>
    );
  }

  const cfg = states?.[entity.state];
  const status = cfg?.status ?? 'idle';
  const pill = cfg?.pill ?? entity.state.toUpperCase();
  const btnText = cfg?.buttonText ?? buttonText;
  const domain = entityId.split('.')[0];

  const onAction = () => {
    const dom = service?.domain ?? domain;
    const svc = service?.service ?? 'toggle';
    store.callService(dom, svc, service?.data, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={pill}>
      <button type="button" className="button-tile__btn" onClick={onAction}>
        {btnText}
      </button>
    </BaseTile>
  );
};
