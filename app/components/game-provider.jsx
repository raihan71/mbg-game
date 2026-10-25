import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router";
import {
  gameReducer,
  initialGame,
  parseGame,
  runPath,
  SAVE_KEY,
} from "../lib/game";
import { muteAudio, unlockAudio } from "../lib/audio";
const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);
export default function GameProvider({ children }) {
  const [game, setGame] = useState(initialGame);
  const current = useRef(game);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading progress…");
  const [offline, setOffline] = useState("Preparing offline play…");
  const [muted, setMuted] = useState(false);
  const location = useLocation();
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const saved = raw ? parseGame(raw) : initialGame();
      const next = saved || initialGame();
      next.best = Math.max(
        next.best,
        Number.isFinite(Number(localStorage.getItem("mbg-best")))
          ? Math.max(0, Number(localStorage.getItem("mbg-best")))
          : 0,
      );
      current.current = next;
      setGame(next);
      const silent = localStorage.getItem("mbg-muted") === "true";
      setMuted(silent);
      muteAudio(silent);
      setSaveStatus(
        raw && !saved
          ? "Old save could not be loaded. Start a new adventure."
          : "Progress saved on this device",
      );
    } catch {
      setSaveStatus("Storage unavailable · progress lasts for this visit");
    }
    setReady(true);
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  useEffect(() => {
    if (!import.meta.env.PROD) {
      setOffline("Offline download available in production build");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      setOffline("Offline play unavailable in this browser");
      return;
    }
    let live = true;
    const update = () => {
      if (live)
        setOffline(
          navigator.onLine ? "Ready to play offline" : "Playing offline",
        );
    };
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "redundant" && live)
            setOffline(
              "Offline download failed · reconnect and reload to retry",
            );
        });
        await navigator.serviceWorker.ready;
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
      })
      .catch(() => {
        if (live)
          setOffline("Offline download failed · reconnect and reload to retry");
      });
    return () => {
      live = false;
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  function dispatch(action) {
    const next = gameReducer(current.current, action);
    if (next === current.current) return;
    current.current = next;
    setGame(next);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      localStorage.setItem("mbg-best", String(next.best));
      setSaveStatus("Progress saved on this device");
    } catch {
      setSaveStatus("Storage full or unavailable · keep this tab open");
    }
  }
  function toggleSound() {
    const next = !muted;
    setMuted(next);
    muteAudio(next);
    unlockAudio();
    try {
      localStorage.setItem("mbg-muted", String(next));
    } catch {}
  }
  const guarded = ["/kitchen", "/packing", "/delivery", "/results"].includes(
    location.pathname,
  );
  const wrongPhase = guarded && location.pathname !== runPath(game.run);
  return (
    <GameContext.Provider
      value={{ game, dispatch, ready, saveStatus, offline, muted, toggleSound }}
    >
      {guarded && !ready ? (
        <main className="app-shell">
          <p role="status">Loading your adventure…</p>
        </main>
      ) : wrongPhase ? (
        <Navigate replace to={runPath(game.run)} />
      ) : (
        children
      )}
    </GameContext.Provider>
  );
}
