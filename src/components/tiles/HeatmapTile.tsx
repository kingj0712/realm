import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface HeatmapTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  cols?: number;
  // Attribute name on the entity holding the array (default: 'history_28d').
  historyAttribute?: string;
}

export const HeatmapTile: FC<HeatmapTileProps> = ({
  entityId,
  label,
  icon,
  cols = 7,
  historyAttribute = 'history_28d',
}) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const series = (entity.attributes[historyAttribute] as number[] | undefined) ?? [];
  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  if (!series.length) return <BaseTile label={friendly} icon={icon} pill="empty"><div>no data</div></BaseTile>;

  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = max - min || 1;

  return (
    <BaseTile label={friendly} icon={icon} pill={`${series.length}D`}>
      <div className="heatmap-tile">
        <div className="heatmap-tile__grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {series.map((v, i) => {
            const t = (v - min) / range;
            const opacity = (0.15 + t * 0.85).toFixed(2);
            return (
              <span
                key={i}
                className="heatmap-tile__cell"
                style={{ background: `rgba(34, 211, 238, ${opacity})` }}
                title={`${v} ${unit}`}
              />
            );
          })}
        </div>
        <div className="heatmap-tile__legend">
          <span className="heatmap-tile__legend-label">LOW {min}</span>
          <div className="heatmap-tile__legend-bar" />
          <span className="heatmap-tile__legend-label">{max} HIGH</span>
        </div>
      </div>
    </BaseTile>
  );
};
