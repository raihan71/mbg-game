import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Chef, Dot, Food, Rect } from "./shapes";
import { brand } from "../../configs/brand";
import Sprite from "./sprite";
import { images } from "../../configs/images";
import { stations } from "../../lib/kitchen";
export default function KitchenScene({
  ingredientAsset = images.chicken,
  dishAsset = images.mealTray,
  keys,
  command,
  onVisit,
  onArrival,
  onComplete,
  onProgress,
  stage,
  busy,
}) {
  const chef = useRef();
  const motion = useRef(false);
  const progress = useRef();
  const elapsed = useRef(0);
  const lastCommand = useRef(null);
  const arrived = useRef(false);
  const completed = useRef(false);
  const report = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (lastCommand.current !== command) {
      lastCommand.current = command;
      elapsed.current = 0;
      arrived.current = false;
      completed.current = false;
      progress.current.scale.x = 0.001;
    }
    const p = chef.current.position;
    const k = keys.current;
    motion.current =
      busy ||
      !!(
        k.w ||
        k.a ||
        k.s ||
        k.d ||
        k.arrowup ||
        k.arrowdown ||
        k.arrowleft ||
        k.arrowright
      );
    if (command && !completed.current) {
      const target = stations.find((s) => s.id === command.id);
      const dx = target.x - p.x,
        dy = target.y - 1.5 - p.y,
        distance = Math.hypot(dx, dy);
      if (distance > 0.06) {
        const step = Math.min(dt * 5, distance);
        p.x += (dx / distance) * step;
        p.y += (dy / distance) * step;
      } else {
        if (!arrived.current) {
          arrived.current = true;
          onArrival(command.id);
        }
        if (command.id !== "crate") {
          elapsed.current += dt;
          const value = Math.min(
            1,
            elapsed.current / (command.id === "stove" ? 3.5 : 2),
          );
          progress.current.scale.x = Math.max(0.001, value);
          report.current += dt;
          if (report.current > 0.1) {
            onProgress(value);
            report.current = 0;
          }
          if (value === 1) {
            completed.current = true;
            onComplete(command.id);
          }
        } else completed.current = true;
      }
    } else if (!busy) {
      let dx = Number(!!(k.d || k.arrowright)) - Number(!!(k.a || k.arrowleft));
      let dy = Number(!!(k.w || k.arrowup)) - Number(!!(k.s || k.arrowdown));
      const length = Math.hypot(dx, dy) || 1;
      p.x = Math.max(-6.8, Math.min(6.8, p.x + (dx / length) * dt * 5));
      p.y = Math.max(-3.5, Math.min(0.75, p.y + (dy / length) * dt * 5));
    }
  });
  return (
    <>
      <Sprite asset={images.kitchen} width={16} height={10} />
      {stations.map((station, index) => (
        <group
          key={station.id}
          position={[station.x, station.y, 1]}
          onClick={(event) => {
            event.stopPropagation();
            onVisit(index);
          }}
        >
          <Dot r={0.78} color={stage === index ? brand.primary : "#ffffff"} />
          <Dot z={0.01} r={0.69} color="#ffffff" />
          <Food
            asset={
              [ingredientAsset, images.onion, images.chefCook, dishAsset][index]
            }
            position={[0, 0, 0.1]}
            scale={0.8}
          />
        </group>
      ))}
      <group ref={chef} position={[0, -2, 5]}>
        <Chef
          motion={motion}
          working={busy && arrived.current}
          action={command?.id}
        />
        <group visible={busy} position={[0, 1.75, 1]}>
          <Rect w={1.3} h={0.14} color="#34564b" />
          <group ref={progress} scale={[0.001, 1, 1]}>
            <Rect z={0.1} w={1.3} h={0.14} color={brand.primary} />
          </group>
        </group>
      </group>
    </>
  );
}
