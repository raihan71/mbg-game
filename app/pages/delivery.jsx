import {
  ArrowRight,
  Pause,
  Play,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import { lazy, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";
import Stage from "../components/game/stage";
const DeliveryScene = lazy(() => import("../components/game/delivery-scene"));
import { useGameInput, holdKey } from "../components/game/input";
import { useGame } from "../components/game-provider";
import Roulette from "../components/game/roulette";
import { countries, countryFor } from "../lib/game";
import { sound, stopSound } from "../lib/audio";
import { createDrive } from "../lib/driving";
export default function Delivery() {
  const go = useNavigate();
  const keys = useGameInput();
  const { game, dispatch } = useGame();
  const run = game.run;
  const country = countryFor(run);
  const simulation = useRef(null);
  if (!simulation.current)
    simulation.current = run.drive ? structuredClone(run.drive) : createDrive();
  const [hud, setHud] = useState(() => ({ ...simulation.current }));
  const [paused, setPaused] = useState(!!run.drive);
  const lastSave = useRef(hud.elapsed);
  const lastCue = useRef({ hits: hud.hits, boost: false, event: false });
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;
  useEffect(() => {
    if (!country) return;
    const save = () =>
      dispatchRef.current({ type: "DRIVE", drive: simulation.current });
    const hide = () => {
      if (document.hidden) {
        setPaused(true);
        save();
      }
    };
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", hide);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [country]);
  function update(next) {
    setHud(next);
    if (next.hits > lastCue.current.hits) sound("bump");
    if (next.boost && !lastCue.current.boost) sound("boost");
    if (next.event && !lastCue.current.event) sound("horn");
    lastCue.current = { hits: next.hits, boost: next.boost, event: next.event };
    if (next.done || next.elapsed - lastSave.current >= 1) {
      lastSave.current = next.elapsed;
      dispatch({ type: "DRIVE", drive: next });
      if (next.done) {
        sound("success");
        go("/results");
      }
    }
  }
  useEffect(() => {
    if (!country || paused || hud.speed < 1 || hud.event || hud.done) return;
    sound("engine");
    const timer = setInterval(() => sound("engine"), 450);
    return () => {
      clearInterval(timer);
      stopSound("engine");
    };
  }, [country, paused, hud.speed >= 1, hud.event, hud.done]);
  if (!country)
    return (
      <Shell phase="DESTINATION ROULETTE" step={4}>
        <section className="mission-layout">
          <div className="mission-copy">
            <span className="eyebrow">LUNCH IS READY TO TRAVEL</span>
            <h1>
              Where to,
              <br />
              <em>little van?</em>
            </h1>
            <p>
              Spin to choose a country. Your van will make the final school run
              in the selected city.
            </p>
          </div>
          <Roulette
            items={countries}
            title="SCHOOL DELIVERY ROULETTE"
            onPick={(item) => {
              dispatch({ type: "COUNTRY", id: item.id });
              sound("start");
            }}
          />
        </section>
      </Shell>
    );
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
              <i className="live-dot" /> {country.flag}{" "}
              {country.city.toUpperCase()}
            </span>
            <button
              onClick={() => {
                sound("select");
                setPaused((v) => !v);
                dispatch({ type: "DRIVE", drive: simulation.current });
              }}
            >
              {paused ? "Resume" : "Pause"}{" "}
              {paused ? (
                <Play aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
            </button>
          </div>
          <Stage label="Top-down driving game. Avoid traffic while delivering meals to school.">
            <DeliveryScene
              simulation={simulation}
              keys={keys}
              paused={paused}
              onUpdate={update}
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
                  sound("start");
                  dispatch({ type: "DRIVE", drive: simulation.current });
                  setPaused(false);
                }}
              >
                {hud.event ? "Take detour · +5 sec" : "Back to the road"}{" "}
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
          <div className="driving-buttons">
            {[
              ["a", "left", ArrowLeft, "Steer left"],
              ["w", "up", ArrowUp, "Accelerate"],
              ["s", "down", ArrowDown, "Brake"],
              ["d", "right", ArrowRight, "Steer right"],
              [" ", "boost", Zap, "Boost"],
            ].map(([key, label, Icon, title]) => (
              <button key={key} aria-label={title} {...holdKey(keys, key)}>
                <Icon aria-hidden="true" />
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
          <h2>{country.school}</h2>
          <p>
            {country.flag} {country.city}, {country.name}
          </p>
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
