import { ChevronDown, Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useGame } from "./game-provider";

export default function SoundSettings() {
  const { muted, toggleSound, volume, changeVolume } = useGame();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const silent = muted || volume === 0;
  return (
    <div
      className="sound-settings"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="help-button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        {silent ? (
          <VolumeX aria-hidden="true" />
        ) : (
          <Volume2 aria-hidden="true" />
        )}
        Sound{" "}
        <ChevronDown
          className={open ? "sound-chevron open" : "sound-chevron"}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          className="sound-dropdown"
          id={id}
          role="group"
          aria-label="Sound settings"
        >
          <div className="sound-volume-label">
            <label htmlFor={`${id}-volume`}>Volume</label>
            <output htmlFor={`${id}-volume`}>
              {muted ? "Muted" : `${volume}%`}
            </output>
          </div>
          <input
            id={`${id}-volume`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            aria-valuetext={`${volume} percent${muted ? ", muted" : ""}`}
            onChange={(event) => changeVolume(event.target.valueAsNumber)}
          />
          <button
            className="help-button sound-mute"
            onClick={toggleSound}
            aria-pressed={muted}
          >
            {muted ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
            {muted ? "Unmute sound" : "Mute sound"}
          </button>
        </div>
      )}
    </div>
  );
}
