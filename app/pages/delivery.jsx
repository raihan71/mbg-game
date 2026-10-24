import { lazy, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import Stage from "../components/game/stage";
const DeliveryScene = lazy(() => import("../components/game/delivery-scene"));
import { useGameInput, holdKey } from "../components/game/input";
import { createDrive } from "../lib/driving";
export default function Delivery() {
  const go = useNavigate();
  const keys = useGameInput();
  const simulation = useRef(null);
  if (!simulation.current) simulation.current = createDrive();
  const [hud, setHud] = useState(() => createDrive());
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (hud.done) go(hud.elapsed > 100 ? "/results?late=1" : "/results");
  }, [hud.done, hud.elapsed, go]);
  const remaining = Math.max(0, 100 - Math.floor(hud.elapsed));
  return (
    <Shell phase="DELIVERY · SCHOOL RUN" step={4}>
      <div className="game-heading">
        <div>
          <span className="eyebrow">03 / 03 · THE SCHOOL RUN</span>
          <h1>
            Precious cargo. <em>Little van.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>DELIVERY WINDOW</span>
          <b>
            {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </b>
        </div>
      </div>
      <section className="modern-game-layout">
        <div className="scene-card road-scene-card">
          <div className="scene-topline">
            <span>
              <i className="live-dot" /> MERDEKA DISTRICT
            </span>
            <button onClick={() => setPaused((v) => !v)}>
              {paused ? "Resume" : "Pause"} {paused ? "▶" : "Ⅱ"}
            </button>
          </div>
          <Stage label="Top-down driving game. Avoid traffic while delivering meals to school.">
            <DeliveryScene
              simulation={simulation}
              keys={keys}
              paused={paused}
              onUpdate={setHud}
            />
          </Stage>
          <div className="race-overlay">
            <div>
              <small>SPEED</small>
              <b>
                {Math.round(hud.speed)}
                <small> KM/H</small>
              </b>
            </div>
            <div>
              <small>TO SCHOOL</small>
              <b>
                {hud.distance.toFixed(2)}
                <small> KM</small>
              </b>
            </div>
          </div>
          {(hud.event || paused) && (
            <div className="game-modal">
              <span className="eyebrow">
                {hud.event ? "A LITTLE DETOUR" : "TAKE A BREATHER"}
              </span>
              <h2>{hud.event ? "Tree in the road." : "Shift paused."}</h2>
              <p>
                {hud.event
                  ? "The side street is clear. Take the detour and keep those lunches moving."
                  : "Your lunches can wait a moment."}
              </p>
              <Button
                variant="dark"
                onClick={() => {
                  if (hud.event) {
                    simulation.current.event = false;
                    simulation.current.elapsed += 5;
                    setHud({ ...simulation.current });
                  }
                  setPaused(false);
                }}
              >
                {hud.event ? "Take detour · +5 sec" : "Back to the road"} →
              </Button>
            </div>
          )}
          <div className="driving-buttons">
            {[
              ["a", "←", "Steer left"],
              ["w", "↑", "Accelerate"],
              ["s", "↓", "Brake"],
              ["d", "→", "Steer right"],
              [" ", "BOOST", "Boost"],
            ].map(([key, label, title]) => (
              <button key={key} aria-label={title} {...holdKey(keys, key)}>
                {label}
                <small>{title}</small>
              </button>
            ))}
          </div>
          <div className="scene-bottomline">
            WASD / ARROWS · SPACE TO BOOST · HOLD BUTTONS ON TOUCH
          </div>
        </div>
        <aside className="task-card modern-task">
          <span className="eyebrow">NEXT STOP</span>
          <h2>SD Merdeka.</h2>
          <p>
            One hundred lunches, one school waiting. Steer around traffic and
            use your boost on the open stretches.
          </p>
          <div className="delivery-metrics">
            <div>
              <span>ROUTE COMPLETE</span>
              <b>{Math.round(((2.8 - hud.distance) / 2.8) * 100)}%</b>
            </div>
            <div className="mini-progress">
              <span
                style={{ width: `${((2.8 - hud.distance) / 2.8) * 100}%` }}
              />
            </div>
            <div>
              <span>BOOST RESERVE</span>
              <b>{Math.round(hud.nitro)}%</b>
            </div>
            <div className="mini-progress boost-progress">
              <span style={{ width: `${hud.nitro}%` }} />
            </div>
            <div>
              <span>TRAFFIC BUMPS</span>
              <b>{hud.hits}</b>
            </div>
          </div>
          <p className="game-notice" role="status">
            {hud.event
              ? "Route blocked. Choose the detour to continue."
              : hud.cooldown > 0
                ? "Bump! You lost speed. Keep an eye on traffic."
                : hud.boost
                  ? "Boost engaged. Keep your lane clear."
                  : hud.speed < 1
                    ? "Hold ↑ or W to start your delivery."
                    : "Looking good. Keep those meals moving."}
          </p>
          <div className="task-foot">
            ARRIVAL HAPPENS AT THE END OF THE ROUTE.
          </div>
        </aside>
      </section>
    </Shell>
  );
}
