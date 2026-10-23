import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/shell";
import Button from "../elements/button";

const lanePositions = [28, 50, 72];

export default function Delivery() {
  const go = useNavigate();
  const [x, setX] = useState(50);
  const [speed, setSpeed] = useState(0);
  const [nitro, setNitro] = useState(100);
  const [distance, setDistance] = useState(2.8);
  const [roadShift, setRoadShift] = useState(0);
  const [traffic, setTraffic] = useState([
    { id: 1, x: 28, y: 15, icon: "🛵" },
    { id: 2, x: 72, y: -38, icon: "🛺" },
  ]);
  const [event, setEvent] = useState(false);
  const [done, setDone] = useState(false);
  const frame = useRef();
  const keys = useRef({});
  const xRef = useRef(x);
  const speedRef = useRef(speed);
  const nitroRef = useRef(nitro);
  const hitAt = useRef(0);

  useEffect(() => {
    xRef.current = x;
  }, [x]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    nitroRef.current = nitro;
  }, [nitro]);

  useEffect(() => {
    const down = (e) => {
      const key = e.key.toLowerCase();
      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
          " ",
        ].includes(key)
      )
        e.preventDefault();
      keys.current[key] = true;
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
        const boost = keys.current[" "] && nitroRef.current > 0;
        if (keys.current.arrowup || keys.current.w) {
          setSpeed((v) =>
            Math.min(boost ? 125 : 100, v + dt * (boost ? 52 : 32)),
          );
          setDistance((d) =>
            Math.max(
              0,
              d - dt * (0.012 + (boost ? 0.05 : speedRef.current * 0.00055)),
            ),
          );
        } else if (keys.current.arrowdown || keys.current.s) {
          setSpeed((v) => Math.max(0, v - dt * 35));
        } else {
          setSpeed((v) => Math.max(0, v - dt * 15));
        }
        if (boost) setNitro((v) => Math.max(0, v - dt * 22));
        else setNitro((v) => Math.min(100, v + dt * 3));
        if (keys.current.arrowleft || keys.current.a)
          setX((v) => Math.max(22, v - dt * 31));
        if (keys.current.arrowright || keys.current.d)
          setX((v) => Math.min(78, v + dt * 31));

        setRoadShift((v) => (v + dt * (4 + speedRef.current * 0.11)) % 100);
        setTraffic((cars) =>
          cars.map((car) => {
            const nextY = car.y + dt * (18 + speedRef.current * 0.42);
            const hit =
              Math.abs(car.x - xRef.current) < 11 && nextY > 67 && nextY < 88;
            if (hit && now - hitAt.current > 900) {
              hitAt.current = now;
              setSpeed((v) => Math.max(8, v - 24));
            }
            if (nextY > 110) {
              return {
                ...car,
                x: lanePositions[
                  Math.floor(Math.random() * lanePositions.length)
                ],
                y: -18 - Math.random() * 30,
                icon: Math.random() > 0.5 ? "🛵" : "🛺",
              };
            }
            return { ...car, y: nextY };
          }),
        );
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
    if (distance <= 1.65 && !event) setEvent(true);
    if (distance <= 0 && !done) {
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
            <div
              className="road-stripe stripe-a"
              style={{ transform: `translateY(${roadShift}%)` }}
            />
            <div
              className="road-stripe stripe-b"
              style={{ transform: `translateY(${roadShift}%)` }}
            />
            <div
              className="road-stripe stripe-c"
              style={{ transform: `translateY(${roadShift}%)` }}
            />
            <div className="road-lane" />
            <div className="road-edge right" />
            {traffic.map((car) => (
              <div
                className="traffic-car"
                key={car.id}
                style={{ left: `${car.x}%`, top: `${car.y}%` }}
              >
                {car.icon}
              </div>
            ))}
          </div>
          <div
            className={`drive-car ${speed > 55 ? "is-racing" : ""}`}
            style={{
              left: `${x}%`,
              transform: `translateX(-50%) translateY(${speed > 5 ? Math.sin(Date.now() / 80) * 2 : 0}px)`,
            }}
          >
            <img src="/models/delivery-racer.png" alt="Food delivery racer" />
            <span className="car-speed-lines" />
          </div>
          <div className="drive-hud">
            <div>
              <span>DESTINATION</span>
              <b>SD MERDEKA</b>
            </div>
            <div>
              <span>SPEED</span>
              <b>
                {Math.round(speed)} <small>KM/H</small>
              </b>
            </div>
            <div>
              <span>DISTANCE</span>
              <b>
                {distance.toFixed(1)} <small>KM</small>
              </b>
            </div>
            <div>
              <span>NITRO</span>
              <b>{Math.round(nitro)}%</b>
            </div>
          </div>
          {!event && (
            <div className="gps-tip">
              ↑&nbsp; HOLD TO DRIVE &nbsp; · &nbsp; A/D TO STEER &nbsp; · &nbsp;
              SPACE NITRO
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
                Your delivery racer: <b>0</b>
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
            <span className="eyebrow">RACE STATUS</span>
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
              <b>{speed > 65 ? "NITRO ENGAGED" : "ALL SYSTEMS MOSTLY GO"}</b>
            </div>
            <div className="vehicle-bar">
              <i style={{ width: `${Math.max(18, nitro)}%` }} />
            </div>
          </div>
          <div className="route-controls">
            <span>CONTROLS</span>
            <div>
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
              <small>WASD + SPACE</small>
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
