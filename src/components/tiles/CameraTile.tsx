import { useEffect, useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

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
  // Optional override for the empty-state text. The Showcase layout sets this
  // to short feed names ("DRIVEWAY FEED" / "GARAGE FEED") so the placeholder
  // reads as an intentional demo rather than a broken camera.
  placeholderLabel?: string;
}

export const CameraTile: FC<CameraTileProps> = ({ entityId, label, icon, snapshotUrl, refreshSeconds = 10, placeholderLabel }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  const [time, setTime] = useState(() => new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [open, setOpen] = useState(false);

  // Live timestamp overlay updates each second.
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Snapshot poller — bumps a cache-bust key so <img> re-fetches. In the modal
  // we also want fresher frames, so the same key drives both views.
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
  const brand = entity.attributes.brand as string | undefined;
  const model = entity.attributes.model_name as string | undefined;
  const motionDetected = entity.attributes.motion_detected as boolean | undefined;

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} pill={pill} onClick={() => setOpen(true)}>
        <div className="camera-tile">
          <div className="camera-tile__viewport">
            {url ? (
              <img className="camera-tile__img" src={url} alt={friendly} />
            ) : (
              <div className="camera-tile__placeholder camera-tile__placeholder--demo">
                <div className="camera-tile__placeholder-pattern" aria-hidden />
                <div className="camera-tile__placeholder-label">{placeholderLabel ?? 'NO SIGNAL'}</div>
                {placeholderLabel && <div className="camera-tile__placeholder-tag">DEMO</div>}
              </div>
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
      {open && (
        <EntityDetailModal
          entityId={entityId}
          title={friendly}
          pill={pill}
          onClose={() => setOpen(false)}
        >
          <div className="camera-detail">
            <div className="camera-detail__viewport">
              {url ? (
                <img className="camera-detail__img" src={url} alt={friendly} />
              ) : (
                <div className="camera-detail__placeholder">NO SIGNAL</div>
              )}
              <div className="camera-detail__overlay">
                {entity.state === 'recording' && (
                  <span className="camera-tile__rec">
                    <span className="camera-tile__rec-dot" />
                    REC
                  </span>
                )}
                <span className="camera-tile__time">{timeStr}</span>
              </div>
            </div>
            <div className="camera-detail__meta">
              <div className="camera-detail__meta-row">
                <span className="camera-detail__meta-label">STATE</span>
                <span className="camera-detail__meta-value">{entity.state}</span>
              </div>
              {brand && (
                <div className="camera-detail__meta-row">
                  <span className="camera-detail__meta-label">BRAND</span>
                  <span className="camera-detail__meta-value">{brand}</span>
                </div>
              )}
              {model && (
                <div className="camera-detail__meta-row">
                  <span className="camera-detail__meta-label">MODEL</span>
                  <span className="camera-detail__meta-value">{model}</span>
                </div>
              )}
              {motionDetected != null && (
                <div className="camera-detail__meta-row">
                  <span className="camera-detail__meta-label">MOTION</span>
                  <span className="camera-detail__meta-value">{motionDetected ? 'DETECTED' : 'CLEAR'}</span>
                </div>
              )}
              <div className="camera-detail__meta-row">
                <span className="camera-detail__meta-label">REFRESH</span>
                <span className="camera-detail__meta-value">{refreshSeconds ? `${refreshSeconds}s` : 'manual'}</span>
              </div>
            </div>
          </div>
        </EntityDetailModal>
      )}
    </>
  );
};
