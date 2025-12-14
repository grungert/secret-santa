"use client";

/**
 * Retro CRT overlay effects including:
 * - Flicker effect
 * - Scanlines with RGB color shift
 * - Noise/grain texture
 * - Radial vignette
 * - Moving scanline
 */
export default function RetroOverlay() {
  return (
    <>
      {/* Noise/Grain overlay */}
      <div className="retro-overlay retro-noise" />

      {/* Scanlines overlay */}
      <div className="retro-overlay retro-scanlines" />

      {/* Flicker overlay */}
      <div className="retro-overlay retro-flicker" />

      {/* Radial vignette */}
      <div className="retro-overlay retro-radial" />

      {/* Moving scanline */}
      <div className="retro-overlay retro-scanline-move" />
    </>
  );
}
