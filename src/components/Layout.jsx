import { NavLink } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">DQI</span>
            <span className="brand-text">
              <strong>TPR Dataset Benchmark</strong>
              <small>Text-based Personality Recognition</small>
            </span>
          </NavLink>
          <nav className="site-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
              Leaderboard
            </NavLink>
            <NavLink to="/methods" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Methodology
            </NavLink>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>
            Dataset Quality Index for text-based personality recognition research.
          </p>
          <p className="footer-meta">
            Scoring framework informed by datasheets for datasets, data statements for NLP,
            and dataset nutrition labels.
          </p>
        </div>
      </footer>
    </>
  );
}
