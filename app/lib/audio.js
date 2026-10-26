import { soundFiles, soundUrl } from "../configs/sound-assets.js";
const recordings = new Map();
const playingRecordings = new Map();
export function stopSound(kind) {
  const source = playingRecordings.get(kind);
  if (source) {
    try {
      source.stop();
    } catch {}
    playingRecordings.delete(kind);
  }
}
const loadingRecordings = new Set();
function loadRecordings() {
  for (const id of Object.keys(soundFiles)) {
    if (recordings.has(id) || loadingRecordings.has(id)) continue;
    loadingRecordings.add(id);
    fetch(soundUrl(id))
      .then((response) => {
        if (!response.ok) throw new Error("Sound unavailable");
        return response.arrayBuffer();
      })
      .then((bytes) => context.decodeAudioData(bytes))
      .then((buffer) => recordings.set(id, buffer))
      .catch(() => {})
      .finally(() => loadingRecordings.delete(id));
  }
}
let recipes = {};
let recipesRequest;
export function loadSounds() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!recipesRequest) {
    recipesRequest = fetch("/api/assets/sounds")
      .then((response) => {
        if (!response.ok) throw new Error("Sound assets unavailable");
        return response.json();
      })
      .then((data) => {
        recipes = data;
      })
      .catch(() => {
        recipesRequest = undefined;
      });
  }
  return recipesRequest;
}

let context;
let master;
let noiseBuffer;
let muted = false;
const active = new Set();
const lastPlayed = new Map();

export function muteAudio(value) {
  muted = value;
  if (master)
    master.gain.setTargetAtTime(value ? 0 : 0.55, context.currentTime, 0.015);
  if (value) {
    for (const source of active) {
      try {
        source.stop();
      } catch {}
    }
    lastPlayed.clear();
  }
}

export function unlockAudio() {
  void loadSounds();
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!context) {
      context = new Audio();
      master = context.createGain();
      master.gain.value = muted ? 0 : 0.55;
      const limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -18;
      limiter.ratio.value = 4;
      master.connect(limiter).connect(context.destination);
      noiseBuffer = context.createBuffer(
        1,
        context.sampleRate * 2,
        context.sampleRate,
      );
      const samples = noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.random() * 2 - 1;
    }
    loadRecordings();
    if (context.state === "suspended") void context.resume().catch(() => {});
  } catch {
    // Audio is optional; gameplay still works.
  }
}

// Every voice has a soft attack and release, and disconnects when finished.
function voice(source, at, duration, level, filter) {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(
    level,
    at + Math.min(0.025, duration / 5),
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  if (filter) source.connect(filter).connect(envelope);
  else source.connect(envelope);
  envelope.connect(master);
  active.add(source);
  source.onended = () => {
    active.delete(source);
    source.disconnect();
    filter?.disconnect();
    envelope.disconnect();
  };
  source.start(at);
  source.stop(at + duration + 0.02);
}
function tone(
  at,
  frequency,
  duration = 0.2,
  level = 0.1,
  end = frequency,
  type = "sine",
) {
  const source = context.createOscillator();
  source.type = type;
  source.frequency.setValueAtTime(frequency, at);
  source.frequency.exponentialRampToValueAtTime(end, at + duration);
  voice(source, at, duration, level);
}
function noise(
  at,
  duration,
  frequency,
  level,
  type = "bandpass",
  end = frequency,
) {
  const source = context.createBufferSource();
  source.buffer = noiseBuffer;
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.Q.value = 0.65;
  filter.frequency.setValueAtTime(frequency, at);
  filter.frequency.exponentialRampToValueAtTime(end, at + duration);
  voice(source, at, duration, level, filter);
}
function chime(at, notes, spacing = 0.09, level = 0.1) {
  notes.forEach((frequency, i) => {
    tone(at + i * spacing, frequency, 0.32, level);
    tone(at + i * spacing, frequency * 2, 0.14, level * 0.16);
  });
}

export function sound(kind) {
  if (muted || typeof window === "undefined" || document.hidden) return;
  unlockAudio();
  if (!context || context.state !== "running") return;
  const at = context.currentTime;
  const cooldown =
    kind === "success"
      ? 1.2
      : kind === "engine"
        ? 0.4
        : kind === "footstep"
          ? 0.2
          : 0.035;
  if (at - (lastPlayed.get(kind) ?? -Infinity) < cooldown) return;
  lastPlayed.set(kind, at);
  if (recordings.has(kind)) {
    if (playingRecordings.has(kind)) return;
    const source = context.createBufferSource();
    source.buffer = recordings.get(kind);
    source.loop = kind === "engine";
    const envelope = context.createGain();
    const level = kind === "engine" ? 0.12 : 0.3;
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(level, at + 0.015);
    if (!source.loop) {
      envelope.gain.setValueAtTime(
        level,
        at + Math.max(0.015, source.buffer.duration - 0.03),
      );
      envelope.gain.linearRampToValueAtTime(0, at + source.buffer.duration);
    }
    source.connect(envelope).connect(master);
    active.add(source);
    playingRecordings.set(kind, source);
    source.onended = () => {
      active.delete(source);
      if (playingRecordings.get(kind) === source)
        playingRecordings.delete(kind);
      source.disconnect();
      envelope.disconnect();
    };
    source.start(at);
    return true;
  }
  for (const [type, offset, ...args] of recipes[kind] ?? []) {
    const play = { tone, noise, chime }[type];
    play?.(at + offset, ...args);
  }
}
