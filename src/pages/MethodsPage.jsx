import { Link } from 'react-router-dom';
import references from '../data/references.json';
import Badge from '../components/Badge';
import { doiUrl } from '../utils';

export default function MethodsPage() {
  return (
    <div className="container methods-page">
      <header className="methods-header">
        <p className="eyebrow">Methodology</p>
        <h1>Dataset Quality Index</h1>
        <p className="hero-lead">
          The DQI extends dataset documentation practices from datasheets, data statements, and
          nutrition labels to text-based personality recognition (TPR). It provides a structured,
          evidence-weighted comparison across label quality, text properties, scale, observation depth,
          theory and language coverage, demographic representation, and governance.
        </p>
      </header>

      <article className="methods-content">
        <section className="method-block">
          <h2>Founding principles</h2>
          <ul className="principle-list">
            <li>
              <strong>Additive scoring.</strong> Self-declared, synthetic, or translated resources are
              not penalized; they receive credit only for documented evidence they can support.
            </li>
            <li>
              <strong>Evidence-linked metrics.</strong> Each dimension score is tied to documented
              dataset properties and accompanying scholarly sources.
            </li>
            <li>
              <strong>Transparent interpretation.</strong> Dimension-level scores and their rationale
              are published alongside the composite index.
            </li>
            <li>
              <strong>Scholarly provenance.</strong> Entries require a DOI, arXiv DOI, ACL Anthology
              DOI, Hugging Face DOI, or equivalent stable citation.
            </li>
          </ul>
        </section>

        <section className="method-block">
          <h2>Composite index</h2>
          <p>
            Each dataset receives eight component scores on a 0–5 scale. The Dataset Quality Index
            is normalized to 0–100 for presentation:
          </p>
          <div className="formula-card">
            <code>DQI(D) = round( Σ scores / 40 × 100 )</code>
            <p className="formula-note">
              Equivalent to the arithmetic mean of eight dimension scores, scaled to 100. The DQI
              summarizes documented dataset properties; it does not constitute a claim of complete
              psychometric validity.
            </p>
          </div>
        </section>

        <section className="method-block">
          <h2>Eight dimensions</h2>
          <p className="dim-star-note">
            Dimensions marked with * incorporate cohort-relative normalization and are recalibrated
            as new datasets are added to the benchmark.
          </p>
          <div className="dimension-table-wrap">
            <table className="dimension-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Scoring criteria</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Label grounding</strong></td>
                  <td>Validated questionnaires, reliability evidence, trained raters, documented self-declaration, multi-source labels, and reported label provenance.</td>
                </tr>
                <tr>
                  <td><strong>Text naturalness</strong></td>
                  <td>Everyday, longitudinal, platform-native, or interactional communication. Lower scores when text is scripted, generated, or dominated by personality-type meta-discussion.</td>
                </tr>
                <tr>
                  <td><strong>Scale (size)*</strong></td>
                  <td>Users, documents, words, comments, or rows, evaluated with cohort-relative normalization.</td>
                </tr>
                <tr>
                  <td><strong>Observation</strong></td>
                  <td>Repeated observations per person, longitudinal coverage, multiple posts or comments per user, user-level aggregation, and stable observation windows.</td>
                </tr>
                <tr>
                  <td><strong>Theory coverage*</strong></td>
                  <td>Big Five, MBTI, HEXACO, Enneagram, facets, cross-theory mapping, and uncertainty-aware label design.</td>
                </tr>
                <tr>
                  <td><strong>Language coverage*</strong></td>
                  <td>Multilingual text, locally validated instruments, native-speaker review, and language-held-out evaluation.</td>
                </tr>
                <tr>
                  <td><strong>Demographic diversity</strong></td>
                  <td>Participant diversity, geographic metadata, demographic distributions, representativeness reporting, and bias analysis.</td>
                </tr>
                <tr>
                  <td><strong>Governance &amp; reproducibility</strong></td>
                  <td>Public or restricted access clarity, stable download or request path, license/terms, reproducible splits, class-balance reporting, documented preprocessing, and leakage-control evidence. Public, reproducible corpora score higher than request-only, deprecated, or unavailable resources.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="method-block">
          <h2>Score anchors</h2>
          <div className="anchor-grid">
            {[
              [0, 'No supporting evidence identified'],
              [1, 'Minimal or implicit documentation'],
              [2, 'Usable but incompletely documented'],
              [3, 'Adequately documented for research use'],
              [4, 'Strong documentation or validation'],
              [5, 'Comprehensive, publication-grade evidence'],
            ].map(([score, label]) => (
              <div key={score} className="anchor-card">
                <span className="anchor-score">{score}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="method-block">
          <h2>Absolute and relative components</h2>
          <p>
            Scale, language, and theory incorporate both absolute evidence checklists and
            cohort-relative normalization. Observation is evaluated on absolute evidence alone.
            Demographic diversity combines absolute documentation with limited cohort-relative
            context, reflecting that the primary criterion is balanced, reported participant
            composition rather than maximal group count.
          </p>
          <div className="formula-card">
            <code>S_scale = 5 × [0.50 × A_scale + 0.50 × R_scale]</code>
            <code>S_observation = 5 × A_observation</code>
            <code>S_language = 5 × [0.50 × A_language + 0.50 × R_language] × V_language</code>
            <code>S_demographic = 5 × [0.70 × A_demographic + 0.30 × R_demographic] × V_demographic</code>
            <code>S_theory = 5 × [0.60 × A_theory + 0.40 × R_theory] × V_theory</code>
            <code>S_governance = 5 × A_governance</code>
          </div>
          <p>
            Governance is evaluated on absolute evidence alone. It reflects whether another
            researcher can legally and practically reproduce the dataset condition.
          </p>
          <p>
            Logarithmic normalization ensures that datasets with extreme counts do not dominate
            comparisons with smaller but carefully validated corpora. Cohort maxima are recomputed
            when the benchmark is updated.
          </p>
        </section>

        <section className="method-block">
          <h2>Governance and reproducibility</h2>
          <p>
            Governance measures access and reproducibility — not only ethical approval. The access
            component weights public availability above request/terms access, which in turn scores
            above restricted, study-dependent, or unavailable resources:
          </p>
          <div className="formula-card">
            <code>access_score: public 1.00 · request/terms 0.75 · study-dependent 0.50 · private 0.25 · unavailable 0.00</code>
            <code>A_governance = 0.25×access + 0.15×stable_path + 0.15×license + 0.15×split + 0.10×balance + 0.10×preprocessing + 0.10×leakage</code>
          </div>
          <p>
            PANDORA Talks illustrates this distinction: it scores highly on scale, observation, and
            theory coverage, but request/terms access yields lower governance than public corpora
            such as Kaggle dataset* or Essays* despite a higher overall DQI.
          </p>
        </section>

        <section className="method-block">
          <h2>Quality versus literature usage</h2>
          <p>
            The usage–quality map compares DQI against the number of TPR studies that use or center
            each corpus. This is not a global citation count. Key patterns:
          </p>
          <ul className="principle-list">
            <li>Researchers tend to prefer <strong>public</strong> datasets. Kaggle dataset* and Essays* appear more frequently than PANDORA despite narrower or lower construct coverage, because they are easier to access and reproduce.</li>
            <li><strong>Scale and format</strong> also attract reuse. Kaggle dataset* offers many users and a convenient classification setting, supporting repeated modeling work despite self-declared labels.</li>
            <li><strong>Restricted or deprecated</strong> access reduces practical momentum. myPersonality remains historically important but is less used in new reproducible work.</li>
            <li><strong>High DQI does not guarantee high usage.</strong> PANDORA has strong metadata and observation depth, but request/terms access limits immediate reuse compared with public alternatives.</li>
            <li>Public dialogue corpora may remain less central when task validity is narrower, as with CPED and FriendPersona.</li>
          </ul>
        </section>

        <section className="method-block">
          <h2>Scale and observation</h2>
          <p>
            Scale quantifies corpus size (users, documents, text units). Observation is treated
            separately because a large corpus may still provide limited per-person evidence when
            each participant contributes only a single short text. Corpora such as EAR, PANDORA
            Talks, Deimann, and Kaggle* receive higher observation scores for repeated
            language per individual; Essays* receives a lower observation score owing to
            its single controlled writing sample per participant.
          </p>
        </section>

        <section className="method-block">
          <h2>Language and demographic diversity</h2>
          <p>
            Language coverage and demographic diversity are distinct constructs. A corpus may be
            linguistically homogeneous yet demographically diverse, or multilingual yet drawn from a
            narrow participant pool. Generated or machine-translated content is scored through
            validation multipliers (<code>V_language</code>, <code>V_demographic</code>) applied to
            the relevant dimensions.
          </p>
        </section>

        <section className="method-block">
          <h2>Kaggle dataset* and Essays*: data source and evaluation protocol</h2>
          <p>
            Both benchmark entries link a curated corpus to the same enhanced evaluation protocol
            from prior work. Kaggle dataset* uses the curated Hugging Face record (<code>jie_nd</code>);
            Essays* uses the original study (<code>pennebaker_1999</code>) and curated
            release (<code>jie_nd_b</code>). In both cases, <code>tan_2025</code> defines
            personality-stratified train/test partitioning and class-imbalance-aware evaluation.
          </p>
        </section>

        <section className="method-block">
          <h2>Dataset types</h2>
          <p>
            The leaderboard distinguishes two asset types. An <strong>original dataset</strong> is a
            human-authored corpus collected from an existing human setting, such as controlled
            writing, social media, dialogue, or behavioral recording. An <strong>augmented dataset</strong>{' '}
            is an LLM-filtered, LLM-generated, translated, aligned, or otherwise expanded
            construction built from one or more original datasets.
          </p>
        </section>

        <section className="method-block">
          <h2>Provenance labels</h2>
          <p>
            Provenance labels describe how text and personality annotations were obtained. They do
            not alter the composite index directly; rather, they indicate which validation evidence
            informs the underlying dimension scores.
          </p>
          <div className="badge-showcase">
            <Badge label="Natural" />
            <Badge label="Self-declared" />
            <Badge label="Human-annotated" />
            <Badge label="LLM-augmented" />
            <Badge label="Translated" />
            <Badge label="Synthetic" />
          </div>
        </section>

        <section className="method-block">
          <h2>Inclusion and maintenance criteria</h2>
          <ol className="rules-list">
            <li>Stable scholarly citation required (DOI or equivalent).</li>
            <li>Documented evidence recorded prior to dimension scoring.</li>
            <li>Text units (words, comments, rows, users) reported separately.</li>
            <li>Self-declared labels scored on documented provenance, not penalized by default.</li>
            <li>Preprocessing credit awarded only when procedures are documented.</li>
            <li>Scores updated when leakage controls, splits, or access terms change.</li>
            <li>Dimension scores and supporting rationale published together.</li>
          </ol>
        </section>

        <section className="method-block">
          <h2>References</h2>
          <div className="refs-list">
            {references.map((ref) => (
              <div key={ref.key} className="ref-card">
                <div className="ref-header">
                  <strong>{ref.authors}</strong>
                  <span className="ref-year">{ref.year}</span>
                </div>
                <p className="ref-title">{ref.title}</p>
                <p className="ref-role">{ref.role}</p>
                <a href={doiUrl(ref.doi)} target="_blank" rel="noopener noreferrer" className="ref-doi">
                  doi:{ref.doi}
                </a>
              </div>
            ))}
          </div>
        </section>

        <p className="methods-back">
          <Link to="/">← Return to leaderboard</Link>
        </p>
      </article>
    </div>
  );
}
