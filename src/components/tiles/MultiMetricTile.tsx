import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { TileModal } from './TileModal';

interface MetricThreshold {
  warn?: { lt?: number; gt?: number };
  alarm?: { lt?: number; gt?: number };
}

interface MetricSpec {
  entityId: string;
  label: string;
  precision?: number;
  // Override entity's unit_of_measurement.
  unit?: string;
  // Drive per-metric value color from thresholds (independent of tile status).
  thresholds?: MetricThreshold;
}

interface MultiMetricTileProps {
  label: string;
  icon?: ReactNode;
  pill?: string;
  status?: TileStatus;
  metrics: MetricSpec[];
  columns?: number;
}

function evaluateMetric(value: number, t?: MetricThreshold): TileStatus {
  if (!t) return 'ok';
  if (t.alarm) {
    if (t.alarm.lt != null && value < t.alarm.lt) return 'alarm';
    if (t.alarm.gt != null && value > t.alarm.gt) return 'alarm';
  }
  if (t.warn) {
    if (t.warn.lt != null && value < t.warn.lt) return 'warn';
    if (t.warn.gt != null && value > t.warn.gt) return 'warn';
  }
  return 'ok';
}

const MetricCell: FC<MetricSpec> = ({ entityId, label, precision, unit, thresholds }) => {
  const entity = useEntity(entityId);
  if (!entity) {
    return (
      <div className="multi-metric-tile__cell">
        <span className="multi-metric-tile__label">{label}</span>
        <span className="multi-metric-tile__value">n/a</span>
      </div>
    );
  }

  const u = unit ?? (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const display = isNumeric && precision != null ? raw.toFixed(precision) : entity.state;
  const metricStatus: TileStatus = isNumeric ? evaluateMetric(raw, thresholds) : 'idle';

  return (
    <div className="multi-metric-tile__cell">
      <span className="multi-metric-tile__label">{label}</span>
      <span className={`multi-metric-tile__value multi-metric-tile__value--${metricStatus}`}>
        {display}
        {u && <span className="multi-metric-tile__unit">{u}</span>}
      </span>
    </div>
  );
};

const MetricDetailRow: FC<MetricSpec> = ({ entityId, label, precision, unit }) => {
  const entity = useEntity(entityId);
  const raw = entity ? parseFloat(entity.state) : NaN;
  const isNumeric = Number.isFinite(raw);
  const display = entity
    ? isNumeric && precision != null ? raw.toFixed(precision) : entity.state
    : 'n/a';
  const u = unit ?? (entity?.attributes.unit_of_measurement as string | undefined) ?? '';
  const friendly = (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  return (
    <div className="entity-detail__attr">
      <span className="entity-detail__attr-key">{label}</span>
      <span className="entity-detail__attr-val">{display}{u ? ` ${u}` : ''} ({friendly})</span>
    </div>
  );
};

export const MultiMetricTile: FC<MultiMetricTileProps> = ({
  label,
  icon,
  pill,
  status,
  metrics,
  columns = 2,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BaseTile label={label} status={status} icon={icon} pill={pill} onClick={() => setOpen(true)}>
        <div
          className="multi-metric-tile"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {metrics.map((m) => (
            <MetricCell key={m.entityId} {...m} />
          ))}
        </div>
      </BaseTile>
      {open && (
        <TileModal title={label} pill={pill} onClose={() => setOpen(false)} size="lg">
          <div className="entity-detail__attrs">
            <div className="entity-detail__attrs-head">METRICS</div>
            <div className="entity-detail__attrs-body">
              {metrics.map((m) => <MetricDetailRow key={m.entityId} {...m} />)}
            </div>
          </div>
        </TileModal>
      )}
    </>
  );
};
