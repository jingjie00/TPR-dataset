import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Badge from './Badge';
import SpiderChart from './SpiderChart';
import { DatasetTheoryBlock, DatasetProvenanceBlock } from './DatasetTheoryProvenance';
import { doiUrl, dqiTier, datasetLabel } from '../utils';

export default function DatasetDetailDialog({ dataset, dimensions, onClose }) {
  const dialogRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!dataset) return undefined;

    setClosing(false);
    setVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') requestClose();
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dataset?.id]);

  useEffect(() => {
    if (dataset && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [dataset, visible]);

  function requestClose() {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    window.setTimeout(onClose, 280);
  }

  if (!dataset) return null;

  const hasFacts = dataset.access_status || dataset.size_label || dataset.usage_count != null;
  const label = datasetLabel(dataset);

  return createPortal(
    <div
      className={`dataset-dialog-backdrop${visible ? ' is-open' : ''}${closing ? ' is-closing' : ''}`}
      onClick={requestClose}
      aria-hidden={!visible}
    >
      <div
        ref={dialogRef}
        className="dataset-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataset-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dataset-dialog__header">
          <div className="dataset-dialog__header-top">
            <div className="dataset-dialog__heading">
              <p className="dataset-dialog__eyebrow">{dataset.asset_type}</p>
              <h2 id="dataset-dialog-title" className="dataset-dialog__title">
                <span className="dataset-dialog__title-text">{label}</span>
                <span className="dataset-dialog__title-badges" aria-label="Dataset tags">
                  {dataset.badges.map((b) => (
                    <Badge key={b} label={b} />
                  ))}
                </span>
              </h2>
              {label !== dataset.name && (
                <p className="dataset-dialog__full-name">{dataset.name}</p>
              )}
            </div>
            <div className="dataset-dialog__header-actions">
              <div className={`dqi-pill ${dqiTier(dataset.dqi_100)} dataset-dialog__dqi`}>
                <span className="dqi-value">{dataset.dqi_100}</span>
                <span className="dqi-label">DQI</span>
              </div>
              <button
                type="button"
                className="dataset-dialog__close"
                onClick={requestClose}
                aria-label="Close dataset details"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="dataset-dialog__body">
          <aside className="dataset-dialog__chart-col" aria-label="Quality profile">
            <SpiderChart
              scores={dataset.scores}
              dimensions={dimensions}
              size={268}
              showLabels
              useFullLabels
              showValueLabels
              interactive
              highlighted
              className="dataset-dialog__spider"
            />

            {dataset.citations?.length > 0 && (
              <div className="dataset-dialog__chart-sources">
                <span className="dataset-dialog__sources-label">Sources</span>
                <ul className="dataset-dialog__source-list">
                  {dataset.citations.map((c) => (
                    <li key={c.key}>
                      <a href={doiUrl(c.doi)} target="_blank" rel="noopener noreferrer">
                        <code>{c.key}</code>
                        <span>doi:{c.doi}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="dataset-dialog__main-col">
            {hasFacts && (
              <ul className="dataset-dialog__facts" aria-label="Dataset facts">
                {dataset.access_status && (
                  <li>
                    <span className="dataset-dialog__facts-label">Access</span>
                    <span
                      className={`access-tag access-tag--${dataset.access_status.replace(/[/]/g, '-')}`}
                    >
                      {dataset.access_status}
                    </span>
                  </li>
                )}
                {dataset.size_label && (
                  <li>
                    <span className="dataset-dialog__facts-label">Scale</span>
                    <span>{dataset.size_label}</span>
                  </li>
                )}
                {dataset.usage_count != null && (
                  <li>
                    <span className="dataset-dialog__facts-label">Literature</span>
                    <span>{dataset.usage_count} studies</span>
                  </li>
                )}
              </ul>
            )}

            <div className="dataset-dialog__panel">
              <DatasetTheoryBlock dataset={dataset} />
              <DatasetProvenanceBlock dataset={dataset} showProvenanceLabels={false} />
            </div>

            <div className="dataset-dialog__narrative">
              <p>
                <strong>Recommended applications.</strong> {dataset.suggested_use}
              </p>
              <p>{dataset.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
