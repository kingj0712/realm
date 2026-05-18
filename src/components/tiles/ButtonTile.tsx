import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';
import { ConfirmModal } from '../ConfirmModal';

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
  // When true, show a confirmation modal before firing the service. Good for
  // garage doors, locks, or anything where an accidental tap is consequential.
  confirmBeforeAction?: boolean;
  confirmMessage?: string;
}

export const ButtonTile: FC<ButtonTileProps> = ({
  entityId,
  label,
  icon,
  buttonText = 'TOGGLE',
  service,
  states,
  confirmBeforeAction,
  confirmMessage,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [pendingConfirm, setPendingConfirm] = useState(false);
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

  const runAction = () => {
    const dom = service?.domain ?? domain;
    const svc = service?.service ?? 'toggle';
    store.callService(dom, svc, service?.data, { entity_id: entityId });
  };

  const onAction = () => {
    if (confirmBeforeAction) {
      setPendingConfirm(true);
      return;
    }
    runAction();
  };

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} pill={pill}>
        <button type="button" className="button-tile__btn" onClick={onAction}>
          {btnText}
        </button>
      </BaseTile>
      {pendingConfirm && (
        <ConfirmModal
          title={btnText}
          message={confirmMessage || `${btnText} ${friendly}?`}
          confirmText={btnText}
          tone="caution"
          onCancel={() => setPendingConfirm(false)}
          onConfirm={() => { setPendingConfirm(false); runAction(); }}
        />
      )}
    </>
  );
};
