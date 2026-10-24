import { Component, lazy, Suspense, useEffect, useState } from "react";
const Renderer = lazy(() => import("./renderer"));

function Unavailable() {
  return (
    <div className="canvas-message" role="status">
      The game needs WebGL to render. Enable graphics acceleration and reload
      this page.
    </div>
  );
}
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Unavailable /> : this.props.children;
  }
}
export default function Stage({ children, label, decorative = false }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="game-canvas" aria-label={label} role="group">
      <SceneBoundary>
        <Suspense
          fallback={
            <div className="canvas-message">Preparing your little world…</div>
          }
        >
          {mounted && (
            <Renderer decorative={decorative} fallback={<Unavailable />}>
              {children}
            </Renderer>
          )}
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
