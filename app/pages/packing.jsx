import { useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";

export default function Packing() {
  const go = useNavigate();
  const [checked, setChecked] = useState({});
  const items = ["Rice", "Chicken", "Greens", "Banana"];
  const count = Object.values(checked).filter(Boolean).length;
  return (
    <Shell phase="PACKING · PORTION CHECK" step={3}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">PHASE 02 / 02</span>
          <h1>
            Every box, <em>complete.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>BOXES PACKED</span>
          <b>
            {checked.done ? 100 : count * 25}
            <small> / 100</small>
          </b>
        </div>
      </div>
      <section className="packing-layout">
        <div className="packing-board">
          <div className="board-head">
            <span className="eyebrow">THE CONVEYOR OF DESTINY</span>
            <span>MENU CARD № 001</span>
          </div>
          <div className="lunchbox">
            <div className="lunchbox-brand">
              MBG <small>MEAL KIT</small>
            </div>
            {items.map((item, i) => (
              <button
                className={`food-slot slot-${i} ${checked[item] ? "is-added" : ""}`}
                key={item}
                onClick={() => setChecked((s) => ({ ...s, [item]: !s[item] }))}
              >
                <span className="food-emoji">
                  {["🍚", "🍗", "🥬", "🍌"][i]}
                </span>
                <span>{item}</span>
                <b>{checked[item] ? "✓" : "+"}</b>
              </button>
            ))}
          </div>
          <div className="conveyor">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="board-foot">
            <span>ONE BOX AT A TIME. THE FORMS CAN WAIT.</span>
            <span>100 PORTIONS</span>
          </div>
        </div>
        <div className="task-card packing-task">
          <div className="task-head">
            <span className="eyebrow">PORTION CHECK</span>
            <span className="step-count">{count}/4</span>
          </div>
          <h2>
            One of each,
            <br />
            if you please.
          </h2>
          <p>
            Tap each ingredient to add it to the meal box. A balanced lunch is a
            small miracle of logistics.
          </p>
          <div className="checklist">
            {items.map((item, i) => (
              <button
                key={item}
                onClick={() => setChecked((s) => ({ ...s, [item]: !s[item] }))}
                className={`check-row ${checked[item] ? "checked" : ""}`}
              >
                <span className="check-icon">
                  {checked[item] ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
                <small>{checked[item] ? "ADDED" : "TAP TO ADD"}</small>
              </button>
            ))}
          </div>
          <div className="packing-progress">
            <div>
              <span>PACKING ACCURACY</span>
              <b>{checked.done ? 100 : Math.round((count / 4) * 100)}%</b>
            </div>
            <div className="mini-progress">
              <span
                style={{ width: `${checked.done ? 100 : (count / 4) * 100}%` }}
              />
            </div>
          </div>
          <Button
            variant="dark"
            className="full-button"
            disabled={count < 4}
            onClick={() => {
              setChecked((s) => ({ ...s, done: true }));
              go("/delivery");
            }}
          >
            Load the van <span>↗</span>
          </Button>
        </div>
      </section>
      <div className="stage-note">
        <span>COMPLETE MEALS. FEWER MEETINGS.</span>
        <span>
          RICE &nbsp;·&nbsp; PROTEIN &nbsp;·&nbsp; GREENS &nbsp;·&nbsp; FRUIT
        </span>
      </div>
    </Shell>
  );
}
