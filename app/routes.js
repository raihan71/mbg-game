import { index, route } from "@react-router/dev/routes";

export default [
  route("api/assets/:kind/:id?", "api/assets.js"),
  index("pages/home.jsx"),
  route("mission", "pages/mission.jsx"),
  route("kitchen", "pages/kitchen.jsx"),
  route("packing", "pages/packing.jsx"),
  route("delivery", "pages/delivery.jsx"),
  route("results", "pages/results.jsx"),
];
