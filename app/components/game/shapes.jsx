import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Sprite from "./sprite";
import { images, mealImages } from "../../configs/images";

export function Rect({ x = 0, y = 0, z = 0, w = 1, h = 1, color, ...props }) {
  return (
    <mesh position={[x, y, z]} {...props}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
export function Dot({ x = 0, y = 0, z = 0, r = 0.3, color, scale, ...props }) {
  return (
    <mesh position={[x, y, z]} scale={scale} {...props}>
      <circleGeometry args={[r, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
export function Panel({
  x = 0,
  y = 0,
  w = 2,
  h = 1,
  color = "#f8e6b7",
  z = 1,
  children,
}) {
  return (
    <group position={[x, y, z]}>
      <Rect y={-0.14} z={-0.02} w={w + 0.12} h={h + 0.12} color="#223c39" />
      <Rect w={w} h={h} color={color} />
      <Rect y={h / 2 - 0.08} z={0.01} w={w - 0.16} h={0.06} color="#ffffff" />
      {children}
    </group>
  );
}
export function Food({ type = 0, asset, ...props }) {
  return (
    <group {...props}>
      <Sprite asset={asset ?? mealImages[type].image} height={1.2} />
    </group>
  );
}
export function Chef({ motion, working = false, action }) {
  const ref = useRef();
  const walking = useRef();
  const idle = useRef();
  useFrame(({ clock }) => {
    const moving = motion?.current && !working;
    walking.current.visible = !!moving;
    idle.current.visible = !moving;
    ref.current.rotation.z = moving
      ? Math.sin(clock.elapsedTime * 14) * 0.045
      : 0;
    ref.current.position.y = moving
      ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.08
      : 0;
  });
  const pose = working
    ? action === "pass"
      ? images.chefPlate
      : images.chefCook
    : images.chefIdle;
  return (
    <group>
      <group ref={ref}>
        <group ref={walking} visible={false}>
          <Sprite
            asset={images.chefWalk}
            height={2.1}
            position={[0, 0.45, 0.1]}
          />
        </group>
        <group ref={idle}>
          <Sprite asset={pose} height={2.1} position={[0, 0.45, 0.1]} />
        </group>
      </group>
    </group>
  );
}
export function Van(props) {
  return (
    <group {...props}>
      <Sprite asset={images.van} height={2.1} />
    </group>
  );
}
export function Tree({ x, y, z = 2 }) {
  return (
    <group position={[x, y, z]}>
      <Dot y={-0.2} r={0.8} scale={[1, 0.65, 1]} color="#70977b" />
      <Rect y={-0.4} z={0.1} w={0.18} h={0.6} color="#977151" />
      <Dot z={0.2} r={0.72} color="#3e8768" />
      <Dot x={-0.18} y={0.2} z={0.3} r={0.45} color="#64a477" />
    </group>
  );
}
