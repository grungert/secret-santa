"use client";

import { useState, useEffect } from "react";
import PixelAvatar from "./PixelAvatar";
import PixelButton from "@/components/ui/PixelButton";
import { cn } from "@/lib/utils";

interface RevealModalProps {
  isOpen: boolean;
  assignedToName: string;
  assignedToAvatarId: string;
  onClose: () => void;
  alreadyRevealed?: boolean;
}

// Confetti piece component
function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#c41e3a", "#228b22", "#ffd700", "#fffafa", "#ff6b35"];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;

  return (
    <div
      className="absolute w-3 h-3 animate-confetti"
      style={{
        left: `${left}%`,
        top: "-20px",
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

export default function RevealModal({
  isOpen,
  assignedToName,
  assignedToAvatarId,
  onClose,
  alreadyRevealed = false,
}: RevealModalProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimationStage(0);
      setShowConfetti(false);
      return;
    }

    // Animation sequence
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Show backdrop and start zoom
    timers.push(setTimeout(() => setAnimationStage(1), 100));

    // Stage 2: Avatar fully revealed
    timers.push(setTimeout(() => setAnimationStage(2), 900));

    // Stage 3: Show confetti
    timers.push(setTimeout(() => {
      setShowConfetti(true);
      setAnimationStage(3);
    }, 1200));

    // Stage 4: Show name with typewriter
    timers.push(setTimeout(() => setAnimationStage(4), 1500));

    // Stage 5: Show button
    timers.push(setTimeout(() => setAnimationStage(5), 2500));

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-opacity duration-300",
        animationStage >= 1 ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-midnight/95 backdrop-blur-sm"
        onClick={animationStage >= 5 ? onClose : undefined}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Sparkle ring effect */}
        {animationStage >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full animate-pulse-glow" />
          </div>
        )}

        {/* Avatar with zoom animation */}
        <div
          className={cn(
            "relative mx-auto",
            animationStage >= 1 && "animate-reveal-zoom"
          )}
        >
          <div className="relative">
            {/* Glow effect behind avatar */}
            <div className="absolute inset-0 bg-gold/30 blur-xl rounded-full scale-150" />

            <div className="relative bg-midnight p-4 border-4 border-gold pixel-shadow">
              <PixelAvatar avatarId={assignedToAvatarId} size="lg" />
            </div>
          </div>
        </div>

        {/* Title */}
        {animationStage >= 3 && (
          <div className="space-y-2">
            <p className="text-2xl text-frost-blue animate-pulse">
              {alreadyRevealed ? "Your Secret Santa assignment:" : "You will buy a gift for..."}
            </p>
          </div>
        )}

        {/* Name reveal with typewriter effect */}
        {animationStage >= 4 && (
          <div className="overflow-hidden">
            <h2
              className="text-5xl md:text-6xl text-gold font-bold"
              style={{
                animation: "typewriter 0.8s steps(20) forwards",
                whiteSpace: "nowrap",
                overflow: "hidden",
                borderRight: animationStage < 5 ? "4px solid var(--gold)" : "none",
              }}
            >
              {assignedToName}!
            </h2>
          </div>
        )}

        {/* Festive message */}
        {animationStage >= 4 && (
          <p className="text-xl text-snow-white animate-pulse">
            🎄 Ho Ho Ho! 🎅
          </p>
        )}

        {/* Close button */}
        {animationStage >= 5 && (
          <div className="pt-4">
            <PixelButton variant="secondary" size="lg" onClick={onClose}>
              Got it!
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
