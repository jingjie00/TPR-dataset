import { useMemo, useState } from 'react';
import leaderboardData from '../data/datasets.json';
import DatasetRow from '../components/DatasetRow';
import DatasetDetailDialog from '../components/DatasetDetailDialog';
import { SpiderCompareChart } from '../components/SpiderChart';
import HotnessChart from '../components/HotnessChart';
import { formatDate, getDimensionColor, datasetLabel } from '../utils';

const { datasets, dimensions, version } = leaderboardData;

export default function LeaderboardPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('dqi_100');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...datasets];

    if (filter !== 'all') {
      list = list.filter((d) => d.asset_type === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.short_name && d.short_name.toLowerCase().includes(q)) ||
          d.frameworks.some((f) => f.toLowerCase().includes(q)) ||
          d.badges.some((b) => b.toLowerCase().includes(q)),
      );
    }

    list.sort((a, b) => {
      const av = sortKey === 'name' ? datasetLabel(a) : a[sortKey];
      const bv = sortKey === 'name' ? datasetLabel(b) : b[sortKey];
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [search, filter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const avg = Math.round(datasets.reduce((s, d) => s + d.dqi_100, 0) / datasets.length);
    const original = datasets.filter((d) => d.asset_type === 'original dataset').length;
    return { count: datasets.length, avg, original };
  }, []);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  function sortIndicator(key) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  const expandedDataset = useMemo(
    () => datasets.find((d) => d.id === expandedId) ?? null,
    [expandedId],
  );

  function closeDetail() {
    setExpandedId(null);
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Open benchmark · Eight-dimensional scoring</p>
          <h1>Dataset Quality Index</h1>
          <p className="hero-lead">
            A structured framework for comparing text-based personality recognition datasets
            across label quality, linguistic properties, scale, observation depth, theoretical
            coverage, language and demographic representation, and governance.
          </p>
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.count}</span>
              <span className="stat-label">Datasets scored</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.avg}</span>
              <span className="stat-label">Mean DQI</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.original}</span>
              <span className="stat-label">Original datasets</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">8</span>
              <span className="stat-label">Equal dimensions</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container page-body">
        <div className="notice notice--info" role="status">
          <svg className="notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <div>
            <strong>Interpretation.</strong>{' '}
            The DQI summarizes documented dataset properties on a 0–100 scale. It supports
            comparative research design and dataset selection; it should not be read as a
            certificate of universal psychometric validity.{' '}
            <a href="/methods">View full methodology →</a>
          </div>
        </div>

        <section className="hotness-section">
          <div className="spider-section-header">
            <div>
              <h2>Quality versus literature usage</h2>
              <p>
                Bubble position shows DQI (horizontal) against how often each corpus appears
                in the TPR literature (vertical). Bubble size reflects reported corpus scale;
                color indicates access status. Hover or focus a bubble for full details.
              </p>
            </div>
          </div>
          <div className="spider-section-card">
            <HotnessChart datasets={datasets} />
          </div>
        </section>

        <section className="spider-section">
          <div className="spider-section-header">
            <div>
              <h2>Comparative profile</h2>
              <p>
                Multi-dataset radar plot across all eight dimensions. Every corpus is included
                by default; use the checkboxes to hide profiles. Hover a dataset name to inspect
                its dimension scores.
              </p>
            </div>
          </div>
          <div className="spider-section-card">
            <SpiderCompareChart datasets={datasets} dimensions={dimensions} />
          </div>
        </section>

        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search datasets…"
              aria-label="Search datasets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group" role="group" aria-label="Filter by asset type">
            {[
              ['all', 'All'],
              ['original dataset', 'Original dataset'],
              ['augmented dataset', 'Augmented dataset'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`filter-btn${filter === value ? ' active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="leaderboard-card">
          <div className="table-wrap">
            <table className="leaderboard">
              <thead>
                <tr>
                  <th className="col-rank" scope="col">#</th>
                  <th className="col-name sortable" scope="col" onClick={() => handleSort('name')}>
                    Dataset{sortIndicator('name')}
                  </th>
                  <th className="col-dqi sortable" scope="col" onClick={() => handleSort('dqi_100')}>
                    DQI{sortIndicator('dqi_100')}
                  </th>
                  <th className="col-spider" scope="col">Profile</th>
                  <th className="col-badges" scope="col">Provenance</th>
                  <th className="col-expand" scope="col">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No datasets match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((dataset, i) => (
                    <DatasetRow
                      key={dataset.id}
                      dataset={dataset}
                      rank={i + 1}
                      dimensions={dimensions}
                      isExpanded={expandedId === dataset.id}
                      onToggle={() =>
                        setExpandedId((id) => (id === dataset.id ? null : dataset.id))
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="table-footer">
            Showing {filtered.length} of {datasets.length} datasets · Last updated {formatDate(version)}
            <br />
            <span className="dataset-star-note">
              * on dataset names = enhanced personality-stratified split/evaluation protocol from prior work
            </span>
          </p>
        </div>

        <section className="legend-section">
          <h2>Scoring dimensions</h2>
          <p className="dim-star-note">
            * = cohort-relative dimension, normalized against the current benchmark corpus
          </p>
          <div className="legend-grid">
            {dimensions.map((dim) => {
              const { main } = getDimensionColor(dim.key);
              return (
                <div key={dim.key} className="legend-card">
                  <h3>
                    <span className="legend-dim-swatch" style={{ background: main }} />
                    {dim.label}
                    {dim.starred && <span className="dim-star">*</span>}
                  </h3>
                  <p>{dim.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <DatasetDetailDialog
        dataset={expandedDataset}
        dimensions={dimensions}
        onClose={closeDetail}
      />
    </>
  );
}
