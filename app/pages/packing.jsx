import { lazy, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import ModelImage from "../components/model-image";
import { mealImages } from "../configs/images";
import Stage from "../components/game/stage";
const PackingScene = lazy(() => import("../components/game/packing-scene"));

export default function Packing() {
  const go = useNavigate();
  const [checked, setChecked] = useState({});
  const items = mealImages.map((item) => item.name);
  const count = items.filter((item) => checked[item]).length;
  return (
    <Shell phase="PACKING · PORTION CHECK" step={3}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">PHASE 02 / 03</span>
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
      <section className="modern-game-layout">
        <div className="scene-card">
          <div className="scene-topline">
            <span>
              <i className="live-dot" /> THE PACKING LINE
            </span>
            <b>MEAL KIT · 001</b>
          </div>
          <Stage label="Animated lunch tray with rice, chicken, greens and banana">
            <PackingScene
              checked={checked}
              onToggle={(item) =>
                setChecked((s) => ({ ...s, [item]: !s[item] }))
              }
            />
          </Stage>
          <div className="station-buttons">
            {items.map((item, i) => (
              <button
                key={item}
                aria-pressed={!!checked[item]}
                className={checked[item] ? "complete" : ""}
                onClick={() => setChecked((s) => ({ ...s, [item]: !s[item] }))}
              >
                <small>0{i + 1}</small>
                {item}
                <b>{checked[item] ? "✓" : "+"}</b>
              </button>
            ))}
          </div>
          <div className="scene-bottomline">
            TAP AN INGREDIENT · BUILD A BALANCED LUNCH
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
                <ModelImage
                  asset={mealImages[i].image}
                  decorative
                  className="check-food"
                />
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
