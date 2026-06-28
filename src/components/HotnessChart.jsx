import { useState } from 'react';
import DatasetTheoryProvenance from './DatasetTheoryProvenance';
import { datasetLabel } from '../utils';

function chartLabel(dataset) {
  return datasetLabel(dataset);
}

function accessClass(status) {
  return `access-tag access-tag--${status.replace(/\//g, '-')}`;
}

const ACCESS_COLORS = {
  public: '#059669',
  'request/terms': '#d97706',
  'study-dependent': '#ea580c',
  'restricted/deprecated': '#dc2626',
  unavailable: '#94a3b8',
};

function bubbleRadius(rowsOrUsers, allTotals) {
  const log = (v) => Math.log10(Math.max(v, 1));
  const logs = allTotals.map(log);
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  const t = hi === lo ? 0.5 : (log(rowsOrUsers) - lo) / (hi - lo);
  const minR = 7;
  const maxR = 34;
  return minR + t * (maxR - minR);
}

function HotnessDetailPanel({ dataset }) {
  if (!dataset) {
    return (
      <aside className="hotness-detail-panel hotness-detail-panel--idle" aria-live="polite">
        <header className="hotness-detail-header">
          <h3 className="hotness-detail-title hotness-detail-title--placeholder">
            Dataset details
          </h3>
          <span className="hotness-detail-type">Hover a bubble</span>
        </header>

        <dl className="hotness-detail-stats">
          <div>
            <dt>DQI</dt>
            <dd className="hotness-detail-value--placeholder">—</dd>
          </div>
          <div>
            <dt>Literature usage</dt>
            <dd className="hotness-detail-value--placeholder">— studies</dd>
          </div>
          <div>
            <dt>Scale</dt>
            <dd className="hotness-detail-value--placeholder">—</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>
              <span className="hotness-detail-access-pill hotness-detail-value--placeholder">
                —
              </span>
            </dd>
          </div>
        </dl>

        <div className="hotness-detail-row">
          <span className="hotness-detail-label">Frameworks</span>
          <div className="hotness-detail-tags">
            <span className="hotness-detail-tag hotness-detail-tag--placeholder">—</span>
          </div>
        </div>

        <div className="hotness-detail-guide">
          <p className="hotness-detail-label">How to read this chart</p>
          <ul className="hotness-detail-guide-list">
            <li>
              <strong>Horizontal position</strong> — Dataset Quality Index (DQI, 0–100).
            </li>
            <li>
              <strong>Vertical position</strong> — Literature usage count in this evidence base
              (not global citations).
            </li>
            <li>
              <strong>Bubble size</strong> — Reported corpus scale (users, rows, or comments).
            </li>
            <li>
              <strong>Color</strong> — Access status (public through unavailable).
            </li>
          </ul>
        </div>

        <p className="hotness-detail-note hotness-detail-note--idle">
          Hover or tab a bubble to load theory, provenance, suggested use, and scoring notes
          for that corpus. Names with * include an enhanced personality-stratified
          split/evaluation protocol from prior work.
        </p>
      </aside>
    );
  }

  return (
    <aside className="hotness-detail-panel" aria-live="polite">
      <header className="hotness-detail-header">
        <h3 className="hotness-detail-title">{datasetLabel(dataset)}</h3>
        <span className="hotness-detail-type">{dataset.asset_type}</span>
      </header>

      <dl className="hotness-detail-stats">
        <div>
          <dt>DQI</dt>
          <dd className="hotness-detail-dqi">{dataset.dqi_100}</dd>
        </div>
        <div>
          <dt>Literature usage</dt>
          <dd>{dataset.usage_count} studies</dd>
        </div>
        <div>
          <dt>Scale</dt>
          <dd>{dataset.size_label}</dd>
        </div>
        <div>
          <dt>Access</dt>
          <dd>
            <span className={accessClass(dataset.access_status)}>{dataset.access_status}</span>
          </dd>
        </div>
      </dl>

      {dataset.frameworks?.length > 0 && !dataset.theory && (
        <div className="hotness-detail-row">
          <span className="hotness-detail-label">Frameworks</span>
          <div className="hotness-detail-tags">
            {dataset.frameworks.map((f) => (
              <span key={f} className="hotness-detail-tag">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <DatasetTheoryProvenance dataset={dataset} compact />

      {dataset.suggested_use && (
        <p className="hotness-detail-note">
          <strong>Suggested use.</strong> {dataset.suggested_use}
        </p>
      )}

      {dataset.note && <p className="hotness-detail-note">{dataset.note}</p>}

      {(dataset.enhanced_protocol || dataset.name.endsWith('*')) && (
        <p className="hotness-detail-enhanced">
          * Includes an enhanced personality-stratified split/evaluation protocol from prior work.
        </p>
      )}
    </aside>
  );
}

export default function HotnessChart({ datasets }) {
  const withHotness = datasets.filter((d) => d.usage_count != null);
  const [hoveredId, setHoveredId] = useState(null);

  if (withHotness.length === 0) return null;

  const hovered = withHotness.find((d) => d.id === hoveredId) ?? null;
  const scaleTotals = withHotness.map((d) => d.total_rows_or_users ?? 1000);

  const width = 560;
  const height = 360;
  const pad = { top: 24, right: 24, bottom: 48, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxUsage = Math.max(...withHotness.map((d) => d.usage_count), 1);
  const minDqi = 40;
  const maxDqi = 85;

  const x = (dqi) => pad.left + ((dqi - minDqi) / (maxDqi - minDqi)) * plotW;
  const y = (usage) => pad.top + plotH - (usage / (maxUsage + 0.5)) * plotH;

  const dqiTicks = [50, 55, 60, 65, 70, 75, 80];
  const usageTicks = Array.from({ length: maxUsage + 1 }, (_, i) => i).filter(
    (n) => n === 0 || n === maxUsage || n % 2 === 0,
  );

  function activate(id) {
    setHoveredId(id);
  }

  function deactivate(id) {
    setHoveredId((current) => (current === id ? null : current));
  }

  return (
    <div className="hotness-chart-wrap">
      <div className="hotness-interactive">
        <div className="hotness-chart-stage">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="hotness-chart"
            role="application"
            aria-label="Dataset literature usage count versus DQI scatter plot. Hover or tab to a bubble for details."
          >
            {dqiTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  y1={pad.top}
                  x2={x(tick)}
                  y2={height - pad.bottom}
                  stroke="var(--slate-100)"
                  strokeWidth={1}
                />
                <text
                  x={x(tick)}
                  y={height - pad.bottom + 16}
                  textAnchor="middle"
                  className="hotness-tick"
                >
                  {tick}
                </text>
              </g>
            ))}

            {usageTicks.map((tick) => (
              <g key={`u-${tick}`}>
                <line
                  x1={pad.left}
                  y1={y(tick)}
                  x2={width - pad.right}
                  y2={y(tick)}
                  stroke="var(--slate-100)"
                  strokeWidth={1}
                  opacity={tick === 0 ? 1 : 0.6}
                />
                <text
                  x={pad.left - 8}
                  y={y(tick) + 4}
                  textAnchor="end"
                  className="hotness-tick"
                >
                  {tick}
                </text>
              </g>
            ))}

            <line
              x1={pad.left}
              y1={pad.top}
              x2={pad.left}
              y2={height - pad.bottom}
              stroke="var(--slate-200)"
            />
            <line
              x1={pad.left}
              y1={height - pad.bottom}
              x2={width - pad.right}
              y2={height - pad.bottom}
              stroke="var(--slate-200)"
            />

            <text
              x={(pad.left + width - pad.right) / 2}
              y={height - 8}
              textAnchor="middle"
              className="hotness-axis-label"
            >
              DQI
            </text>
            <text
              x={14}
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90, 14, ${height / 2})`}
              className="hotness-axis-label"
            >
              Literature usage count
            </text>

            {withHotness.map((d) => {
              const cx = x(d.dqi_100);
              const cy = y(d.usage_count);
              const r = bubbleRadius(d.total_rows_or_users ?? 1000, scaleTotals);
              const fill = ACCESS_COLORS[d.access_status] ?? '#64748b';
              const label = chartLabel(d);
              const fontSize = label.length > 10 ? 7 : label.length > 7 ? 8 : 9;
              const isActive = hoveredId === d.id;
              const isDimmed = hoveredId != null && !isActive;

              return (
                <g
                  key={d.id}
                  className={`hotness-bubble-group${isActive ? ' hotness-bubble-group--active' : ''}${isDimmed ? ' hotness-bubble-group--dim' : ''}`}
                  onMouseEnter={() => activate(d.id)}
                  onMouseLeave={() => deactivate(d.id)}
                  onFocus={() => activate(d.id)}
                  onBlur={() => deactivate(d.id)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 6}
                    fill="transparent"
                    className="hotness-bubble-hit"
                    tabIndex={0}
                    role="button"
                    aria-label={`${datasetLabel(d)}, DQI ${d.dqi_100}, ${d.usage_count} studies`}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={fill}
                    fillOpacity={isActive ? 0.42 : 0.28}
                    stroke={fill}
                    strokeWidth={isActive ? 3 : 2}
                    className="hotness-bubble-visual"
                    pointerEvents="none"
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="hotness-bubble-label"
                    fontSize={fontSize}
                    fill="#1e293b"
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <HotnessDetailPanel dataset={hovered} />
      </div>

      <ul className="hotness-legend">
        {Object.entries(ACCESS_COLORS).map(([status, color]) => (
          <li key={status}>
            <span className="hotness-legend-swatch" style={{ background: color }} />
            {status}
          </li>
        ))}
      </ul>
      <p className="hotness-footnote">
        * Enhanced personality-stratified split/evaluation protocol from prior work.
      </p>
    </div>
  );
}
