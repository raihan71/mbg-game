import { images } from "../configs/images.js";

export const foods = {
  rice: { name: "Rice", image: images.rice },
  chicken: { name: "Chicken", image: images.chicken },
  egg: { name: "Eggs", image: images.egg },
  onion: { name: "Onion", image: images.onion },
  tomato: { name: "Tomato", image: images.tomato },
  vegetable: { name: "Vegetables", image: images.vegetable },
  fruit: { name: "Fruit", image: images.fruits },
  milk: { name: "Milk", image: images.milk },
};
export const menus = [
  {
    id: "chicken",
    name: "Chicken & rice",
    image: images.cookedChicken,
    ingredients: ["chicken", "onion", "tomato", "rice"],
    extras: ["vegetable", "fruit", "milk"],
  },
  {
    id: "eggs",
    name: "Garden omelette",
    image: {
      src: "/illustrations/omelette.svg",
      alt: "Cooked garden omelette",
    },
    ingredients: ["egg", "tomato", "onion"],
    extras: ["milk", "vegetable", "fruit"],
  },
  {
    id: "garden",
    name: "Vegetable rice",
    image: {
      src: "/illustrations/vegetable-rice.svg",
      alt: "Cooked vegetable rice",
    },
    ingredients: ["vegetable", "onion", "tomato", "rice"],
    extras: ["fruit", "milk", "vegetable"],
  },
];
export const countries = [
  {
    id: "id",
    name: "Indonesia",
    flag: "🇮🇩",
    school: "SD Merdeka",
    city: "Jakarta",
    color: "#c65246",
  },
  {
    id: "jp",
    name: "Japan",
    flag: "🇯🇵",
    school: "Sakura Primary",
    city: "Kyoto",
    color: "#31466a",
  },
  {
    id: "my",
    name: "Malaysia",
    flag: "🇲🇾",
    school: "Sekolah Ceria",
    city: "Kuala Lumpur",
    color: "#324e83",
  },
  {
    id: "gb",
    name: "United Kingdom",
    flag: "🇬🇧",
    school: "Oakwood Primary",
    city: "London",
    color: "#46765f",
  },
];
export const SAVE_KEY = "mbg-adventure-v1";
export const initialGame = () => ({ version: 1, day: 0, best: 0, run: null });
export const menuFor = (run) => menus.find((m) => m.id === run?.menuId);
export const countryFor = (run) =>
  countries.find((c) => c.id === run?.countryId);
export const packingOrder = (run) => ["dish", ...(menuFor(run)?.extras ?? [])];
export function runPath(run) {
  if (!run) return "/mission";
  return `/${run.phase}`;
}
export function gameReducer(state, action) {
  const run = state.run;
  if (action.type === "CANCEL") {
    if (!run || run.phase === "results") return state;
    return { ...state, day: Math.max(0, state.day - 1), run: null };
  }
  if (action.type === "NEW") {
    if (
      (run && run.phase !== "results") ||
      !menus.some((m) => m.id === action.menuId)
    )
      return state;
    return {
      ...state,
      day: state.day + 1,
      run: {
        menuId: action.menuId,
        phase: "kitchen",
        selected: [],
        stage: 0,
        packed: [],
        mistakes: 0,
        countryId: null,
        drive: null,
        score: null,
      },
    };
  }
  if (!run) return state;
  let next = { ...run };
  switch (action.type) {
    case "INGREDIENT": {
      if (
        run.phase !== "kitchen" ||
        run.stage !== 0 ||
        run.selected.includes(action.id)
      )
        return state;
      if (!menuFor(run).ingredients.includes(action.id)) next.mistakes++;
      else next.selected = [...run.selected, action.id];
      break;
    }
    case "STATION":
      if (
        run.phase !== "kitchen" ||
        run.stage >= 4 ||
        action.stage !== run.stage ||
        run.selected.length !== menuFor(run).ingredients.length
      )
        return state;
      next.stage++;
      break;
    case "PACKING":
      if (run.phase !== "kitchen" || run.stage !== 4) return state;
      next.phase = "packing";
      break;
    case "PACK":
      if (
        run.phase !== "packing" ||
        run.packed.length === packingOrder(run).length
      )
        return state;
      if (packingOrder(run)[run.packed.length] !== action.id) next.mistakes++;
      else next.packed = [...run.packed, action.id];
      break;
    case "DELIVERY":
      if (
        run.phase !== "packing" ||
        run.packed.length !== packingOrder(run).length
      )
        return state;
      next.phase = "delivery";
      break;
    case "COUNTRY":
      if (
        run.phase !== "delivery" ||
        run.countryId ||
        !countries.some((c) => c.id === action.id)
      )
        return state;
      next.countryId = action.id;
      break;
    case "DRIVE":
      if (run.phase !== "delivery" || !run.countryId) return state;
      next.drive = structuredClone(action.drive);
      if (action.drive.done && action.drive.distance === 0) {
        next.phase = "results";
        next.score = Math.max(
          0,
          10000 -
            run.mistakes * 200 -
            action.drive.hits * 100 -
            Math.max(0, Math.floor(action.drive.elapsed - 100)) * 20,
        );
        return { ...state, best: Math.max(state.best, next.score), run: next };
      }
      break;
    default:
      return state;
  }
  return { ...state, run: next };
}

// Reject damaged or incompatible saves before they reach a scene.
export function parseGame(raw) {
  try {
    const state = JSON.parse(raw);
    const r = state.run;
    if (
      state.version !== 1 ||
      !Number.isInteger(state.day) ||
      state.day < 0 ||
      !Number.isFinite(state.best) ||
      state.best < 0
    )
      return null;
    if (!r) return { ...state, run: null };
    const m = menuFor(r);
    if (
      !m ||
      !["kitchen", "packing", "delivery", "results"].includes(r.phase) ||
      !Number.isInteger(r.stage) ||
      r.stage < 0 ||
      r.stage > 4 ||
      !Number.isInteger(r.mistakes) ||
      r.mistakes < 0
    )
      return null;
    if (
      !Array.isArray(r.selected) ||
      new Set(r.selected).size !== r.selected.length ||
      r.selected.some((id) => !m.ingredients.includes(id))
    )
      return null;
    if (r.stage > 0 && r.selected.length !== m.ingredients.length) return null;
    if (
      !Array.isArray(r.packed) ||
      r.packed.length > 4 ||
      r.packed.some((id, i) => packingOrder(r)[i] !== id)
    )
      return null;
    if (r.phase !== "kitchen" && r.stage !== 4) return null;
    if (["delivery", "results"].includes(r.phase) && r.packed.length !== 4)
      return null;
    if (r.countryId !== null && !countryFor(r)) return null;
    if (r.drive) {
      const d = r.drive;
      if (
        !r.countryId ||
        ![
          "x",
          "speed",
          "nitro",
          "distance",
          "elapsed",
          "scroll",
          "hits",
          "cooldown",
        ].every((k) => Number.isFinite(d[k])) ||
        d.distance < 0 ||
        d.distance > 2.8 ||
        d.elapsed < 0 ||
        d.hits < 0 ||
        Math.abs(d.x) > 3.25 ||
        d.speed < 0 ||
        d.speed > 125 ||
        d.nitro < 0 ||
        d.nitro > 100 ||
        !["event", "done", "boost", "detourSeen"].every(
          (key) => typeof d[key] === "boolean",
        ) ||
        (d.done && d.distance !== 0) ||
        !Array.isArray(d.traffic) ||
        d.traffic.length !== 5 ||
        d.traffic.some(
          (c) => ![c.x, c.y, c.collisionX, c.collisionY].every(Number.isFinite),
        )
      )
        return null;
    }
    if (
      r.phase === "results" &&
      (!r.drive?.done ||
        r.drive.distance !== 0 ||
        !Number.isFinite(r.score) ||
        r.score < 0)
    )
      return null;
    return state;
  } catch {
    return null;
  }
}
