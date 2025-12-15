"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: "subtle" | "medium" | "intense";
  continuous?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function GlitchText({
  text,
  className = "",
  glitchIntensity = "medium",
  continuous = false,
  as: Component = "span",
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(continuous);

  useEffect(() => {
    // If continuous mode, state is already initialized to true, no need for intervals
    if (continuous) {
      return;
    }

    // Random glitch intervals
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150 + Math.random() * 250);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerGlitch();
      }
    }, 2000 + Math.random() * 3000);

    // Initial glitch after mount
    const initialTimeout = setTimeout(() => {
      triggerGlitch();
    }, 500 + Math.random() * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [continuous]);

  const intensityClasses = {
    subtle: isGlitching ? "glitch-subtle" : "",
    medium: isGlitching ? "glitch-medium" : "",
    intense: "glitch-intense",
  };

  return (
    <Component
      className={cn(
        "relative inline-block",
        intensityClasses[glitchIntensity],
        className
      )}
      data-text={text}
    >
      {text}
      {/* Glitch color separation layers */}
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 opacity-80 pointer-events-none"
            style={{
              color: "var(--neon-cyan)",
              clipPath: "inset(10% 0 70% 0)",
              transform: "translateX(-3px)",
            }}
            aria-hidden="true"
          >
            {text}
          </span>
          <span
            className="absolute inset-0 opacity-80 pointer-events-none"
            style={{
              color: "var(--neon-pink)",
              clipPath: "inset(70% 0 10% 0)",
              transform: "translateX(3px)",
            }}
            aria-hidden="true"
          >
            {text}
          </span>
        </>
      )}
    </Component>
  );
}
