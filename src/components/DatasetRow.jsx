import Badge from './Badge';
import SpiderChart from './SpiderChart';
import { dqiTier, datasetLabel } from '../utils';

export default function DatasetRow({
  dataset,
  rank,
  dimensions,
  isExpanded,
  onToggle,
}) {
  return (
    <tr
      className={`dataset-row${isExpanded ? ' expanded' : ''}`}
      onClick={onToggle}
    >
      <td className="col-rank">
        <span className={`rank-badge rank-${rank <= 3 ? rank : 'other'}`}>{rank}</span>
      </td>
      <td className="col-name">
        <div className="dataset-name">{datasetLabel(dataset)}</div>
        <div className="dataset-meta">{dataset.asset_type}</div>
      </td>
      <td className="col-dqi">
        <div className={`dqi-pill ${dqiTier(dataset.dqi_100)}`}>
          <span className="dqi-value">{dataset.dqi_100}</span>
          <span className="dqi-label">DQI</span>
        </div>
      </td>
      <td className="col-spider">
        <SpiderChart
          scores={dataset.scores}
          dimensions={dimensions}
          size={112}
          highlighted={isExpanded}
        />
      </td>
      <td className="col-badges">
        <div className="badge-group">
          {dataset.badges.map((b) => (
            <Badge key={b} label={b} />
          ))}
        </div>
      </td>
      <td className="col-expand">
        <button
          type="button"
          className={`expand-btn${isExpanded ? ' active' : ''}`}
          aria-expanded={isExpanded}
          aria-haspopup="dialog"
          aria-label={isExpanded ? 'Close details' : 'Open details'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
