import { Link } from "react-router";
export default function Shell({ children, phase, step, onHelp }) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">m</span>
          <span>
            MBG <span className="brand-light">ADVENTURE</span>
          </span>
        </Link>
        <div className="top-meta">
          <span className="day-pill">FIELD NOTE&nbsp; 01</span>
          <button
            className="icon-button"
            onClick={onHelp}
            aria-label="How to play"
          >
            ?
          </button>
        </div>
      </header>
      {phase && (
        <div className="progress-wrap">
          <div className="progress-line">
            <span style={{ width: `${step * 20}%` }} />
          </div>
          <div className="progress-label">
            <span>{phase}</span>
            <span>DAY 01 / 05</span>
          </div>
        </div>
      )}
      {children}
      <footer className="footer">
        <span>AN OPERATIONAL COMEDY</span>
        <span>Made with care, and one questionable clipboard.</span>
      </footer>
    </main>
  );
}
