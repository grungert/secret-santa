"use client";

interface ScanlineOverlayProps {
  intensity?: "light" | "medium" | "heavy";
  animated?: boolean;
}

export default function ScanlineOverlay({
  intensity = "medium",
  animated = true,
}: ScanlineOverlayProps) {
  const opacityMap = {
    light: 0.02,
    medium: 0.04,
    heavy: 0.08,
  };

  return (
    <>
      {/* Static scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, ${opacityMap[intensity]}),
            rgba(0, 0, 0, ${opacityMap[intensity]}) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />

      {/* Moving scan line */}
      {animated && (
        <div
          className="fixed left-0 right-0 h-[2px] pointer-events-none z-50"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.15), rgba(0, 255, 255, 0.1), transparent)",
            animation: "scanline 6s linear infinite",
            top: "0%",
          }}
        />
      )}

      {/* CRT vignette effect - darker corners */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
        }}
      />

      {/* Screen edge glow */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          boxShadow: `
            inset 0 0 100px rgba(0, 0, 0, 0.4),
            inset 0 0 200px rgba(0, 0, 0, 0.2)
          `,
        }}
      />

      {/* Subtle color aberration on edges */}
      <div
        className="fixed inset-0 pointer-events-none z-40 opacity-30"
        style={{
          background: `
            linear-gradient(90deg, rgba(255, 0, 255, 0.03) 0%, transparent 5%, transparent 95%, rgba(0, 255, 255, 0.03) 100%)
          `,
        }}
      />
    </>
  );
}
