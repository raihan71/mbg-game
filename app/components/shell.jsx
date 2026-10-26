import { CircleHelp, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import SoundSettings from "./sound-settings";
import { useGame } from "./game-provider";
export default function Shell({ children, phase, step }) {
  const { game, saveStatus, offline } = useGame();
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
          <span className="day-pill">
            DAY {String(game.day || 1).padStart(2, "0")}
          </span>
          <SoundSettings />
          <button
            className="help-button"
            onClick={() => setHelp((v) => !v)}
            aria-expanded={help}
            aria-controls="field-guide"
          >
            How to play <CircleHelp aria-hidden="true" />
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
            <X aria-hidden="true" />
          </button>
          <span className="eyebrow">YOUR LITTLE FIELD GUIDE</span>
          <h2>You’ve got this, chef.</h2>
          <p>
            Spin a menu, pick its pictured ingredients, and finish each cooking
            station. Pack the cooked dish and extras in the exact order on your
            ticket. Spin a country to begin delivery. Then hold W or ↑ to drive,
            A/D or ←/→ to steer, and Space to boost. On your phone, use the
            buttons below the game.
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
      <div className="save-strip">
        <span>{saveStatus}</span>
        <span>{offline}</span>
      </div>
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
          <span>
            MBG ADVENTURE · DAY {String(game.day || 1).padStart(2, "0")}
          </span>
        </nav>
      </footer>
    </main>
  );
}
