"use client";

import { useEffect, useRef } from "react";

export default function LayeredBackground() {
  const santaRef = useRef<HTMLImageElement>(null);

  // Randomize Santa's flight duration each loop for more life
  useEffect(() => {
    const santa = santaRef.current;
    if (!santa) return;

    const handleAnimationIteration = () => {
      const duration = 14 + Math.random() * 8; // 14-22 seconds
      santa.style.animationDuration = `${duration}s`;
    };

    santa.addEventListener("animationiteration", handleAnimationIteration);
    return () => {
      santa.removeEventListener("animationiteration", handleAnimationIteration);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 1: Sky background - static */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/imgs/background.png)" }}
      />

      {/* Layer 2: Neon horizon glow line */}
      <div
        className="absolute left-0 right-0 h-[2px] top-[42%]"
        style={{
          background: "linear-gradient(90deg, transparent, #ff00ff, #ff6600, #ff00ff, transparent)",
          boxShadow: "0 0 20px 4px rgba(255, 0, 255, 0.6), 0 0 40px 8px rgba(255, 102, 0, 0.4)",
        }}
      />

      {/* Layer 3: Island with house - floating animation */}
      <img
        src="/imgs/island.png"
        alt=""
        className="absolute bottom-[2%] left-1/2 w-[55vw] max-w-[700px] animate-bg-float"
        style={{
          transform: "translateX(-50%)",
          imageRendering: "pixelated",
        }}
      />

      {/* Layer 4: Santa flying across - looping animation */}
      <img
        ref={santaRef}
        src="/imgs/santa.png"
        alt=""
        className="absolute top-[8%] w-[28vw] max-w-[400px] animate-santa-fly"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
