import Art from "./art";

export default function ThreePanel({ mode, children }) {
  return (
    <div className="playfield">
      <Art mode={mode} />
      {children}
    </div>
  );
}
