// Read browser-only state after hydration, never during the server render.
export function readBest() {
  try {
    const value = Number(localStorage.getItem("mbg-best") || 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch {
    return 0;
  }
}
export function readSafety() {
  try {
    const value = Number(sessionStorage.getItem("mbg-safety") ?? 100);
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 100;
  } catch {
    return 100;
  }
}
