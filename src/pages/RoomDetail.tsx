import { useMemo, type FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHass } from '../hass';

// Room deep-dive page v1: lists every entity tagged with the matching area
// (HA's `area_id` lives on the registry; for now we surface anything where
// the room slug appears in `friendly_name` as a best-effort fallback). Real
// room awareness lands once Realm wires the HA entity/device registry.
export const RoomDetail: FC = () => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const store = useHass();
  const slug = roomId.toLowerCase().replace(/-/g, ' ');

  const entities = useMemo(() => {
    const all = store.getAllEntities();
    return Object.keys(all)
      .filter((id) => {
        const friendly = String(all[id]?.attributes?.friendly_name ?? '').toLowerCase();
        return id.toLowerCase().includes(roomId.toLowerCase()) || friendly.includes(slug);
      })
      .sort();
  }, [store, roomId, slug]);

  return (
    <div className="entity-detail-page">
      <Link to="/" className="entity-detail-page__back">← Back to overview</Link>
      <div className="entity-detail-page__head">
        <div className="entity-detail-page__title">{slug.replace(/\b\w/g, (c) => c.toUpperCase())}</div>
        <div className="entity-detail-page__id">room/{roomId}</div>
      </div>

      {entities.length === 0 ? (
        <div className="entity-detail-page__empty">
          No entities match this room name. Room awareness uses the entity_id and friendly_name today; full area/device registry integration is on the roadmap.
        </div>
      ) : (
        <div className="entity-detail-page__attrs">
          <div className="entity-detail-page__attrs-head">{entities.length} ENTITIES</div>
          <div className="entity-detail-page__attrs-body">
            {entities.map((id) => {
              const e = store.getEntity(id);
              return (
                <Link key={id} to={`/entity/${id}`} className="entity-detail-page__attr entity-detail-page__attr--link">
                  <span className="entity-detail-page__attr-key">{id}</span>
                  <span className="entity-detail-page__attr-val">{e?.state ?? ''}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
