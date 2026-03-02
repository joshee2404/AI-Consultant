export default function ZebLogo({ size = "md", className = "" }) {
  const heights = { sm: 18, md: 28, lg: 40 };
  const h = heights[size];

  return (
    <img
      src="/zeb-logo.svg"
      alt="Zeb Fractal"
      height={h}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
