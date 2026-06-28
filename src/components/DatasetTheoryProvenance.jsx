import Badge from './Badge';

function MetaList({ items }) {
  if (!items?.length) return null;
  return (
    <dl className="meta-dl">
      {items.map(({ term, value }) => (
        <div key={term} className="meta-dl-row">
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function theoryItems(dataset) {
  const t = dataset.theory ?? {};
  const items = [];

  const frameworks = t.frameworks ?? dataset.frameworks;
  if (frameworks?.length) {
    items.push({
      term: 'Personality framework',
      value: (
        <span className="meta-tag-row">
          {frameworks.map((f) => (
            <span key={f} className="framework-tag">
              {f}
            </span>
          ))}
        </span>
      ),
    });
  }

  if (t.traits_or_labels) items.push({ term: 'Traits / labels', value: t.traits_or_labels });
  if (t.instruments_or_method) items.push({ term: 'Measurement method', value: t.instruments_or_method });
  if (t.multi_theory_notes) items.push({ term: 'Theory notes', value: t.multi_theory_notes });
  if (t.target_representation) items.push({ term: 'Target representation', value: t.target_representation });

  return items;
}

function provenanceItems(dataset, showProvenanceLabels = true) {
  const p = dataset.provenance ?? {};
  const items = [];

  if (showProvenanceLabels) {
    const badges = p.provenance_labels ?? dataset.badges;
    if (badges?.length) {
      items.push({
        term: 'Provenance labels',
        value: (
          <span className="meta-badge-row">
            {badges.map((b) => (
              <Badge key={b} label={b} />
            ))}
          </span>
        ),
      });
    }
  }

  if (p.text_source) items.push({ term: 'Text source', value: p.text_source });
  if (p.language) items.push({ term: 'Language', value: p.language });
  if (p.label_source) items.push({ term: 'Label source', value: p.label_source });
  if (p.collection_context) items.push({ term: 'Collection context', value: p.collection_context });
  if (p.split_or_evaluation) items.push({ term: 'Split / evaluation', value: p.split_or_evaluation });
  if (p.access_and_license) items.push({ term: 'Access & license', value: p.access_and_license });
  if (p.class_balance) items.push({ term: 'Class balance', value: p.class_balance });
  if (p.known_limitations) items.push({ term: 'Known limitations', value: p.known_limitations });

  return items;
}

export function DatasetTheoryBlock({ dataset, compact = false }) {
  const items = theoryItems(dataset);
  if (!items.length) return null;

  return (
    <section className={`meta-section${compact ? ' meta-section--compact' : ''}`}>
      <h4 className="meta-section-title">Theory &amp; labels</h4>
      <MetaList items={compact ? items.slice(0, 4) : items} />
    </section>
  );
}

export function DatasetProvenanceBlock({ dataset, compact = false, showProvenanceLabels = true }) {
  const items = provenanceItems(dataset, showProvenanceLabels);
  if (!items.length) return null;

  const visible = compact ? items.slice(0, 5) : items;

  return (
    <section className={`meta-section${compact ? ' meta-section--compact' : ''}`}>
      <h4 className="meta-section-title">Provenance &amp; collection</h4>
      <MetaList items={visible} />
    </section>
  );
}

export default function DatasetTheoryProvenance({ dataset, compact = false }) {
  return (
    <div className={`theory-provenance${compact ? ' theory-provenance--compact' : ''}`}>
      <DatasetTheoryBlock dataset={dataset} compact={compact} />
      <DatasetProvenanceBlock dataset={dataset} compact={compact} />
    </div>
  );
}
