// Sprite-sheet clipping uses metadata from configs/images, never magic URLs.
export default function ModelImage({
  asset,
  className = "",
  decorative = false,
  ...props
}) {
  if (!asset.region)
    return (
      <img
        src={asset.src}
        alt={decorative ? "" : asset.alt}
        className={`model-image ${className}`}
        decoding="async"
        {...props}
      />
    );
  const [x, y, w, h] = asset.region;
  const [sw, sh] = asset.sheet;
  return (
    <span
      className={`model-image model-region ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : asset.alt}
      aria-hidden={decorative || undefined}
      style={{
        aspectRatio: `${w} / ${h}`,
        clipPath: asset.outline
          ? `polygon(${asset.outline.map(([px, py]) => `${((px - x) / w) * 100}% ${((py - y) / h) * 100}%`).join(",")})`
          : undefined,
      }}
      {...props}
    >
      <img
        src={asset.src}
        alt=""
        draggable="false"
        style={{
          width: `${(sw / w) * 100}%`,
          height: `${(sh / h) * 100}%`,
          maxWidth: "none",
          left: `${(-x / w) * 100}%`,
          top: `${(-y / h) * 100}%`,
        }}
      />
    </span>
  );
}
