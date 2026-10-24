export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function createDrive() {
  return {
    x: 0,
    speed: 0,
    nitro: 100,
    distance: 2.8,
    elapsed: 0,
    scroll: 0,
    hits: 0,
    cooldown: 0,
    detourSeen: false,
    event: false,
    done: false,
    boost: false,
    traffic: [
      { x: -2.4, y: 6 },
      { x: 2.4, y: 12 },
      { x: 0, y: 19 },
    ],
  };
}
export function stepDrive(s, keys, delta, random = Math.random) {
  if (s.event || s.done) return;
  const dt = clamp(delta, 0, 0.05);
  s.elapsed += dt;
  const accelerating = keys.w || keys.arrowup;
  s.boost = !!(keys[" "] && s.nitro > 1 && accelerating);
  s.speed = clamp(
    s.speed +
      dt *
        (keys.s || keys.arrowdown
          ? -65
          : accelerating
            ? s.boost
              ? 62
              : 34
            : -18),
    0,
    s.boost ? 125 : 100,
  );
  s.nitro = clamp(s.nitro + dt * (s.boost ? -24 : 9), 0, 100);
  const steering =
    Number(!!(keys.d || keys.arrowright)) -
    Number(!!(keys.a || keys.arrowleft));
  s.x = clamp(s.x + steering * dt * 4.6, -3.25, 3.25);
  s.distance = Math.max(0, s.distance - (s.speed * dt) / 1800);
  s.scroll = (s.scroll + s.speed * dt * 0.075) % 3;
  s.cooldown = Math.max(0, s.cooldown - dt);
  for (const car of s.traffic) {
    car.y -= s.speed * dt * 0.075;
    if (
      Math.abs(car.x - s.x) < 1.05 &&
      Math.abs(car.y + 2.8) < 1.65 &&
      s.cooldown === 0 &&
      s.speed > 0
    ) {
      s.speed *= 0.45;
      s.hits++;
      s.cooldown = 1.5;
    }
    if (car.y < -7) {
      car.y = 7 + random() * 9;
      car.x = [-2.4, 0, 2.4][Math.floor(random() * 3)];
    }
  }
  if (s.distance <= 1.65 && !s.detourSeen) {
    s.detourSeen = true;
    s.event = true;
    s.boost = false;
  }
  if (s.distance <= 0) {
    s.done = true;
    s.speed = 0;
    s.boost = false;
  }
}
