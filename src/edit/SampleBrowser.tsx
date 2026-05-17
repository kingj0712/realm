import { type FC } from 'react';
import { useLayout } from './LayoutContext';
import { SAMPLE_LAYOUTS, type SampleLayout } from './sampleLayouts';

interface SampleBrowserProps {
  open: boolean;
  onClose: () => void;
}

// Pick-a-template modal. Each click creates a new tab pre-populated with
// the sample's tiles and switches to it; the user can then customize.
export const SampleBrowser: FC<SampleBrowserProps> = ({ open, onClose }) => {
  const { addTabWithLayout } = useLayout();
  if (!open) return null;

  const onLoad = (sample: SampleLayout) => {
    addTabWithLayout(sample.name, sample.build());
    onClose();
  };

  return (
    <div className="tile-modal-backdrop" onClick={onClose}>
      <div className="tile-modal tile-modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="tile-modal__head">
          <div className="tile-modal__head-titles">
            <div className="tile-modal__title">TEMPLATES</div>
            <div className="tile-modal__subtitle">Load a starter layout as a new tab</div>
          </div>
          <button type="button" className="tile-modal__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div className="tile-modal__body">
          <p className="sample-browser__hint">
            Each template becomes a fresh tab you can rename, edit, or delete. Your existing tabs aren&apos;t touched.
          </p>
          <div className="sample-browser__grid">
            {SAMPLE_LAYOUTS.map((s) => (
              <button key={s.id} type="button" className="sample-browser__card" onClick={() => onLoad(s)}>
                <div className="sample-browser__name">{s.name}</div>
                <div className="sample-browser__desc">{s.description}</div>
                <div className="sample-browser__action">+ ADD AS NEW TAB</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
