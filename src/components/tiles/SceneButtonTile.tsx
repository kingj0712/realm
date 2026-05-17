import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface SceneButtonTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  status?: TileStatus;
}

export const SceneButtonTile: FC<SceneButtonTileProps> = ({ entityId, label, icon, status = 'info' }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  const [flash, setFlash] = useState(false);

  const activate = () => {
    store.callService('scene', 'turn_on', undefined, { entity_id: entityId });
    setFlash(true);
    window.setTimeout(() => setFlash(false), 600);
  };

  return (
    <BaseTile label="SCENE" status={status} icon={icon} pill={flash ? 'ACTIVATED' : 'READY'} onClick={activate}>
      <div className={`scene-button-tile${flash ? ' scene-button-tile--flash' : ''}`}>
        <div className="scene-button-tile__title">{friendly}</div>
        <div className="scene-button-tile__hint">TAP TO ACTIVATE</div>
      </div>
    </BaseTile>
  );
};
