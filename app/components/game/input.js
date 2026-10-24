import { useEffect, useRef } from "react";
const allowed = [
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "w",
  "a",
  "s",
  "d",
  " ",
];
export function useGameInput() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => {
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) ||
        e.target.isContentEditable
      )
        return;
      const key = e.key.toLowerCase();
      if (key === " " && /^(BUTTON|A)$/.test(e.target.tagName)) return;
      if (allowed.includes(key)) {
        e.preventDefault();
        keys.current[key] = true;
      }
    };
    const up = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    const clear = () => {
      keys.current = {};
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, []);
  return keys;
}
export function holdKey(keys, key) {
  return {
    onPointerDown(e) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      keys.current[key] = true;
    },
    onPointerUp() {
      keys.current[key] = false;
    },
    onPointerCancel() {
      keys.current[key] = false;
    },
    onLostPointerCapture() {
      keys.current[key] = false;
    },
    onKeyDown(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        keys.current[key] = true;
      }
    },
    onKeyUp() {
      keys.current[key] = false;
    },
    onBlur() {
      keys.current[key] = false;
    },
  };
}
