import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface CameraTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Override the snapshot URL. If omitted, the entity's `entity_picture`
  // attribute is used (which is what UniFi Protect, Frigate, generic camera
  // integrations populate). HA serves snapshots through this URL.
  snapshotUrl?: string;
  // Polling interval in seconds for refreshing the snapshot via cache-bust.
  // Set to 0 to disable polling (still loads once).
  refreshSeconds?: number;
}

export const CameraTile: FC<CameraTileProps> = ({ entityId, label, icon, snapshotUrl, refreshSeconds = 10 }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  const [time, setTime] = useState(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // Live timestamp overlay updates each second.
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Snapshot poller — bumps a cache-bust key so <img> re-fetches.
  useEffect(() => {
    if (!refreshSeconds || refreshSeconds <= 0) return;
    const t = setInterval(() => setRefreshKey((k) => k + 1), refreshSeconds * 1000);
    return () => clearInterval(t);
  }, [refreshSeconds]);

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="camera-tile">n/a</div>
      </BaseTile>
    );
  }

  const status: TileStatus = entity.state === 'recording' ? 'alarm' : entity.state === 'streaming' ? 'info' : 'idle';
  const pill = entity.state.toUpperCase();
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  const baseUrl = snapshotUrl ?? (entity.attributes.entity_picture as string | undefined);
  const url = baseUrl ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}r=${refreshKey}` : null;

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={pill}>
      <div className="camera-tile">
        <div className="camera-tile__viewport">
          {url ? (
            <img className="camera-tile__img" src={url} alt={friendly} />
          ) : (
            <div className="camera-tile__placeholder">NO SIGNAL</div>
          )}
          {/* Corner brackets */}
          <span className="camera-tile__corner camera-tile__corner--tl" />
          <span className="camera-tile__corner camera-tile__corner--tr" />
          <span className="camera-tile__corner camera-tile__corner--bl" />
          <span className="camera-tile__corner camera-tile__corner--br" />
          {/* Overlay */}
          <div className="camera-tile__overlay">
            {entity.state === 'recording' && (
              <span className="camera-tile__rec">
                <span className="camera-tile__rec-dot" />
                REC
              </span>
            )}
            <span className="camera-tile__time">{timeStr}</span>
          </div>
        </div>
      </div>
    </BaseTile>
  );
};
