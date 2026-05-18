import { useMemo, type FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEntity, useHass } from '../hass';
import { PlotTile } from '../components/tiles/PlotTile';

// Entity deep-dive page v1. Tile click eventually navigates here for a fuller
// view than the modal. Currently a passive read: name, state, attributes,
// history chart. Tile-level controls come later (we'd lift the per-domain
// control rows out of each tile into a domain renderer).
export const EntityDetail: FC = () => {
  const { entityId = '' } = useParams<{ entityId: string }>();
  const entity = useEntity(entityId);
  const store = useHass();
  const source = entityId ? store.getEntitySource(entityId) : 'none';
  const friendly = (entity?.attributes?.friendly_name as string | undefined) ?? entityId;
  const unit = (entity?.attributes?.unit_of_measurement as string | undefined) ?? '';

  const isNumeric = useMemo(() => {
    if (!entity) return false;
    return Number.isFinite(parseFloat(entity.state));
  }, [entity]);

  return (
    <div className="entity-detail-page">
      <Link to="/" className="entity-detail-page__back">← Back to overview</Link>
      <div className="entity-detail-page__head">
        <div className="entity-detail-page__title">{friendly}</div>
        <div className="entity-detail-page__id">{entityId}</div>
        <div className={`entity-detail-page__source entity-detail-page__source--${source}`}>{source.toUpperCase()}</div>
      </div>

      {!entity ? (
        <div className="entity-detail-page__empty">Entity not found. Check the entity_id or remap demo placeholders.</div>
      ) : (
        <>
          <div className="entity-detail-page__hero">
            <div className="entity-detail-page__state">{entity.state}{unit && <span className="entity-detail-page__unit">{unit}</span>}</div>
            <div className="entity-detail-page__meta">
              <span>Last changed: {new Date(entity.last_changed).toLocaleString()}</span>
              <span>Last updated: {new Date(entity.last_updated).toLocaleString()}</span>
            </div>
          </div>

          {isNumeric && (
            <div className="entity-detail-page__chart">
              <PlotTile entityId={entityId} points={120} timeRange="24h" />
            </div>
          )}

          <div className="entity-detail-page__attrs">
            <div className="entity-detail-page__attrs-head">ATTRIBUTES</div>
            <div className="entity-detail-page__attrs-body">
              {Object.entries(entity.attributes).map(([k, v]) => (
                <div key={k} className="entity-detail-page__attr">
                  <span className="entity-detail-page__attr-key">{k}</span>
                  <span className="entity-detail-page__attr-val">
                    {typeof v === 'object' && v !== null ? JSON.stringify(v) : v == null ? '' : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
