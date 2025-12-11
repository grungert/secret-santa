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
    <>
      {/* Main background container */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Layer 1: Sky background - static */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/imgs/background.png)" }}
        />

        {/* Layer 2: Far clouds - behind island (slowest) */}
        <img
          src="/imgs/clouds/cloud-01.png"
          alt=""
          className="absolute top-[15%] w-[20vw] max-w-[250px] opacity-40 animate-cloud-slow"
          style={{ imageRendering: "pixelated", animationDelay: "0s" }}
        />
        <img
          src="/imgs/clouds/cloud-03.png"
          alt=""
          className="absolute top-[25%] w-[18vw] max-w-[220px] opacity-35 animate-cloud-slow"
          style={{ imageRendering: "pixelated", animationDelay: "-40s" }}
        />

        {/* Layer 3: Island with house - floating animation */}
        <img
          src="/imgs/island.png"
          alt=""
          className="absolute bottom-[5%] left-1/2 w-[32vw] max-w-[400px] animate-bg-float"
          style={{
            transform: "translateX(-50%)",
            imageRendering: "pixelated",
          }}
        />

        {/* Layer 4: Mid clouds - behind santa (medium speed) */}
        <img
          src="/imgs/clouds/cloud-02.png"
          alt=""
          className="absolute top-[10%] w-[22vw] max-w-[280px] opacity-50 animate-cloud-medium"
          style={{ imageRendering: "pixelated", animationDelay: "-15s" }}
        />
        <img
          src="/imgs/clouds/cloud-04.png"
          alt=""
          className="absolute top-[30%] w-[20vw] max-w-[250px] opacity-45 animate-cloud-medium"
          style={{ imageRendering: "pixelated", animationDelay: "-35s" }}
        />

        {/* Layer 5: Santa flying across - looping animation */}
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

      {/* Layer 6: Foreground clouds - in front of everything (fastest) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[2]">
        <img
          src="/imgs/clouds/cloud-01.png"
          alt=""
          className="absolute top-[5%] w-[25vw] max-w-[320px] opacity-70 animate-cloud-fast"
          style={{ imageRendering: "pixelated", animationDelay: "-10s" }}
        />
        <img
          src="/imgs/clouds/cloud-02.png"
          alt=""
          className="absolute top-[35%] w-[22vw] max-w-[280px] opacity-60 animate-cloud-fast"
          style={{ imageRendering: "pixelated", animationDelay: "-20s" }}
        />
      </div>
    </>
  );
}
