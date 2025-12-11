"use client";

import { useState, useEffect } from "react";
import PixelAvatar from "./PixelAvatar";
import PixelButton from "@/components/ui/PixelButton";
import GlitchText from "@/components/effects/GlitchText";
import { cn } from "@/lib/utils";

interface RevealModalProps {
  isOpen: boolean;
  assignedToName: string;
  assignedToAvatarId: string;
  onClose: () => void;
  alreadyRevealed?: boolean;
}

// Neon confetti piece component
function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#39ff14", "#ff00ff", "#00ffff", "#ffff00", "#ff6600"];
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
        boxShadow: `0 0 10px ${color}`,
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
    timers.push(
      setTimeout(() => {
        setShowConfetti(true);
        setAnimationStage(3);
      }, 1200)
    );

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
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "transition-opacity duration-300",
        animationStage >= 1 ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop with neon gradient */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(26, 10, 46, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)",
        }}
        onClick={animationStage >= 5 ? onClose : undefined}
      />

      {/* Neon Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Neon glow ring effect */}
        {animationStage >= 2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-56 h-56 rounded-full animate-neon-pulse"
              style={{
                background:
                  "radial-gradient(circle, transparent 40%, var(--neon-pink-glow) 60%, transparent 70%)",
              }}
            />
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
            {/* Multi-color neon glow behind avatar */}
            <div
              className="absolute inset-0 blur-2xl rounded-full scale-150 animate-rainbow-neon"
              style={{ opacity: 0.4 }}
            />

            {/* Avatar container with neon border */}
            <div
              className="relative bg-black/80 p-4 border-4 border-neon-pink backdrop-blur-sm"
              style={{
                boxShadow: `
                  0 0 20px var(--neon-pink),
                  0 0 40px var(--neon-pink-glow),
                  inset 0 0 20px var(--neon-pink-glow)
                `,
              }}
            >
              <PixelAvatar avatarId={assignedToAvatarId} size="lg" />
            </div>
          </div>
        </div>

        {/* Title with glitch effect */}
        {animationStage >= 3 && (
          <div className="space-y-2">
            <p className="text-2xl neon-text-cyan animate-pulse">
              {alreadyRevealed
                ? "Your Secret Santa assignment:"
                : "You will buy a gift for..."}
            </p>
          </div>
        )}

        {/* Name reveal with glitch text */}
        {animationStage >= 4 && (
          <div className="overflow-hidden">
            <GlitchText
              text={`${assignedToName}!`}
              as="h2"
              className="text-5xl md:text-6xl font-bold neon-text-pink"
              glitchIntensity="medium"
              continuous={false}
            />
          </div>
        )}

        {/* Neon festive message */}
        {animationStage >= 4 && (
          <p className="text-xl animate-rainbow-neon">
            ★ AWESOME ★
          </p>
        )}

        {/* Close button */}
        {animationStage >= 5 && (
          <div className="pt-4">
            <PixelButton variant="neonCyan" size="lg" onClick={onClose}>
              Got it!
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
