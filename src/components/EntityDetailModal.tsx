import type { FC, ReactNode } from 'react';
import { TileModal } from './tiles/TileModal';
import { PlotTile } from './tiles/PlotTile';
import { useEntity } from '../hass';

interface EntityDetailModalProps {
  entityId: string;
  title: string;
  pill?: string;
  onClose: () => void;
  // Optional override: when provided, replaces the default chart+attributes body.
  // Weather/Camera tiles use this to show their own extended views.
  children?: ReactNode;
}

// Generic detail modal opened when a viewer tile (tank, gauge, donut, etc.)
// is clicked outside edit mode. Default body is a 60-point history plot plus
// a scrollable attributes list; tiles that need a richer view pass children.
export const EntityDetailModal: FC<EntityDetailModalProps> = ({ entityId, title, pill, onClose, children }) => {
  const entity = useEntity(entityId);

  return (
    <TileModal title={title} subtitle={entityId} pill={pill} onClose={onClose} size="lg">
      <div className="entity-detail">
        {children ?? (
          <>
            <div className="entity-detail__chart">
              <PlotTile entityId={entityId} points={60} timeRange="60m" />
            </div>
            {entity && (
              <div className="entity-detail__attrs">
                <div className="entity-detail__attrs-head">ATTRIBUTES</div>
                <div className="entity-detail__attrs-body">
                  <div className="entity-detail__attr">
                    <span className="entity-detail__attr-key">state</span>
                    <span className="entity-detail__attr-val">{entity.state}</span>
                  </div>
                  {Object.entries(entity.attributes).map(([k, v]) => (
                    <div key={k} className="entity-detail__attr">
                      <span className="entity-detail__attr-key">{k}</span>
                      <span className="entity-detail__attr-val">
                        {typeof v === 'object' && v !== null
                          ? JSON.stringify(v)
                          : v == null ? '' : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TileModal>
  );
};
