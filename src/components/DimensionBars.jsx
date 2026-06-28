import { getDimensionColor } from '../utils';

export default function DimensionBars({ scores, dimensions }) {
  return (
    <div className="dim-bars" role="img" aria-label="Dimension score breakdown">
      {dimensions.map((dim) => {
        const value = scores[dim.key];
        const pct = (value / 5) * 100;
        const { main } = getDimensionColor(dim.key);
        return (
          <div key={dim.key} className="dim-bar-row" title={`${dim.label}: ${value}/5`}>
            <span className="dim-bar-label" style={{ color: main }}>
              <span className="dim-bar-swatch" style={{ background: main }} />
              {dim.short}{dim.starred ? '*' : ''}
            </span>
            <div className="dim-bar-track">
              <div
                className="dim-bar-fill"
                style={{ width: `${pct}%`, background: main }}
              />
            </div>
            <span className="dim-bar-value" style={{ color: main }}>{value.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}
