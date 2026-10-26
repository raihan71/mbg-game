import { useEffect, useRef } from "react";

export default function DeliveryParticles() {
  const container = useRef(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controller = new AbortController();
    let animation;
    let disposed = false;
    async function start() {
      if (preference.matches || disposed) return;
      try {
        const [module, response] = await Promise.all([
          import("lottie-web"),
          fetch("/api/assets/motions/delivery", { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error("Celebration unavailable");
        const animationData = await response.json();
        if (disposed || preference.matches) return;
        animation = module.default.loadAnimation({
          container: container.current,
          renderer: "canvas",
          loop: false,
          autoplay: !document.hidden,
          animationData,
          rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
        });
      } catch {
        // Delivery results remain usable if decorative animation cannot load.
      }
    }
    const visibility = () => {
      if (document.hidden || preference.matches) animation?.pause();
      else animation?.play();
    };
    const reducedMotion = () => {
      animation?.destroy();
      animation = undefined;
      if (!preference.matches) void start();
    };
    void start();
    preference.addEventListener("change", reducedMotion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      controller.abort();
      animation?.destroy();
      preference.removeEventListener("change", reducedMotion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <div ref={container} className="delivery-fireworks" aria-hidden="true" />
  );
}
