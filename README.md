# TPR Dataset Quality Index

Interactive benchmark for the **Dataset Quality Index (DQI)** in text-based personality recognition (TPR) research.

The DQI provides an evidence-weighted, eight-dimensional framework for comparing personality recognition datasets across label quality, linguistic properties, scale, observation depth, theoretical and language coverage, demographic representation, and governance.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Deploy the `dist/` directory to any static hosting service.

## Structure

```
src/
  components/     Layout, DatasetRow, SpiderChart, DimensionBars, Badge
  pages/          LeaderboardPage, MethodsPage
  data/           datasets.json, references.json
```

## Eight dimensions

1. Label grounding
2. Text naturalness
3. Scale (size)* — cohort-relative
4. Observation
5. Theory coverage* — cohort-relative
6. Language coverage* — cohort-relative
7. Demographic diversity
8. Governance & reproducibility

## Updating entries

Edit `src/data/datasets.json`. Each entry requires eight dimension scores (0–5) and a composite score:

```
DQI = round(sum(scores) / 40 × 100)
```

Entries may reference multiple citations (e.g., Kaggle dataset: `jie_nd` + `tan_2025`). See the Methodology page for the full scoring specification.
