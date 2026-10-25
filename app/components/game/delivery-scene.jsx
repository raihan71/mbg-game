import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Rect, Tree, Van, Panel } from "./shapes";
import Sprite from "./sprite";
import { trafficVehicles } from "../../configs/images";
import { stepDrive } from "../../lib/driving";
export default function DeliveryScene({ simulation, keys, paused, onUpdate }) {
  const player = useRef();
  const road = useRef();
  const cars = useRef([]);
  const scenery = useRef();
  const exhaust = useRef();
  const timer = useRef(0);
  useFrame((_, delta) => {
    const s = simulation.current;
    if (!paused) stepDrive(s, keys.current, delta);
    player.current.position.x = s.x;
    player.current.rotation.z =
      keys.current.a || keys.current.arrowleft
        ? 0.08
        : keys.current.d || keys.current.arrowright
          ? -0.08
          : 0;
    player.current.visible =
      s.cooldown <= 0 || Math.floor(s.cooldown * 14) % 2 === 0;
    exhaust.current.visible = s.boost;
    road.current.position.y = -s.scroll;
    scenery.current.position.y = -s.scroll;
    cars.current.forEach((car, i) => {
      car.position.set(s.traffic[i].x, s.traffic[i].y, 3);
    });
    timer.current += delta;
    if (timer.current > 0.1) {
      timer.current = 0;
      onUpdate({ ...s });
    }
  });
  return (
    <>
      <Rect w={16} h={12} color="#acc59b" />
      <Rect w={8.7} h={12} z={0.1} color="#e6d8b1" />
      <Rect w={7.9} h={12} z={0.2} color="#3c5556" />
      {[-3.8, 3.8].map((x) => (
        <Rect key={x} x={x} w={0.07} h={12} z={0.3} color="#e5d8b3" />
      ))}
      <group ref={road}>
        {[-1.25, 1.25].flatMap((x) =>
          Array.from({ length: 6 }, (_, i) => (
            <Rect
              key={`${x}-${i}`}
              x={x}
              y={-5 + i * 3}
              w={0.09}
              h={1.4}
              z={0.3}
              color="#b1c4b6"
            />
          )),
        )}
      </group>
      <group ref={scenery}>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i}>
            <Tree x={-5.3} y={-5 + i * 3.5} />
            <Tree x={6.5} y={-3 + i * 3.5} />
            {i % 2 === 0 && (
              <Panel x={-7} y={-4 + i * 3.5} w={1.8} h={2} color="#efd399">
                <Rect z={0.1} w={1.4} h={0.35} color="#c27a58" />
              </Panel>
            )}
          </group>
        ))}
      </group>
      {trafficVehicles.map((asset, i) => (
        <group
          ref={(node) => {
            cars.current[i] = node;
          }}
          key={i}
        >
          <Sprite
            asset={asset}
            height={asset.height ?? 2.1}
            rotation={[0, 0, asset.rotation ?? Math.PI]}
          />
        </group>
      ))}
      <group ref={player} position={[0, -2.8, 4]}>
        <group ref={exhaust}>
          <Rect y={-1.25} z={-0.2} w={0.55} h={0.65} color="#f6c060" />
          <Rect y={-1.1} z={-0.1} w={0.3} h={0.5} color="#fff0ac" />
        </group>
        <Van />
      </group>
    </>
  );
}
