import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Art from "../components/art";
import { readBest } from "../lib/storage";
import Shell from "../components/shell";
import Button from "../elements/button";

export default function Home() {
  const go = useNavigate();
  const [help, setHelp] = useState(false);
  const [best, setBest] = useState(0);
  useEffect(() => {
    setBest(readBest());
  }, []);
  return (
    <Shell onHelp={() => setHelp(!help)}>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <i /> YOUR VERY NORMAL LUNCH RUN
          </span>
          <h1>
            A little
            <br />
            lunch <em>chaos.</em>
          </h1>
          <p className="hero-sub">
            One school. One hundred meals. A clipboard with too much authority.
          </p>
          <div className="hero-actions">
            <Button variant="dark" onClick={() => go("/mission")}>
              Start the day <span>↗</span>
            </Button>
            <Button variant="quiet" onClick={() => setHelp(!help)}>
              How to play <span>↓</span>
            </Button>
          </div>
          <div className="hero-foot">
            <span>
              <i className="dot dot-green" /> SINGLE DAY SIMULATION
            </span>
            <span>NO BACKEND REQUIRED</span>
          </div>
        </div>
        <div className="hero-art-wrap">
          <div className="art-caption">
            TODAY'S LUNCH
            <br />
            <b>Made with care.</b>
          </div>
          <Art />
          <span className="orbit orbit-one">
            100
            <br />
            <small>PORTIONS</small>
          </span>
          <span className="orbit orbit-two">
            FRESH
            <br />
            <small>ISH.</small>
          </span>
          <div className="art-note">
            A charmingly complicated
            <br />
            delivery operation <span>↙</span>
          </div>
        </div>
      </section>
      {help && (
        <div className="help-panel">
          <button className="close-help" onClick={() => setHelp(false)}>
            ×
          </button>
          <span className="eyebrow">FIELD GUIDE</span>
          <h2>
            Everything is going
            <br />
            according to <em>some plan.</em>
          </h2>
          <p>
            Inspect the ingredients, cook inside the green zone, pack a complete
            meal, then steer the little van to school. Use WASD or your arrow
            keys to drive. The score rewards safe food first.
          </p>
          <div className="help-tags">
            <span>↑↓ accelerate / brake</span>
            <span>←→ steer</span>
            <span>SPACE use handbrake</span>
          </div>
        </div>
      )}
      <section className="home-lower">
        <div className="lower-left">
          <span className="eyebrow">PERSONAL BEST</span>
          <strong>{best ? best.toLocaleString("en-US") : "— — —"}</strong>
          <span>
            {best
              ? "A small win for the whole operation."
              : "Your clipboard is currently blank."}
          </span>
        </div>
        <div className="lower-right">
          <span className="eyebrow">THE BRIEF</span>
          <p>
            Get a warm, complete lunch to <b>SD Merdeka</b> before the paperwork
            develops its own paperwork.
          </p>
          <button className="text-link" onClick={() => go("/mission")}>
            Read today’s mission <span>→</span>
          </button>
        </div>
      </section>
    </Shell>
  );
}
