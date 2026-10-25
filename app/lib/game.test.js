import test from "node:test";
import assert from "node:assert/strict";
import {
  gameReducer as reduce,
  initialGame,
  menus,
  packingOrder,
  parseGame,
  runPath,
} from "./game.js";
import { createDrive } from "./driving.js";
function cooked(menu = menus[0]) {
  let s = reduce(initialGame(), { type: "NEW", menuId: menu.id });
  for (const id of menu.ingredients) s = reduce(s, { type: "INGREDIENT", id });
  for (let stage = 0; stage < 4; stage++)
    s = reduce(s, { type: "STATION", stage });
  return reduce(s, { type: "PACKING" });
}
test("all menus require correct ingredients and ordered extras", () => {
  for (const menu of menus) {
    let s = reduce(initialGame(), { type: "NEW", menuId: menu.id });
    assert.equal(reduce(s, { type: "STATION", stage: 0 }), s);
    s = reduce(s, { type: "INGREDIENT", id: "milk" });
    assert.equal(s.run.mistakes, 1);
    assert.equal(s.run.selected.length, 0);
    s = reduce(s, { type: "INGREDIENT", id: menu.ingredients[0] });
    assert.equal(reduce(s, { type: "INGREDIENT", id: menu.ingredients[0] }), s);
    s = cooked(menu);
    assert.equal(reduce(s, { type: "DELIVERY" }), s);
    s = reduce(s, { type: "PACK", id: menu.extras[0] });
    assert.equal(s.run.mistakes, 1);
    assert.deepEqual(s.run.packed, []);
    for (const id of packingOrder(s.run)) s = reduce(s, { type: "PACK", id });
    assert.equal(s.run.packed.length, 4);
    s = reduce(s, { type: "DELIVERY" });
    assert.equal(s.run.phase, "delivery");
    assert.deepEqual(parseGame(JSON.stringify(s)), s);
  }
});
test("phase guards reject bypasses and repeated station completions", () => {
  let s = reduce(initialGame(), { type: "NEW", menuId: "chicken" });
  for (const type of ["PACKING", "DELIVERY", "COUNTRY", "DRIVE"])
    assert.equal(reduce(s, { type, id: "id", drive: createDrive() }), s);
  for (const id of menus[0].ingredients)
    s = reduce(s, { type: "INGREDIENT", id });
  s = reduce(s, { type: "STATION", stage: 0 });
  assert.equal(reduce(s, { type: "STATION", stage: 0 }), s);
  assert.equal(runPath(s.run), "/kitchen");
});
test("drive snapshots are independent, completion awards once, next day retains best", () => {
  let s = cooked();
  for (const id of packingOrder(s.run)) s = reduce(s, { type: "PACK", id });
  s = reduce(s, { type: "DELIVERY" });
  s = reduce(s, { type: "COUNTRY", id: "jp" });
  assert.equal(reduce(s, { type: "COUNTRY", id: "gb" }), s);
  const drive = createDrive();
  drive.distance = 1;
  s = reduce(s, { type: "DRIVE", drive });
  drive.traffic[0].y = 99;
  assert.notEqual(s.run.drive.traffic[0].y, 99);
  drive.done = true;
  drive.distance = 0;
  drive.elapsed = 110;
  drive.hits = 2;
  s = reduce(s, { type: "DRIVE", drive });
  assert.equal(s.run.score, 9600);
  assert.equal(s.best, 9600);
  assert.equal(reduce(s, { type: "DRIVE", drive }), s);
  assert.deepEqual(parseGame(JSON.stringify(s)), s);
  s = reduce(s, { type: "NEW", menuId: "eggs" });
  assert.equal(s.day, 2);
  assert.equal(s.best, 9600);
  assert.equal(s.run.stage, 0);
});
test("invalid saves are rejected without throwing", () => {
  for (const raw of [null, "broken", "{}", '{"version":9}'])
    assert.equal(parseGame(raw), null);
  const s = cooked();
  s.run.packed = ["milk", "dish"];
  assert.equal(parseGame(JSON.stringify(s)), null);
  s.run.packed = [];
  s.run.phase = "results";
  assert.equal(parseGame(JSON.stringify(s)), null);
});
