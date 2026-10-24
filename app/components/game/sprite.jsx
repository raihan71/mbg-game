import { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, SRGBColorSpace, Shape, ShapeGeometry } from "three";

// Each sprite owns its UV transform; the shared loader texture stays untouched.
export default function Sprite({ asset, width, height = 1, ...props }) {
  const source = useLoader(TextureLoader, asset.src);
  const sw = asset.sheet?.[0] ?? source.image.width;
  const sh = asset.sheet?.[1] ?? source.image.height;
  const [x, y, w, h] = asset.region ?? [0, 0, sw, sh];
  const displayWidth = width ?? (height * w) / h;
  const texture = useMemo(() => {
    const map = source.clone();
    map.colorSpace = SRGBColorSpace;
    map.repeat.set(w / sw, h / sh);
    map.offset.set(x / sw, 1 - (y + h) / sh);
    map.needsUpdate = true;
    return map;
  }, [source, sw, sh, x, y, w, h]);
  const geometry = useMemo(() => {
    if (!asset.outline) return null;
    const shape = new Shape();
    asset.outline.forEach(([px, py], i) => {
      const sx = ((px - x) / w - 0.5) * displayWidth;
      const sy = (0.5 - (py - y) / h) * height;
      if (i === 0) shape.moveTo(sx, sy);
      else shape.lineTo(sx, sy);
    });
    shape.closePath();
    const geo = new ShapeGeometry(shape);
    const position = geo.attributes.position,
      uv = geo.attributes.uv;
    for (let i = 0; i < position.count; i++)
      uv.setXY(
        i,
        position.getX(i) / displayWidth + 0.5,
        position.getY(i) / height + 0.5,
      );
    return geo;
  }, [asset, displayWidth, height, x, y, w, h]);
  useEffect(
    () => () => {
      texture.dispose();
      geometry?.dispose();
    },
    [texture, geometry],
  );
  return (
    <mesh {...props}>
      {geometry ? (
        <primitive object={geometry} attach="geometry" />
      ) : (
        <planeGeometry args={[displayWidth, height]} />
      )}
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        toneMapped={false}
      />
    </mesh>
  );
}
