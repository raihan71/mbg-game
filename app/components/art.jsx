import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Art({ mode = "hero" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      node.clientWidth / node.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.8, 8.5);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(node.clientWidth, node.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    node.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9cb1cc, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-3, 7, 5);
    light.castShadow = true;
    scene.add(light);
    const mat = (color, roughness = 0.78) =>
      new THREE.MeshStandardMaterial({ color, roughness });
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.1, 48),
      mat(0xd9edff),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.7;
    floor.receiveShadow = true;
    scene.add(floor);
    const tray = new THREE.Group();
    scene.add(tray);
    const add = (geometry, material, pos, scale) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(...pos);
      if (scale) m.scale.set(...scale);
      m.castShadow = true;
      m.receiveShadow = true;
      tray.add(m);
      return m;
    };
    if (mode === "van") {
      add(new THREE.BoxGeometry(3, 1.25, 1.45), mat(0x95d5ba), [0, 0.25, 0]);
      add(new THREE.BoxGeometry(1.25, 0.7, 1.4), mat(0xbdebd5), [-0.55, 1, 0]);
      add(
        new THREE.BoxGeometry(0.85, 0.45, 0.025),
        mat(0x9cd3f4),
        [-0.55, 1, 0.72],
      );
      add(
        new THREE.BoxGeometry(0.8, 0.48, 0.025),
        mat(0x9cd3f4),
        [-0.55, 1, -0.72],
      );
      for (const x of [-1, 0.95]) {
        const w = add(
          new THREE.CylinderGeometry(0.42, 0.42, 0.2, 20),
          mat(0x303743),
          [x, -0.42, 0.77],
        );
        w.rotation.x = Math.PI / 2;
        const hub = add(
          new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16),
          mat(0xfff0c4),
          [x, -0.42, 0.77],
        );
        hub.rotation.x = Math.PI / 2;
      }
      add(
        new THREE.BoxGeometry(0.1, 0.18, 0.2),
        mat(0xfff1ad),
        [1.52, 0.45, 0.36],
      );
      add(
        new THREE.BoxGeometry(0.1, 0.18, 0.2),
        mat(0xfff1ad),
        [1.52, 0.45, -0.36],
      );
      const sign = add(
        new THREE.BoxGeometry(0.76, 0.26, 0.04),
        mat(0x181d27),
        [-0.55, 1.02, 0.75],
      );
      sign.position.y = 1.38;
    } else {
      const box = add(
        new THREE.BoxGeometry(2.7, 1.05, 1.7),
        mat(0xfafdff),
        [0, 0.02, 0],
      );
      add(new THREE.BoxGeometry(2.48, 0.12, 1.5), mat(0x1e2733), [0, 0.62, 0]);
      add(
        new THREE.CylinderGeometry(0.38, 0.38, 0.18, 24),
        mat(0xffffff),
        [-0.68, 0.78, 0],
      );
      add(
        new THREE.CylinderGeometry(0.31, 0.31, 0.2, 24),
        mat(0xf4c769),
        [-0.65, 0.94, 0],
      );
      for (let i = 0; i < 3; i++) {
        let leaf = add(
          new THREE.SphereGeometry(0.24, 12, 10),
          mat(0x80bb96),
          [0.12 + i * 0.28, 0.8 + (i % 2) * 0.13, 0],
          [1, 0.72, 1],
        );
        leaf.rotation.z = i * 0.5;
      }
      add(
        new THREE.CapsuleGeometry(0.12, 0.58, 6, 12),
        mat(0xf2c874),
        [0.87, 0.84, 0],
      );
      add(new THREE.BoxGeometry(2.56, 0.05, 1.55), mat(0xe0ecf6), [0, 0.58, 0]);
      // Friendly steam puffs make the still-life feel freshly packed.
      for (let i = 0; i < 3; i++) {
        const puff = add(
          new THREE.SphereGeometry(0.13, 12, 10),
          mat(0xffffff),
          [-0.45 + i * 0.2, 1.35 + i * 0.12, 0],
          [0.7, 1.25, 0.7],
        );
        puff.userData.float = i;
      }
    }
    let raf;
    const start = performance.now();
    const resize = () => {
      if (!node.isConnected) return;
      camera.aspect = node.clientWidth / node.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(node.clientWidth, node.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const t = (now - start) * 0.001;
      tray.position.y = Math.sin(t * 1.2) * 0.09;
      tray.rotation.y = Math.sin(t * 0.5) * 0.1;
      renderer.render(scene, camera);
    };
    loop(start);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.dispose();
      node.innerHTML = "";
    };
  }, [mode]);
  return (
    <div
      className={`art-scene art-${mode}`}
      ref={ref}
      aria-label={
        mode === "van"
          ? "Three dimensional delivery van"
          : "Three dimensional lunch tray"
      }
    />
  );
}
