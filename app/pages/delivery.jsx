import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Art from "../components/art";
import Shell from "../components/shell";
import Button from "../elements/button";

export default function Delivery() {
  const go = useNavigate();
  const [x, setX] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(2.8);
  const [event, setEvent] = useState(false);
  const [done, setDone] = useState(false);
  const frame = useRef();
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!event && !done) {
        if (keys.current.arrowup || keys.current.w) {
          setSpeed((v) => Math.min(100, v + dt * 32));
          setDistance((d) => Math.max(0, d - dt * 0.045));
        } else setSpeed((v) => Math.max(0, v - dt * 20));
        if (keys.current.arrowleft || keys.current.a)
          setX((v) => Math.max(15, v - dt * 25));
        if (keys.current.arrowright || keys.current.d)
          setX((v) => Math.min(85, v + dt * 25));
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [event, done]);
  useEffect(() => {
    if (distance <= 1.65 && !event) {
      setEvent(true);
    }
    if (distance === 0 && !done) {
      setDone(true);
      go("/results?late=1");
    }
  }, [distance, event, done, go]);
  return (
    <Shell phase="DELIVERY · ROUTE 03" step={4}>
      <div className="game-heading delivery-heading">
        <div>
          <span className="eyebrow">PHASE 03 / 03</span>
          <h1>
            On the road. <em>On paper.</em>
          </h1>
        </div>
        <div className="hud-chip">
          <span>TIME LEFT</span>
          <b>08:42</b>
        </div>
      </div>
      <section className="drive-layout">
        <div className="drive-scene">
          <div className="drive-sky">
            <span className="cloud cloud-a" />
            <span className="cloud cloud-b" />
            <span className="sun" />
          </div>
          <div className="town town-back">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="roadside">
            <span>
              WARUNG
              <br />
              <b>BU SARI</b>
            </span>
            <i>🌴</i>
            <i>🌳</i>
          </div>
          <div className="road">
            <div className="road-edge" />
            <div className="road-stripe stripe-a" />
            <div className="road-stripe stripe-b" />
            <div className="road-stripe stripe-c" />
            <div className="road-lane" />
            <div className="road-edge right" />
          </div>
          <div
            className="drive-car"
            style={{
              left: `${x}%`,
              transform: `translateX(-50%) translateY(${speed > 5 ? Math.sin(Date.now() / 80) * 2 : 0}px)`,
            }}
          >
            <Art mode="van" />
          </div>
          <div className="drive-hud">
            <div>
              <span>DESTINATION</span>
              <b>SD MERDEKA</b>
            </div>
            <div>
              <span>DISTANCE</span>
              <b>
                {distance.toFixed(1)} <small>KM</small>
              </b>
            </div>
            <div>
              <span>FRESHNESS</span>
              <b>94%</b>
            </div>
          </div>
          {!event && (
            <div className="gps-tip">
              ↑&nbsp; HOLD TO DRIVE &nbsp; · &nbsp; A/D TO STEER
            </div>
          )}
          {event && (
            <div className="obstacle">
              <span className="obstacle-tag">UNSCHEDULED TREE MEETING</span>
              <div className="tree-emoji">🌳</div>
              <h2>ROAD UPDATE</h2>
              <p>
                Tree: <b>1</b>
                <br />
                Your delivery van: <b>0</b>
              </p>
              <Button
                variant="dark"
                onClick={() => {
                  setDistance((d) => Math.max(0.2, d - 0.1));
                  setEvent(false);
                }}
              >
                Take the tiny detour <span>↗</span>
              </Button>
            </div>
          )}
        </div>
        <aside className="route-card">
          <div className="route-top">
            <span className="eyebrow">ROUTE STATUS</span>
            <span className="live">
              <i /> LIVE
            </span>
          </div>
          <div className="route-destination">
            <span className="pin">⌖</span>
            <div>
              <small>DELIVERING TO</small>
              <b>SD Merdeka</b>
            </div>
          </div>
          <div className="route-progress">
            <div className="route-line">
              <span
                style={{
                  height: `${Math.max(12, ((2.8 - distance) / 2.8) * 100)}%`,
                }}
              />
            </div>
            <div className="route-marks">
              <span>
                <b>KITCHEN</b>
                <small>08:11</small>
              </span>
              <span>
                <b>YOU ARE HERE</b>
                <small>{distance.toFixed(1)} KM LEFT</small>
              </span>
              <span>
                <b>SCHOOL</b>
                <small>BY 10:30</small>
              </span>
            </div>
          </div>
          <div className="vehicle-status">
            <div>
              <span>VEHICLE</span>
              <b>ALL SYSTEMS MOSTLY GO</b>
            </div>
            <div className="vehicle-bar">
              <i />
            </div>
          </div>
          <div className="route-controls">
            <span>CONTROLS</span>
            <div>
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
              <small>or WASD</small>
            </div>
          </div>
          <button className="arrive-button" onClick={() => go("/results")}>
            Arrive at school <span>↗</span>
          </button>
        </aside>
      </section>
      <div className="stage-note">
        <span>THE SHORTEST ROUTE IS A MATTER OF OPINION.</span>
        <span>DRIVE CAREFULLY · FOOD FIRST</span>
      </div>
    </Shell>
  );
}
