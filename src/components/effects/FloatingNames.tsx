"use client";

import { useMemo } from "react";

interface FloatingNamesProps {
  names: string[];
}

const FONTS = ["font-neonderthaw", "font-tilt-neon"];
const GRADIENTS = ["gradient-pink-cyan", "gradient-rainbow", "gradient-fire", "gradient-ice"];

// Depth layer configurations
const DEPTH_LAYERS = {
  back: {
    class: "depth-back",
    sizeRange: [0.9, 1.3], // rem
    durationRange: [20, 28], // seconds
    zIndex: 1,
  },
  mid: {
    class: "depth-mid",
    sizeRange: [1.5, 2.2],
    durationRange: [14, 20],
    zIndex: 2,
  },
  front: {
    class: "depth-front",
    sizeRange: [2.5, 3.5],
    durationRange: [10, 14],
    zIndex: 3,
  },
};

type DepthLayer = keyof typeof DEPTH_LAYERS;

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function FloatingNames({ names }: FloatingNamesProps) {
  // Create multiple instances of each name across depth layers
  const floatingItems = useMemo(() => {
    if (names.length === 0) return [];

    const layers: DepthLayer[] = ["back", "mid", "front"];

    return names.flatMap((name, nameIndex) =>
      // Create 4 instances of each name spread across layers
      [0, 1, 2, 3].map((instance) => {
        // Distribute across layers: more in back, fewer in front
        const layerIndex = instance === 0 ? 2 : instance === 1 ? 1 : 0;
        const layer = layers[layerIndex];
        const config = DEPTH_LAYERS[layer];

        return {
          id: `${nameIndex}-${instance}`,
          name,
          left: 5 + Math.random() * 90, // 5-95% from left
          duration: randomInRange(...config.durationRange),
          delay: instance * 5 + Math.random() * 8, // Staggered delays
          fontSize: randomInRange(...config.sizeRange),
          font: randomChoice(FONTS),
          gradient: randomChoice(GRADIENTS),
          depthClass: config.class,
          zIndex: config.zIndex,
          hasTrail: Math.random() > 0.4, // 60% chance of trail
        };
      })
    );
  }, [names]);

  if (names.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[5]">
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className={`absolute animate-float-name-up ${item.depthClass}`}
          style={{
            left: `${item.left}%`,
            bottom: "-100px",
            fontSize: `${item.fontSize}rem`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            zIndex: item.zIndex,
          }}
        >
          <span
            className={`${item.font} ${item.gradient} ${item.hasTrail ? "glow-trail" : ""} inline-block whitespace-nowrap`}
            data-text={item.name}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
