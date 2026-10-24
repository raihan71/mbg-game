import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect, useEffect, useState } from "react";
function Fit() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    camera.zoom = Math.min(size.width / 16, size.height / 10);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}
export default function Renderer({ children, fallback, decorative }) {
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <Canvas
      orthographic
      flat
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 50], near: 0.1, far: 100 }}
      frameloop={hidden || (decorative && reduced) ? "demand" : "always"}
      fallback={fallback}
      gl={{ antialias: true, alpha: true }}
    >
      <Fit />
      {children}
    </Canvas>
  );
}
