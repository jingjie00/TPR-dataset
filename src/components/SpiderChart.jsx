import { useEffect, useMemo, useState } from 'react';
import { getDimensionColor, datasetLabel } from '../utils';

const GRID_LEVELS = [1, 2, 3, 4, 5];

const DATASET_COMPARE_COLORS = [
  { fill: 'rgba(30, 58, 95, 0.16)', stroke: '#1e3a5f' },
  { fill: 'rgba(37, 99, 235, 0.14)', stroke: '#2563eb' },
  { fill: 'rgba(5, 150, 105, 0.14)', stroke: '#059669' },
  { fill: 'rgba(217, 119, 6, 0.14)', stroke: '#d97706' },
  { fill: 'rgba(219, 39, 119, 0.14)', stroke: '#db2777' },
  { fill: 'rgba(124, 58, 237, 0.14)', stroke: '#7c3aed' },
  { fill: 'rgba(13, 148, 136, 0.14)', stroke: '#0d9488' },
  { fill: 'rgba(220, 38, 38, 0.14)', stroke: '#dc2626' },
  { fill: 'rgba(79, 70, 229, 0.14)', stroke: '#4f46e5' },
  { fill: 'rgba(202, 138, 4, 0.14)', stroke: '#ca8a04' },
];

function datasetCompareColor(index) {
  return DATASET_COMPARE_COLORS[index % DATASET_COMPARE_COLORS.length];
}

const COMPARE_AXIS_STROKE = 'var(--slate-300)';
const COMPARE_LABEL_FILL = 'var(--slate-600)';

function polarPoint(cx, cy, radius, angleIndex, total, maxRadius) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  const r = (radius / 5) * maxRadius;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
    angle,
  };
}

function getVertices(scores, dimensions, cx, cy, maxRadius) {
  return dimensions.map((dim, i) => {
    const value = scores[dim.key] ?? 0;
    const pt = polarPoint(cx, cy, value, i, dimensions.length, maxRadius);
    return { ...pt, dim, value };
  });
}

function polygonPoints(scores, dimensions, cx, cy, maxRadius) {
  return getVertices(scores, dimensions, cx, cy, maxRadius)
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
}

function spiderLabelLines(text) {
  if (text.length <= 16) return [text];
  const breakAt = text.includes('&')
    ? text.indexOf('&')
    : text.indexOf(' ', Math.floor(text.length / 2));
  if (breakAt > 0 && breakAt < text.length - 1) {
    return [text.slice(0, breakAt).trim(), text.slice(breakAt).trim()];
  }
  return [text];
}

function offsetFromCenter(x, y, cx, cy, distance) {
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy) || 1;
  return { x: x + (dx / len) * distance, y: y + (dy / len) * distance };
}

export default function SpiderChart({
  scores,
  dimensions,
  size = 132,
  showLabels = false,
  useFullLabels = false,
  showValueLabels = false,
  interactive = false,
  className = '',
  highlighted = false,
}) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const bleed = useFullLabels ? 28 : 0;
  const viewSize = size + bleed * 2;
  const cx = size / 2 + bleed;
  const cy = size / 2 + bleed;
  const padding = showLabels ? (useFullLabels ? 62 : 38) : 10;
  const maxRadius = size / 2 - padding;
  const n = dimensions.length;
  const vertices = getVertices(scores, dimensions, cx, cy, maxRadius);
  const labelRadius = useFullLabels ? 6.1 : 5.85;
  const hoveredDim = hoveredKey ? dimensions.find((d) => d.key === hoveredKey) : null;
  const hoveredValue = hoveredKey != null ? scores[hoveredKey] ?? 0 : null;

  function wedgeOpacity(dimKey) {
    if (!interactive || !hoveredKey) return 1;
    return hoveredKey === dimKey ? 1 : 0.22;
  }

  function axisOpacity(dimKey) {
    if (!interactive || !hoveredKey) return 0.35;
    return hoveredKey === dimKey ? 0.85 : 0.15;
  }

  return (
    <div className={`spider-chart-wrap${interactive ? ' spider-chart-wrap--interactive' : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className={`spider-chart${highlighted ? ' spider-chart--highlighted' : ''}${interactive ? ' spider-chart--interactive' : ''} ${className}`}
        role={interactive ? 'application' : 'img'}
        aria-label="DQI dimension radar chart"
        overflow="visible"
        onMouseLeave={() => interactive && setHoveredKey(null)}
      >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={dimensions
            .map((_, i) => {
              const { x, y } = polarPoint(cx, cy, level, i, n, maxRadius);
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="var(--slate-200)"
          strokeWidth={level === 5 ? 1.2 : 0.8}
          opacity={level === 5 ? 1 : 0.65}
        />
      ))}

      {dimensions.map((dim, i) => {
        const { x, y } = polarPoint(cx, cy, 5, i, n, maxRadius);
        const { main } = getDimensionColor(dim.key);
        return (
          <line
            key={dim.key}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={main}
            strokeWidth={interactive && hoveredKey === dim.key ? 2.2 : showLabels ? 1.2 : 1}
            opacity={axisOpacity(dim.key)}
            className={interactive ? 'spider-axis' : undefined}
            style={interactive ? { transition: 'opacity 0.15s ease, stroke-width 0.15s ease' } : undefined}
            pointerEvents="none"
          />
        );
      })}

      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % vertices.length];
        const { fill } = getDimensionColor(v.dim.key);
        return (
          <path
            key={`wedge-${v.dim.key}`}
            d={`M ${cx} ${cy} L ${v.x} ${v.y} L ${next.x} ${next.y} Z`}
            fill={fill}
            stroke="none"
            opacity={wedgeOpacity(v.dim.key)}
            className={interactive ? 'spider-wedge' : undefined}
            style={interactive ? { cursor: 'pointer', transition: 'opacity 0.15s ease' } : undefined}
            onMouseEnter={interactive ? () => setHoveredKey(v.dim.key) : undefined}
            onFocus={interactive ? () => setHoveredKey(v.dim.key) : undefined}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `${v.dim.label}: ${v.value} out of 5` : undefined}
          />
        );
      })}

      <polygon
        points={polygonPoints(scores, dimensions, cx, cy, maxRadius)}
        fill="none"
        stroke={highlighted ? '#1e3a5f' : 'rgba(30, 58, 95, 0.45)'}
        strokeWidth={showLabels ? 2 : 1.5}
        strokeLinejoin="round"
        opacity={interactive && hoveredKey ? 0.35 : 1}
        pointerEvents="none"
        style={interactive ? { transition: 'opacity 0.15s ease' } : undefined}
      />

      {vertices.map((v) => {
        const { main } = getDimensionColor(v.dim.key);
        const isActive = !hoveredKey || hoveredKey === v.dim.key;
        return (
          <circle
            key={`dot-${v.dim.key}`}
            cx={v.x}
            cy={v.y}
            r={interactive && hoveredKey === v.dim.key ? 5.5 : showLabels ? 4 : 3}
            fill={main}
            stroke="#fff"
            strokeWidth={interactive && hoveredKey === v.dim.key ? 2 : 1.5}
            opacity={interactive && hoveredKey && !isActive ? 0.35 : 1}
            style={interactive ? { cursor: 'pointer', transition: 'r 0.15s ease, opacity 0.15s ease' } : undefined}
            onMouseEnter={interactive ? () => setHoveredKey(v.dim.key) : undefined}
            pointerEvents={interactive ? 'all' : 'none'}
          >
            <title>{`${v.dim.label}: ${v.value}/5`}</title>
          </circle>
        );
      })}

      {showValueLabels &&
        vertices.map((v) => {
          const { main } = getDimensionColor(v.dim.key);
          const isActive = !hoveredKey || hoveredKey === v.dim.key;
          const label = v.value.toFixed(1);
          const boxW = interactive && hoveredKey === v.dim.key ? 34 : 30;
          const boxH = interactive && hoveredKey === v.dim.key ? 18 : 16;
          const anchor = offsetFromCenter(v.x, v.y, cx, cy, -14);
          return (
            <g
              key={`val-${v.dim.key}`}
              className="spider-value-label"
              opacity={interactive && hoveredKey && !isActive ? 0.3 : 1}
              style={interactive ? { transition: 'opacity 0.15s ease' } : undefined}
              pointerEvents="none"
            >
              <rect
                x={anchor.x - boxW / 2}
                y={anchor.y - boxH / 2}
                width={boxW}
                height={boxH}
                rx={4}
                fill="#fff"
                stroke={main}
                strokeWidth={1.2}
              />
              <text
                x={anchor.x}
                y={anchor.y + 4}
                textAnchor="middle"
                fontSize={9}
                fontWeight="700"
                fill={main}
              >
                {label}
              </text>
            </g>
          );
        })}

      {showLabels &&
        dimensions.map((dim, i) => {
          const { x, y, angle } = polarPoint(cx, cy, labelRadius, i, n, maxRadius);
          const deg = (angle * 180) / Math.PI;
          const anchor =
            deg > -80 && deg < 80 ? 'start' : deg > 100 || deg < -100 ? 'end' : 'middle';
          const { main } = getDimensionColor(dim.key);
          const isActive = !hoveredKey || hoveredKey === dim.key;
          const axisText = useFullLabels
            ? `${dim.label}${dim.starred ? '*' : ''}`
            : `${dim.short}${dim.starred ? '*' : ''}`;
          const lines = useFullLabels ? spiderLabelLines(axisText) : [axisText];
          return (
            <text
              key={dim.key}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={`spider-label${useFullLabels ? ' spider-label--full' : ''}${interactive && hoveredKey === dim.key ? ' spider-label--active' : ''}`}
              fill={main}
              stroke={useFullLabels ? '#fff' : 'none'}
              strokeWidth={useFullLabels ? 2.5 : 0}
              paintOrder={useFullLabels ? 'stroke fill' : 'normal'}
              opacity={interactive && hoveredKey && !isActive ? 0.4 : 1}
              fontWeight={interactive && hoveredKey === dim.key ? 800 : 600}
              style={interactive ? { cursor: 'pointer', transition: 'opacity 0.15s ease' } : undefined}
              onMouseEnter={interactive ? () => setHoveredKey(dim.key) : undefined}
            >
              {lines.map((line, li) => (
                <tspan key={line} x={x} dy={li === 0 ? 0 : '1.1em'}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

      {interactive && hoveredDim && (
        <g className="spider-detail-hover-center" aria-hidden="true">
          <circle cx={cx} cy={cy} r={34} fill="#fff" fillOpacity={0.94} stroke="var(--slate-200)" strokeWidth={1} />
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            className="spider-detail-hover-score"
            fill={getDimensionColor(hoveredDim.key).main}
          >
            {hoveredValue.toFixed(1)}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="spider-detail-hover-dim" fill="var(--slate-600)">
            / 5
          </text>
        </g>
      )}
    </svg>

      {interactive && (
        <p className="spider-chart-hint" aria-live="polite">
          {hoveredDim ? (
            <>
              <strong>{hoveredDim.label}</strong>
              <span className="spider-chart-hint__score">{hoveredValue.toFixed(1)}/5</span>
              <span className="spider-chart-hint__desc">{hoveredDim.description}</span>
            </>
          ) : (
            'Hover a wedge, label, or vertex to explore dimension scores.'
          )}
        </p>
      )}
    </div>
  );
}


export function SpiderCompareChart({ datasets, dimensions, size = 520 }) {
  const defaultOrder = useMemo(() => datasets.map((d) => d.id), [datasets]);
  const [orderedIds, setOrderedIds] = useState(defaultOrder);
  const [visibleIds, setVisibleIds] = useState(() => new Set(datasets.map((d) => d.id)));
  const [hoveredId, setHoveredId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    setOrderedIds(defaultOrder);
  }, [defaultOrder]);

  const datasetById = useMemo(
    () => Object.fromEntries(datasets.map((d) => [d.id, d])),
    [datasets],
  );
  const colorIndexById = useMemo(
    () => Object.fromEntries(defaultOrder.map((id, i) => [id, i])),
    [defaultOrder],
  );
  const orderedDatasets = orderedIds.map((id) => datasetById[id]).filter(Boolean);
  const orderIsDefault = orderedIds.every((id, i) => id === defaultOrder[i]);

  const bleed = 56;
  const viewSize = size + bleed * 2;
  const cx = size / 2 + bleed;
  const cy = size / 2 + bleed;
  const padding = 88;
  const maxRadius = size / 2 - padding;
  const n = dimensions.length;
  const axisLabelRadius = 6.45;

  const hovered = datasetById[hoveredId] ?? null;

  function toggleDataset(id) {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
        setHoveredId((current) => (current === id ? null : current));
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function reorderByDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const from = next.indexOf(dragId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      return next;
    });
    setDragId(null);
    setDragOverId(null);
  }

  function resetOrder() {
    setOrderedIds([...defaultOrder]);
    setDragId(null);
    setDragOverId(null);
  }

  function axisLabelText(dim) {
    return `${dim.label}${dim.starred ? '*' : ''}`;
  }

  return (
    <div className="spider-compare-wrap" onMouseLeave={() => setHoveredId(null)}>
      <aside className="spider-dataset-panel" aria-label="Dataset visibility">
        <div className="spider-panel-toolbar">
          <p className="spider-legend-heading">Show datasets</p>
          <button
            type="button"
            className="spider-order-reset"
            onClick={resetOrder}
            disabled={orderIsDefault}
            title="Restore leaderboard order (highest DQI first)"
          >
            Sort by DQI
          </button>
        </div>
        <ul className="spider-dataset-toggles">
          {orderedDatasets.map((ds, i) => {
            const colorIndex = colorIndexById[ds.id] ?? i;
            const colors = datasetCompareColor(colorIndex);
            const checked = visibleIds.has(ds.id);
            return (
              <li
                key={ds.id}
                className={`spider-dataset-item${dragOverId === ds.id ? ' spider-dataset-item--over' : ''}${dragId === ds.id ? ' spider-dataset-item--dragging' : ''}`}
                draggable
                onDragStart={(e) => {
                  if (e.target instanceof HTMLInputElement) {
                    e.preventDefault();
                    return;
                  }
                  setDragId(ds.id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', ds.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOverId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragId && dragId !== ds.id) setDragOverId(ds.id);
                }}
                onDragLeave={() => {
                  if (dragOverId === ds.id) setDragOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  reorderByDrop(ds.id);
                }}
              >
                <span className="spider-drag-grip" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="5" cy="4" r="1.2" />
                    <circle cx="11" cy="4" r="1.2" />
                    <circle cx="5" cy="8" r="1.2" />
                    <circle cx="11" cy="8" r="1.2" />
                    <circle cx="5" cy="12" r="1.2" />
                    <circle cx="11" cy="12" r="1.2" />
                  </svg>
                </span>
                <label
                  className={`spider-dataset-toggle${hoveredId === ds.id ? ' spider-dataset-toggle--active' : ''}${!checked ? ' spider-dataset-toggle--off' : ''}`}
                  onMouseEnter={() => setHoveredId(ds.id)}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDataset(ds.id)}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    aria-label={`Show ${datasetLabel(ds)} on comparison chart`}
                  />
                  <span
                    className="spider-legend-swatch"
                    style={{ background: colors.stroke }}
                  />
                  <span className="spider-legend-name">{datasetLabel(ds)}</span>
                  <span className="spider-legend-dqi">DQI {ds.dqi_100}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="spider-hover-hint">
          Drag rows to change draw order. Uncheck to hide a profile. Hover a name or polygon to
          read dimension scores. Colors stay fixed per dataset.
        </p>
      </aside>

      <div className="spider-compare-stage">
        <svg
          width="100%"
          height="auto"
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="spider-compare-chart"
          role="application"
          aria-label="Multi-dataset DQI comparison radar across all eight dimensions"
          overflow="visible"
        >
          {GRID_LEVELS.map((level) => (
            <polygon
              key={level}
              points={dimensions
                .map((_, i) => {
                  const { x, y } = polarPoint(cx, cy, level, i, n, maxRadius);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="var(--slate-200)"
              strokeWidth={level === 5 ? 1.2 : 0.8}
            />
          ))}

          {dimensions.map((dim, i) => {
            const { x, y } = polarPoint(cx, cy, 5, i, n, maxRadius);
            return (
              <line
                key={dim.key}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={COMPARE_AXIS_STROKE}
                strokeWidth={1.2}
              />
            );
          })}

          {orderedDatasets.map((ds) => {
            if (!visibleIds.has(ds.id)) return null;
            const colorIndex = colorIndexById[ds.id] ?? 0;
            const colors = datasetCompareColor(colorIndex);
            const isActive = !hoveredId || hoveredId === ds.id;
            return (
              <polygon
                key={ds.id}
                points={polygonPoints(ds.scores, dimensions, cx, cy, maxRadius)}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={hoveredId === ds.id ? 3 : 2}
                strokeLinejoin="round"
                opacity={isActive ? 1 : 0.16}
                className="spider-compare-polygon"
                onMouseEnter={() => setHoveredId(ds.id)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}

          {dimensions.map((dim, i) => {
            const { x, y, angle } = polarPoint(cx, cy, axisLabelRadius, i, n, maxRadius);
            const deg = (angle * 180) / Math.PI;
            const anchor =
              deg > -80 && deg < 80 ? 'start' : deg > 100 || deg < -100 ? 'end' : 'middle';
            const lines = spiderLabelLines(axisLabelText(dim));
            return (
              <text
                key={dim.key}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="spider-label spider-label--compare spider-label--full"
                fill={COMPARE_LABEL_FILL}
                fontWeight="600"
                stroke="#fff"
                strokeWidth={3}
                paintOrder="stroke fill"
              >
                {lines.map((line, li) => (
                  <tspan key={line} x={x} dy={li === 0 ? 0 : '1.15em'}>
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}

          {hovered && visibleIds.has(hovered.id) && (
            <g className="spider-vertex-scores" aria-live="polite">
              {getVertices(hovered.scores, dimensions, cx, cy, maxRadius).map((v) => {
                const colorIndex = colorIndexById[hovered.id] ?? 0;
                const color = datasetCompareColor(colorIndex).stroke;
                const label = v.value.toFixed(1);
                const boxW = label.length > 3 ? 34 : 28;
                const boxH = 18;
                const anchor = offsetFromCenter(v.x, v.y, cx, cy, -16);
                return (
                  <g key={v.dim.key} className="spider-vertex-score-group">
                    <circle
                      cx={v.x}
                      cy={v.y}
                      r={5}
                      fill={color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <rect
                      x={anchor.x - boxW / 2}
                      y={anchor.y - boxH / 2}
                      width={boxW}
                      height={boxH}
                      rx={5}
                      fill="#fff"
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <text
                      x={anchor.x}
                      y={anchor.y + 4}
                      textAnchor="middle"
                      className="spider-vertex-score"
                      fill={color}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {hovered && visibleIds.has(hovered.id) && (
            <g className="spider-hover-center">
              <circle cx={cx} cy={cy} r={26} fill="#fff" fillOpacity={0.92} />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="spider-hover-center-label"
              >
                {datasetLabel(hovered)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
