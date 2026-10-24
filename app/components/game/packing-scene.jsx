import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Food, Rect } from "./shapes";
import Sprite from "./sprite";
import { images, mealImages } from "../../configs/images";
export const ingredients = mealImages.map((item) => item.name);
function Portion({ index, added, decorative }) {
  const ref = useRef();
  const x = index % 2 === 0 ? -1.8 : 1.8;
  const y = index < 2 ? 1.3 : -1.3;
  useFrame(({ clock }, delta) => {
    const target = added ? 1 : 0.001;
    const next =
      ref.current.scale.x +
      (target - ref.current.scale.x) * (1 - Math.exp(-delta * 10));
    ref.current.scale.setScalar(next);
    ref.current.position.y =
      y +
      (decorative ? Math.sin(clock.elapsedTime * 1.8 + index) * 0.08 : 0) +
      (1 - next) * 2;
    ref.current.rotation.z = (1 - next) * 0.5;
  });
  return (
    <group ref={ref} position={[x, y, 3]} scale={decorative ? 1 : 0.001}>
      <Food type={index} scale={1.35} />
    </group>
  );
}
export default function PackingScene({
  checked = {},
  decorative = false,
  onToggle,
}) {
  const conveyor = useRef();
  useFrame((_, delta) => {
    conveyor.current.position.x =
      (conveyor.current.position.x + Math.min(delta, 0.05) * 0.6) % 1.4;
  });
  return (
    <>
      <Rect w={16} h={10} color="#f5f5f5" />
      <Rect w={16} h={7.9} z={0.1} color="#e5e5e5" />
      <group ref={conveyor}>
        {Array.from({ length: 14 }, (_, i) => (
          <Rect
            key={i}
            x={-10 + i * 1.4}
            z={0.2}
            w={0.09}
            h={7.6}
            color="#d3d3d3"
          />
        ))}
      </group>
      <Rect y={4} z={0.3} w={16} h={0.2} color="#afafaf" />
      <Rect y={-4} z={0.3} w={16} h={0.2} color="#afafaf" />
      <Sprite
        asset={images.emptyTray}
        width={9}
        height={5.8}
        position={[0, 0, 1]}
      />
      {ingredients.map((item, i) => (
        <mesh
          key={item}
          position={[i % 2 === 0 ? -1.8 : 1.8, i < 2 ? 1.3 : -1.3, 2]}
          onClick={
            onToggle
              ? (event) => {
                  event.stopPropagation();
                  onToggle(item);
                }
              : undefined
          }
        >
          <planeGeometry args={[3.35, 2.35]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      {ingredients.map((item, i) => (
        <Portion
          key={item}
          index={i}
          added={checked[item] || decorative}
          decorative={decorative}
        />
      ))}
    </>
  );
}
