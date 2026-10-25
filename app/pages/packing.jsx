import { useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import ModelImage from "../components/model-image";
import { useGame } from "../components/game-provider";
import { foods, menuFor, packingOrder } from "../lib/game";
import { sound } from "../lib/audio";
export default function Packing() {
  const go = useNavigate();
  const { game, dispatch } = useGame();
  const run = game.run;
  const menu = menuFor(run);
  const order = packingOrder(run);
  const count = run.packed.length;
  const catalog = { ...foods, dish: { name: menu.name, image: menu.image } };
  const [notice, setNotice] = useState(
    "Start with the cooked dish, then add the extras in ticket order.",
  );
  function add(id) {
    if (count === order.length) return;
    const correct = order[count] === id;
    dispatch({ type: "PACK", id });
    sound(correct ? "pack" : "error");
    setNotice(
      correct
        ? `${catalog[id].name} packed! ${count === 3 ? "Your lunch is complete." : "Check the next item on your ticket."}`
        : `Not yet! Add ${catalog[order[count]].name} next. Your tray is unchanged.`,
    );
  }
  return (
    <Shell phase="PACKING · FOLLOW THE TICKET" step={3}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">02 / 03 · THE PACKING LINE</span>
          <h1>
            A little order.
            <br />
            <em>A complete lunch.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>PORTIONS PACKED</span>
          <b>
            {count}
            <small> / {order.length}</small>
          </b>
        </div>
      </div>
      <section className="modern-game-layout">
        <div className="scene-card packing-board">
          <div className="scene-topline">
            <span>YOUR LUNCH TRAY</span>
            <b>{menu.name}</b>
          </div>
          <p className="packing-next" role="status">
            {count < order.length
              ? `Next: ${catalog[order[count]].name} · step ${count + 1} of ${order.length}`
              : "Complete! Seal your lunch box."}
          </p>
          <div className="lunch-tray" aria-label="Packed meal">
            {order.map((id, i) => (
              <div
                className={`tray-slot ${i < count ? "filled" : ""}`}
                key={id}
              >
                {i < count ? (
                  <>
                    <ModelImage asset={catalog[id].image} decorative />
                    <b>
                      {id === "dish" ? `Cooked ${menu.name}` : catalog[id].name}
                    </b>
                  </>
                ) : (
                  <>
                    <span>{i + 1}</span>
                    <small>{i === count ? "Next portion" : "Waiting"}</small>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="ingredient-grid packing-choices">
            {["milk", "fruit", "dish", "vegetable"].map((id) => (
              <button
                key={id}
                disabled={run.packed.includes(id)}
                onClick={() => add(id)}
              >
                <ModelImage asset={catalog[id].image} decorative />
                <span>
                  {id === "dish" ? `Cooked ${menu.name}` : catalog[id].name}{" "}
                  {run.packed.includes(id) ? "✓" : "+"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <aside className="task-card">
          <span className="eyebrow">ROULETTE’S PACKING INSTRUCTIONS</span>
          <h2>Follow this order.</h2>
          <p>
            First the cooked dish, then the extras. Each recipe has its own
            order. Pack one complete meal kit for the school.
          </p>
          <ol className="packing-ticket">
            {order.map((id, i) => (
              <li
                key={id}
                className={
                  i < count ? "finished" : i === count ? "current" : ""
                }
              >
                <span>{i < count ? "✓" : i + 1}</span>
                <b>{catalog[id].name}</b>
                <small>
                  {i === count ? "NEXT" : i < count ? "PACKED" : ""}
                </small>
              </li>
            ))}
          </ol>
          <p className="game-notice" role="status">
            {notice}
          </p>
          <Button
            disabled={count !== order.length}
            onClick={() => {
              dispatch({ type: "DELIVERY" });
              sound("start");
              go("/delivery");
            }}
          >
            Seal the box & choose destination →
          </Button>
        </aside>
      </section>
    </Shell>
  );
}
