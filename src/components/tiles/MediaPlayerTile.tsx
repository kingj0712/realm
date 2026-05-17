import type { FC, MouseEvent, ReactNode } from 'react';
import {
  mdiPause,
  mdiPlay,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiMusic,
} from '@mdi/js';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';
import { Icon } from '../Icon';

interface MediaPlayerTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function fmtTime(seconds: number | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return '--:--';
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export const MediaPlayerTile: FC<MediaPlayerTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="media-tile">n/a</div>
      </BaseTile>
    );
  }

  const state = entity.state; // 'playing', 'paused', 'idle', 'off'
  const isPlaying = state === 'playing';
  const status: TileStatus = isPlaying ? 'info' : state === 'paused' ? 'warn' : 'idle';
  const pill = state.toUpperCase();
  const title = (entity.attributes.media_title as string | undefined) ?? 'No track';
  const artist = (entity.attributes.media_artist as string | undefined) ?? '';
  const album = (entity.attributes.media_album_name as string | undefined) ?? '';
  const duration = entity.attributes.media_duration as number | undefined;
  const position = entity.attributes.media_position as number | undefined;
  const cover = entity.attributes.entity_picture as string | undefined;
  const progress = duration && position != null ? Math.min(100, (position / duration) * 100) : 0;

  const callMedia = (service: string) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('media_player', service, undefined, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={pill}>
      <div className="media-tile">
        <div className="media-tile__art">
          {cover ? (
            <img className="media-tile__art-img" src={cover} alt={album || title} />
          ) : (
            <div className="media-tile__art-placeholder">
              <Icon path={mdiMusic} size={28} />
            </div>
          )}
          {isPlaying && (
            <div className="media-tile__eq" aria-hidden>
              <span /><span /><span /><span />
            </div>
          )}
        </div>
        <div className="media-tile__info">
          <div className="media-tile__title" title={title}>{title}</div>
          <div className="media-tile__artist" title={artist}>{artist}</div>
          <div className="media-tile__progress">
            <div className="media-tile__progress-track">
              <div className="media-tile__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="media-tile__times">
              <span>{fmtTime(position)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>
          <div className="media-tile__controls">
            <button type="button" className="media-tile__btn" onClick={callMedia('media_previous_track')} aria-label="previous">
              <Icon path={mdiSkipPrevious} size={18} />
            </button>
            <button
              type="button"
              className="media-tile__btn media-tile__btn--primary"
              onClick={callMedia('media_play_pause')}
              aria-label={isPlaying ? 'pause' : 'play'}
            >
              <Icon path={isPlaying ? mdiPause : mdiPlay} size={20} />
            </button>
            <button type="button" className="media-tile__btn" onClick={callMedia('media_next_track')} aria-label="next">
              <Icon path={mdiSkipNext} size={18} />
            </button>
          </div>
        </div>
      </div>
    </BaseTile>
  );
};
