export const BADGE_CLASS = {
  Natural: 'badge--natural',
  'Human-annotated': 'badge--human',
  'Self-declared': 'badge--self',
  'LLM-augmented': 'badge--llm',
  Translated: 'badge--translated',
  Synthetic: 'badge--synthetic',
};

/** Distinct color per DQI dimension — used in bars, radar charts, and legend */
export const DIMENSION_COLORS = {
  label_grounding:       { main: '#4f46e5', fill: 'rgba(79, 70, 229, 0.22)' },
  text_naturalness:      { main: '#059669', fill: 'rgba(5, 150, 105, 0.22)' },
  scale_size:            { main: '#2563eb', fill: 'rgba(37, 99, 235, 0.22)' },
  observation_depth:     { main: '#7c3aed', fill: 'rgba(124, 58, 237, 0.22)' },
  theory_coverage:       { main: '#d97706', fill: 'rgba(217, 119, 6, 0.22)' },
  language_coverage:     { main: '#0d9488', fill: 'rgba(13, 148, 136, 0.22)' },
  demographic_diversity: { main: '#db2777', fill: 'rgba(219, 39, 119, 0.22)' },
  governance_reproducibility: { main: '#475569', fill: 'rgba(71, 85, 105, 0.22)' },
};

export function getDimensionColor(key) {
  return DIMENSION_COLORS[key] ?? { main: '#64748b', fill: 'rgba(100, 116, 139, 0.22)' };
}

export function doiUrl(doi) {
  return `https://doi.org/${doi}`;
}

export function dqiTier(dqi) {
  if (dqi >= 75) return 'tier-high';
  if (dqi >= 60) return 'tier-mid';
  return 'tier-low';
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Compact label for tables, charts, and list rows (e.g. JAM, ADAM, Kaggle*). */
export function datasetLabel(dataset) {
  return dataset.short_name ?? dataset.name;
}
