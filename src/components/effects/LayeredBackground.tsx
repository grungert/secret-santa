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

      {/* Layer 2: Island with house - floating animation */}
      <img
        src="/imgs/island.png"
        alt=""
        className="absolute bottom-[5%] left-1/2 w-[32vw] max-w-[400px] animate-bg-float"
        style={{
          transform: "translateX(-50%)",
          imageRendering: "pixelated",
        }}
      />

      {/* Layer 3: Santa flying across - looping animation */}
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
