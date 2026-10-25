let context;
let muted = false;
const active = new Set();
export function muteAudio(value) {
  muted = value;
  if (value)
    for (const source of active) {
      try {
        source.stop();
      } catch {}
    }
}
export function unlockAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    context ??= new Audio();
    if (context.state === "suspended") void context.resume().catch(() => {});
  } catch {
    /* Audio is optional; gameplay still works. */
  }
}
export function sound(kind) {
  if (muted || typeof window === "undefined" || document.hidden) return;
  unlockAudio();
  if (!context || context.state !== "running") return;
  const notes = {
    tick: [540],
    select: [440, 660],
    error: [160, 120],
    chop: [180],
    cook: [260, 330, 390],
    pack: [520, 780],
    start: [220, 330, 440],
    engine: [65],
    boost: [180, 360, 720],
    bump: [90, 60],
    success: [523, 659, 784, 1047, 784, 1047],
  }[kind] || [440];
  notes.forEach((frequency, index) => {
    const at = context.currentTime + index * 0.11;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = ["chop", "bump", "engine"].includes(kind)
      ? "triangle"
      : "sine";
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(
      kind === "engine" ? 0.035 : 0.09,
      at + 0.008,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
    oscillator.connect(gain).connect(context.destination);
    active.add(oscillator);
    oscillator.onended = () => {
      active.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(at);
    oscillator.stop(at + 0.18);
  });
  if (["cook", "chop"].includes(kind)) {
    const duration = kind === "cook" ? 0.45 : 0.07;
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * duration),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = kind === "cook" ? 0.025 : 0.12;
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    active.add(source);
    source.onended = () => {
      active.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }
}
