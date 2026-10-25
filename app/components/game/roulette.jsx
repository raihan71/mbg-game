import { useEffect, useRef, useState } from "react";
import Button from "../../elements/button";
import ModelImage from "../model-image";
import { sound } from "../../lib/audio";
export default function Roulette({ items, title, onPick }) {
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef();
  const locked = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  function spin() {
    if (locked.current) return;
    locked.current = true;
    setSpinning(true);
    const target = Math.floor(Math.random() * items.length);
    const steps =
      items.length * 5 + ((target - index + items.length) % items.length);
    let count = 0;
    function tick() {
      count++;
      setIndex((index + count) % items.length);
      sound("tick");
      if (count < steps)
        timer.current = setTimeout(tick, 45 + (count / steps) ** 3 * 220);
      else {
        sound("select");
        onPick(items[target]);
      }
    }
    tick();
  }
  const item = items[index];
  return (
    <section className={`roulette-card ${spinning ? "is-spinning" : ""}`}>
      <span className="eyebrow">{title}</span>
      <div className="roulette-pointer" aria-hidden="true">
        ▼
      </div>
      <div className="roulette-window" aria-hidden={spinning}>
        {item.image ? (
          <ModelImage asset={item.image} className="roulette-image" />
        ) : (
          <span className="country-flag">{item.flag}</span>
        )}
        <h2>{item.name}</h2>
        <p>{item.city || "A fresh lunch adventure awaits."}</p>
      </div>
      <div className="roulette-options">
        {items.map((option, i) => (
          <span className={index === i ? "active" : ""} key={option.id}>
            {option.name}
          </span>
        ))}
      </div>
      <Button disabled={spinning} onClick={spin}>
        {spinning ? "Spinning…" : "Spin the roulette"} <span>↻</span>
      </Button>
      <p role="status">
        {spinning
          ? "Finding your next adventure…"
          : "Your result is saved as soon as the wheel stops."}
      </p>
    </section>
  );
}
