import { lazy, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import Stage from "../components/game/stage";
import { stations } from "../lib/kitchen";
const KitchenScene = lazy(() => import("../components/game/kitchen-scene"));
import { useGameInput, holdKey } from "../components/game/input";

export default function Kitchen() {
  const go = useNavigate();
  const keys = useGameInput();
  const [stage, setStage] = useState(0);
  const [safety, setSafety] = useState(100);
  const [command, setCommand] = useState(null);
  const [busy, setBusy] = useState(false);
  const [atCrate, setAtCrate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState(
    "Your shift starts here. Walk to the ingredient crate.",
  );
  const lock = useRef(false);
  function visit(index) {
    if (lock.current || index !== stage || stage === 4) return;
    lock.current = true;
    setBusy(true);
    setProgress(0);
    setCommand({ id: stations[index].id });
    setNotice(`On your way to ${stations[index].label.toLowerCase()}.`);
  }
  function inspect(accept) {
    const score = accept ? 55 : 100;
    setSafety(score);
    setStage(1);
    setAtCrate(false);
    try {
      sessionStorage.setItem("mbg-safety", String(score));
    } catch {}
    setNotice(
      accept
        ? "Questionable ingredients accepted. Food safety lost 45 points."
        : "Crate rejected. Fresh ingredients ready for prep.",
    );
  }
  const titles = [
    "Check before you chop.",
    "A little prep goes far.",
    "Let it simmer.",
    "Order up, chef.",
    "Ready for the road.",
  ];
  return (
    <Shell phase="KITCHEN · MORNING SHIFT" step={2}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">01 / 03 · THE KITCHEN</span>
          <h1>
            Small kitchen. <em>Big lunch.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>FOOD SAFETY</span>
          <b>{safety}%</b>
        </div>
      </div>
      <section className="modern-game-layout">
        <div className="scene-card">
          <div className="scene-topline">
            <span>
              <i className="live-dot" /> MORNING SHIFT
            </span>
            <b>100 MEALS · {stage}/4 TASKS</b>
          </div>
          <Stage label="Top-down kitchen with four workstations and a moving chef">
            <KitchenScene
              onVisit={visit}
              keys={keys}
              command={command}
              stage={stage}
              busy={busy}
              onProgress={setProgress}
              onArrival={(id) => {
                if (id === "crate") {
                  setAtCrate(true);
                  setBusy(false);
                  lock.current = false;
                  setNotice(
                    "The chicken expiry label is unreadable. Reject it or accept the risk.",
                  );
                } else
                  setNotice(
                    `${stations.find((s) => s.id === id).label} in progress…`,
                  );
              }}
              onComplete={() => {
                setStage((s) => s + 1);
                setBusy(false);
                lock.current = false;
                setProgress(1);
                setNotice("Task complete. Great work, chef.");
              }}
            />
          </Stage>
          <div className="station-buttons">
            {stations.map((s, i) => (
              <button
                key={s.id}
                disabled={busy || stage !== i}
                className={
                  stage > i ? "complete" : stage === i ? "selected" : ""
                }
                onClick={() => visit(i)}
              >
                <small>0{i + 1}</small>
                {s.label}
                <b>{stage > i ? "✓" : stage === i ? "↗" : "·"}</b>
              </button>
            ))}
          </div>
          <div className="scene-bottomline">
            <span>WASD / ARROWS TO WALK · SELECT A STATION TO WORK</span>
            <div className="mini-pad">
              {[
                ["a", "←"],
                ["w", "↑"],
                ["s", "↓"],
                ["d", "→"],
              ].map(([key, label]) => (
                <button
                  aria-label={`Move ${label}`}
                  key={key}
                  {...holdKey(keys, key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <aside className="task-card modern-task">
          <span className="eyebrow">TODAY’S ORDER · 001</span>
          <h2>{titles[stage]}</h2>
          <p>
            {
              [
                "Inspect the ingredient crate. A safe lunch starts with knowing what goes into it.",
                "The fresh batch needs chopping. Select the prep station and let your chef get to work.",
                "Cook the batch through. The hot line needs a few seconds to finish safely.",
                "Bring the cooked meal to the service pass. Next stop: the packing line.",
                "Four stations, one complete meal. Send the batch over to packing.",
              ][stage]
            }
          </p>
          <div className="order-ticket">
            {[
              "Inspect ingredients",
              "Chop the batch",
              "Cook through",
              "Plate the meals",
            ].map((text, i) => (
              <div key={text} className={stage > i ? "finished" : ""}>
                <span>{stage > i ? "✓" : `0${i + 1}`}</span>
                {text}
                <b>{stage === i ? "NOW" : ""}</b>
              </div>
            ))}
          </div>
          {atCrate ? (
            <div className="choice-row">
              <Button variant="dark" onClick={() => inspect(false)}>
                Reject crate
              </Button>
              <Button variant="soft" onClick={() => inspect(true)}>
                Use anyway
              </Button>
            </div>
          ) : stage < 4 ? (
            <Button
              variant="dark"
              className="full-button"
              disabled={busy}
              onClick={() => visit(stage)}
            >
              {busy
                ? progress > 0
                  ? `Working · ${Math.round(progress * 100)}%`
                  : "Walking to station…"
                : `Go to ${stations[stage].label.toLowerCase()}`}{" "}
              <span>↗</span>
            </Button>
          ) : (
            <Button variant="dark" onClick={() => go("/packing")}>
              Start packing <span>↗</span>
            </Button>
          )}
          <p className="game-notice" role="status">
            {notice}
          </p>
          <div className="task-foot">GOOD FOOD TAKES A LITTLE CARE.</div>
        </aside>
      </section>
    </Shell>
  );
}
