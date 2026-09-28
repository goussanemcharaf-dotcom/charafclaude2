import React, { useId } from "react";

// Directional motion blur (the reference smears fast-moving type and cards
// horizontally). SVG feGaussianBlur accepts separate X/Y deviations, so a
// per-element filter gives true directional blur without 3D or sub-frames.
export const MotionBlur: React.FC<{
  x?: number; // px of horizontal smear
  y?: number; // px of vertical smear
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, style, children }) => {
  const raw = useId();
  const id = `mb${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const sx = Math.min(60, Math.abs(x));
  const sy = Math.min(60, Math.abs(y));
  const active = sx > 0.25 || sy > 0.25;
  return (
    <div style={{ ...style, filter: active ? `url(#${id})` : undefined }}>
      {active && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`${sx} ${sy}`} />
            </filter>
          </defs>
        </svg>
      )}
      {children}
    </div>
  );
};
