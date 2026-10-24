import { useState } from "react";
import { Link } from "react-router";
export default function Shell({ children, phase, step }) {
  const [help, setHelp] = useState(false);
  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">m</span>
          <span>
            mbg<span className="brand-light">adventure</span>
          </span>
        </Link>
        <div className="top-meta">
          <span className="day-pill">DAY 01</span>
          <button
            className="help-button"
            onClick={() => setHelp((v) => !v)}
            aria-expanded={help}
            aria-controls="field-guide"
          >
            How to play <span>?</span>
          </button>
        </div>
      </header>
      {help && (
        <section className="help-panel" id="field-guide">
          <button
            className="close-help"
            aria-label="Close help"
            onClick={() => setHelp(false)}
          >
            ×
          </button>
          <span className="eyebrow">YOUR LITTLE FIELD GUIDE</span>
          <h2>You’ve got this, chef.</h2>
          <p>
            Inspect the ingredients, finish each cooking station, and pack one
            of every food. Then hold W or ↑ to drive, A/D or ←/→ to steer, and
            Space to boost. On your phone, use the buttons below the game.
          </p>
        </section>
      )}
      {phase && (
        <div className="progress-wrap">
          <div
            className="progress-line"
            role="progressbar"
            aria-label="Adventure progress"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={step}
          >
            <span style={{ width: `${step * 20}%` }} />
          </div>
          <div className="progress-label">
            <span>{phase}</span>
            <span>STEP {step} OF 5</span>
          </div>
        </div>
      )}
      {children}
      <footer className="footer">
        <div>
          <Link to="/" className="footer-brand">
            A little lunch.
            <br />A lot of good.
          </Link>
          <p>Made with care, and one very determined chef.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/">Back to base</Link>
          <Link to="/mission">Start an adventure</Link>
          <span>MBG ADVENTURE · DAY 01</span>
        </nav>
      </footer>
    </main>
  );
}
