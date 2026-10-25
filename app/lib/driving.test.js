import test from "node:test";
import assert from "node:assert/strict";
import { createDrive, stepDrive } from "./driving.js";

test("stationary van makes no progress and steering stays on road", () => {
  const s = createDrive();
  for (let i = 0; i < 500; i++) stepDrive(s, { d: true }, 0.016);
  assert.equal(s.distance, 2.8);
  assert.equal(s.x, 3.25);
});
test("coasting advances route, braking decelerates, boost consumes reserve", () => {
  const s = createDrive();
  s.speed = 80;
  s.traffic = [];
  stepDrive(s, {}, 0.05);
  assert.ok(s.distance < 2.8);
  assert.ok(s.speed < 80);
  const before = s.speed;
  stepDrive(s, { s: true }, 0.05);
  assert.ok(s.speed < before);
  stepDrive(s, { w: true, " ": true }, 0.05);
  assert.ok(s.boost);
  assert.ok(s.nitro < 100);
});
test("detour pauses simulation and is only triggered once", () => {
  const s = createDrive();
  s.distance = 1.651;
  s.speed = 100;
  s.traffic = [];
  stepDrive(s, { w: true }, 0.05);
  assert.ok(s.event);
  assert.ok(s.detourSeen);
  const distance = s.distance;
  stepDrive(s, { w: true }, 0.05);
  assert.equal(s.distance, distance);
  s.event = false;
  for (let i = 0; i < 100; i++) stepDrive(s, { w: true }, 0.05);
  assert.equal(s.event, false);
  assert.ok(s.distance < distance);
});
test("collision slows van with cooldown; completed route stops simulation", () => {
  const s = createDrive();
  s.speed = 100;
  s.traffic = [{ x: 0, y: -2.5 }];
  stepDrive(s, { w: true }, 0.016);
  assert.equal(s.hits, 1);
  assert.ok(s.speed < 50);
  stepDrive(s, { w: true }, 0.016);
  assert.equal(s.hits, 1);
  s.detourSeen = true;
  s.distance = 0.00001;
  s.speed = 100;
  stepDrive(s, { w: true }, 0.016);
  assert.ok(s.done);
  assert.equal(s.distance, 0);
  const snapshot = JSON.stringify(s);
  stepDrive(s, { w: true }, 0.05);
  assert.equal(JSON.stringify(s), snapshot);
});
test("travel is consistent across frame rates and large deltas are clamped", () => {
  function run(dt) {
    const s = createDrive();
    s.traffic = [];
    s.speed = 100;
    for (let t = 0; t < 5 - 1e-6; t += dt) stepDrive(s, { w: true }, dt);
    return s.distance;
  }
  assert.ok(Math.abs(run(1 / 30) - run(1 / 120)) < 0.001);
  const s = createDrive();
  stepDrive(s, { w: true }, 10);
  assert.equal(s.elapsed, 0.05);
});

test("delivery includes ambulance, bus and motorcycle with size-aware collisions", () => {
  const s = createDrive();
  assert.equal(s.traffic.length, 5);
  const bus = s.traffic[1];
  const ambulance = s.traffic[3];
  const bike = s.traffic[4];
  assert.ok(bus.collisionY > ambulance.collisionY);
  assert.ok(ambulance.collisionX > bike.collisionX);
  function passVehicle(vehicle, x = 0.95) {
    const drive = createDrive();
    drive.speed = 80;
    drive.traffic = [{ ...vehicle, x, y: -2.8 }];
    stepDrive(drive, { w: true }, 0.016);
    return drive.hits;
  }
  assert.equal(passVehicle(bus), 1);
  assert.equal(passVehicle(ambulance), 1);
  assert.equal(passVehicle(bike), 0);
  assert.equal(passVehicle(bike, 0), 1);
});

test("all traffic obstacles respawn on road and retain their collision sizes", () => {
  const s = createDrive();
  s.traffic.forEach((car) => {
    car.y = -8;
  });
  const bounds = s.traffic.map(({ collisionX, collisionY }) => [
    collisionX,
    collisionY,
  ]);
  stepDrive(s, {}, 0.016, () => 0.5);
  s.traffic.forEach((car, index) => {
    assert.equal(car.x, 0);
    assert.equal(car.y, 11.5);
    assert.deepEqual([car.collisionX, car.collisionY], bounds[index]);
  });
});
