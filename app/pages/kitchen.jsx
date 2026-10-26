import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Plus,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { lazy, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import Stage from "../components/game/stage";
import { useGame } from "../components/game-provider";
import { foods, menuFor } from "../lib/game";
import { sound, stopSound } from "../lib/audio";
import ModelImage from "../components/model-image";
import { stations } from "../lib/kitchen";
const KitchenScene = lazy(() => import("../components/game/kitchen-scene"));
import { useGameInput, holdKey } from "../components/game/input";

export default function Kitchen() {
  const go = useNavigate();
  const keys = useGameInput();
  const { game, dispatch } = useGame();
  const run = game.run;
  const menu = menuFor(run);
  const stage = run.stage;
  const safety = Math.max(0, 100 - run.mistakes * 5);
  const [command, setCommand] = useState(null);
  const [busy, setBusy] = useState(false);
  const [atCrate, setAtCrate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState(
    "Your shift starts here. Walk to the ingredient crate.",
  );
  const lock = useRef(false);
  useEffect(() => {
    if (!busy || stage === 0 || progress <= 0) return;
    const cue = stage === 1 ? "chop" : stage === 2 ? "cook" : "pack";
    if (stage === 2) sound("pots");
    sound(cue);
    const timer = setInterval(() => sound(cue), stage === 2 ? 430 : 350);
    return () => {
      clearInterval(timer);
      stopSound(cue);
      stopSound("pots");
    };
  }, [busy, stage, progress > 0]);
  function visit(index) {
    if (lock.current || index !== stage || stage === 4) return;
    lock.current = true;
    sound("select");
    setBusy(true);
    setProgress(0);
    setCommand({ id: stations[index].id });
    setNotice(`On your way to ${stations[index].label.toLowerCase()}.`);
  }
  function chooseIngredient(id) {
    if (run.selected.includes(id)) return;
    const correct = menu.ingredients.includes(id);
    dispatch({ type: "INGREDIENT", id });
    sound(correct ? "select" : "error");
    setNotice(
      correct
        ? `${foods[id].name} added. Keep following the recipe.`
        : `${foods[id].name} is not in this recipe. Try another ingredient.`,
    );
  }
  function inspect() {
    dispatch({ type: "STATION", stage: 0 });
    setAtCrate(false);
    sound("success");
    setNotice("Ingredients checked. Time to chop your fresh batch.");
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
          <span>RECIPE ACCURACY</span>
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
              ingredientAsset={foods[menu.ingredients[0]].image}
              dishAsset={menu.image}
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
                    "Choose the pictured ingredients listed on your recipe ticket.",
                  );
                } else
                  setNotice(
                    `${stations.find((s) => s.id === id).label} in progress…`,
                  );
              }}
              onComplete={() => {
                dispatch({ type: "STATION", stage });
                sound("select");
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
                <b>
                  {stage > i ? (
                    <Check aria-hidden="true" />
                  ) : stage === i ? (
                    <ArrowUpRight aria-hidden="true" />
                  ) : (
                    "·"
                  )}
                </b>
              </button>
            ))}
          </div>
          <div className="scene-bottomline">
            <span>WASD / ARROWS TO WALK · SELECT A STATION TO WORK</span>
            <div className="mini-pad">
              {[
                ["a", "left", ArrowLeft],
                ["w", "up", ArrowUp],
                ["s", "down", ArrowDown],
                ["d", "right", ArrowRight],
              ].map(([key, label, Icon]) => (
                <button
                  aria-label={`Move ${label}`}
                  key={key}
                  {...holdKey(keys, key)}
                >
                  <Icon aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <aside className="task-card modern-task">
          <span className="eyebrow">TODAY’S ORDER · {menu.name}</span>
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
                <span>
                  {stage > i ? <Check aria-hidden="true" /> : `0${i + 1}`}
                </span>
                {text}
                <b>{stage === i ? "NOW" : ""}</b>
              </div>
            ))}
          </div>
          {atCrate ? (
            <div>
              <p>
                <b>Recipe:</b>{" "}
                {menu.ingredients.map((id) => foods[id].name).join(" + ")}
              </p>
              <div className="ingredient-grid">
                {Object.entries(foods).map(([id, food]) => (
                  <button
                    key={id}
                    disabled={run.selected.includes(id)}
                    className={run.selected.includes(id) ? "picked" : ""}
                    onClick={() => chooseIngredient(id)}
                  >
                    <ModelImage asset={food.image} decorative />
                    <span>
                      {food.name}{" "}
                      {run.selected.includes(id) ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Plus aria-hidden="true" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                variant="dark"
                disabled={run.selected.length !== menu.ingredients.length}
                onClick={inspect}
              >
                Ingredients ready · {run.selected.length}/
                {menu.ingredients.length} <ArrowRight aria-hidden="true" />
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
              <span>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </Button>
          ) : (
            <Button
              variant="dark"
              onClick={() => {
                dispatch({ type: "PACKING" });
                sound("pack");
                go("/packing");
              }}
            >
              Start packing{" "}
              <span>
                <ArrowUpRight aria-hidden="true" />
              </span>
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
