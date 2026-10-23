export default function Button({
  variant = "dark",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`.trim()}
      {...props}
    />
  );
}
