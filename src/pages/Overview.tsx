import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  noCompactor,
  type Layout,
} from 'react-grid-layout';
import {
  useLayout, Inspector, Palette, EditModeBanner, TabBar, AlarmChips, AlarmsConfig,
  TILE_BY_TYPE,
} from '../edit';

const BREAKPOINTS = { lg: 1024, md: 768, sm: 480, xs: 0 };
const COLS = { lg: 12, md: 8, sm: 6, xs: 4 };

export const Overview: FC = () => {
  const { activeTab, isEditing, selectedTileId, selectTile, removeTile, duplicateTile, updateTile } = useLayout();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [alarmsConfigOpen, setAlarmsConfigOpen] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const items = activeTab.items;

  const rglLayout = useMemo<Layout>(
    () => items.map((it) => ({ i: it.id, x: it.x, y: it.y, w: it.w, h: it.h })),
    [items],
  );

  const handleLayoutChange = (next: Layout) => {
    const idToNext = new Map(next.map((n) => [n.i, n] as const));
    for (const it of items) {
      const n = idToNext.get(it.id);
      if (!n) continue;
      if (it.x !== n.x || it.y !== n.y || it.w !== n.w || it.h !== n.h) {
        updateTile(it.id, { x: n.x, y: n.y, w: n.w, h: n.h });
      }
    }
  };

  const selected = selectedTileId ? items.find((i) => i.id === selectedTileId) ?? null : null;

  return (
    <div className={`overview${isEditing ? ' overview--editing' : ''}`}>
      <TabBar />
      <AlarmChips entityIds={activeTab.alarmEntities ?? []} />
      <EditModeBanner
        onAddTile={() => setPaletteOpen(true)}
        onConfigureAlarms={() => setAlarmsConfigOpen(true)}
      />
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <AlarmsConfig open={alarmsConfigOpen} onClose={() => setAlarmsConfigOpen(false)} />

      <div ref={containerRef} className="overview-grid-container">
        {mounted && (
          <ResponsiveGridLayout
            className="overview-grid"
            width={width}
            layouts={{ lg: rglLayout, md: rglLayout, sm: rglLayout, xs: rglLayout }}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={20}
            margin={[8, 8]}
            containerPadding={[0, 0]}
            compactor={noCompactor}
            dragConfig={{ enabled: isEditing, handle: '.editable-tile__handle', threshold: 3 }}
            resizeConfig={{ enabled: isEditing, handles: ['se'] }}
            onLayoutChange={handleLayoutChange}
          >
            {items.map((item) => {
              const meta = TILE_BY_TYPE[item.type];
              const isSelected = selectedTileId === item.id;
              const wrapperClass = [
                'editable-tile',
                isEditing ? 'editable-tile--editing' : '',
                isSelected ? 'editable-tile--selected' : '',
              ].filter(Boolean).join(' ');
              return (
                <div key={item.id} className={wrapperClass}>
                  {meta ? meta.render(item.props) : <div className="editable-tile--missing">Unknown: {item.type}</div>}
                  {isEditing && (
                    <div className="editable-tile__overlay" onClick={(e) => { e.stopPropagation(); selectTile(item.id); }}>
                      <div className="editable-tile__handle" aria-label="drag" onClick={(e) => e.stopPropagation()} title="Drag to move">
                        ⋮⋮
                      </div>
                      {meta && <div className="editable-tile__type">{meta.name}</div>}
                      <button
                        type="button"
                        className="editable-tile__action"
                        onClick={(e) => { e.stopPropagation(); duplicateTile(item.id); }}
                        aria-label="duplicate"
                        title="Duplicate tile"
                      >
                        ⎘
                      </button>
                      <button
                        type="button"
                        className="editable-tile__delete"
                        onClick={(e) => { e.stopPropagation(); removeTile(item.id); }}
                        aria-label="delete"
                        title="Delete tile"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </ResponsiveGridLayout>
        )}
      </div>

      {isEditing && selected && <Inspector item={selected} />}
    </div>
  );
};
