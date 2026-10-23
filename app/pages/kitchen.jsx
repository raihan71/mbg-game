import { useState } from "react";
import { useNavigate } from "react-router";
import ThreePanel from "../components/three-panel";
import Shell from "../components/shell";
import Button from "../elements/button";

export default function Kitchen() {
  const go = useNavigate();
  const [state, setState] = useState({
    inspected: false,
    cooked: false,
    safety: 100,
    cooking: 0,
    accepted: false,
  });
  const [notice, setNotice] = useState("");
  function inspect(accept) {
    setState((s) => ({
      ...s,
      inspected: true,
      accepted: accept,
      safety: accept ? 55 : 100,
    }));
    try {
      sessionStorage.setItem("mbg-safety", accept ? "55" : "100");
    } catch {}
    setNotice(
      accept
        ? "You chose the “it’s probably fine” route. The clipboard disagrees."
        : "Questionable chicken rejected. The kitchen exhales.",
    );
  }
  function cook() {
    setState((s) => ({ ...s, cooked: true }));
    setNotice("Safe zone reached. The rice cooker is taking a victory lap.");
  }
  return (
    <Shell phase="KITCHEN · QUALITY CHECK" step={2}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">PHASE 01 / 02</span>
          <h1>
            Handle with <em>care.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>FOOD SAFETY</span>
          <b>{state.safety}%</b>
        </div>
      </div>
      <section className="kitchen-layout">
        <ThreePanel mode="meal">
          <div className="floating-label label-rice">
            RICE <i>FRESH</i>
          </div>
          <div className="floating-label label-protein">
            CHICKEN <i className="warn">CHECKED?</i>
          </div>
          <span className="scene-sign">
            TODAY’S PREP
            <br />
            <b>NO SHORTCUTS</b>
          </span>
        </ThreePanel>
        <div className="task-card">
          <div className="task-head">
            <span className="eyebrow">QUALITY CONTROL</span>
            <span className="step-count">01—02</span>
          </div>
          <h2>
            {!state.inspected
              ? "Something smells fishy."
              : !state.cooked
                ? "Let’s get cooking."
                : "Looking good, chef."}
          </h2>
          <p>
            {!state.inspected
              ? "One chicken crate arrived with a suspiciously vague expiry label. What does the responsible clipboard-holder do?"
              : !state.cooked
                ? "Bring the chicken into the safe zone. Stop before it turns into a budget meeting."
                : "Chicken is safely cooked. Proceed to packing before the rice gets ideas."}
          </p>
          {!state.inspected ? (
            <div className="choice-row">
              <Button variant="dark" onClick={() => inspect(false)}>
                Reject crate <span>↗</span>
              </Button>
              <Button variant="soft" onClick={() => inspect(true)}>
                Use it anyway
              </Button>
            </div>
          ) : !state.cooked ? (
            <div className="cook-control">
              <div className="cook-track">
                <span />
                <i />
              </div>
              <div className="cook-labels">
                <span>RAW</span>
                <b>SAFE ZONE</b>
                <span>BURNT</span>
              </div>
              <Button variant="dark" className="full-button" onClick={cook}>
                Stop in the safe zone <span>↗</span>
              </Button>
            </div>
          ) : (
            <Button variant="dark" onClick={() => go("/packing")}>
              Pack the meals <span>↗</span>
            </Button>
          )}
          {notice && (
            <div className={`notice ${state.accepted ? "notice-warn" : ""}`}>
              <span>{state.accepted ? "!" : "✓"}</span>
              {notice}
            </div>
          )}
          <div className="task-foot">
            <span>FOOD SAFETY IS WORTH MORE THAN SPEED.</span>
            <span>01 / 02</span>
          </div>
        </div>
      </section>
      <div className="stage-note">
        <span>GOOD SYSTEMS MAKE SAFE CHOICES EASY.</span>
        <span>INGREDIENTS &nbsp;·&nbsp; TEMPERATURE &nbsp;·&nbsp; CARE</span>
      </div>
    </Shell>
  );
}
