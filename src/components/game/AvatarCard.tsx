"use client";

import { useState } from "react";
import PixelAvatar from "./PixelAvatar";
import { cn } from "@/lib/utils";

interface AvatarCardProps {
  avatarId: string;
  isCurrentPlayer: boolean;
  hasRevealed: boolean;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

// Ornament colors based on state
const getOrnamentColors = (isCurrentPlayer: boolean, isHovering: boolean, selected: boolean) => {
  if (isCurrentPlayer) return { border: "border-neon-green", glow: "neon-glow-green", cap: "bg-neon-green", ring: "border-neon-green" };
  if (selected) return { border: "border-neon-yellow", glow: "neon-glow-yellow", cap: "bg-neon-yellow", ring: "border-neon-yellow" };
  if (isHovering) return { border: "border-neon-pink", glow: "neon-glow-pink", cap: "bg-neon-pink", ring: "border-neon-pink" };
  return { border: "border-neon-cyan/50", glow: "", cap: "bg-neon-cyan/70", ring: "border-neon-cyan/50" };
};

export default function AvatarCard({
  avatarId,
  isCurrentPlayer,
  hasRevealed,
  onClick,
  disabled = false,
  selected = false,
}: AvatarCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const canClick = !disabled && !isCurrentPlayer;
  const colors = getOrnamentColors(isCurrentPlayer, isHovering && canClick, selected);

  return (
    <button
      onClick={canClick ? onClick : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={!canClick}
      className={cn(
        "relative flex flex-col items-center transition-all duration-300",
        canClick && "cursor-pointer",
        canClick && isHovering && "scale-105",
        !canClick && !isCurrentPlayer && "cursor-default opacity-70",
      )}
    >
      {/* Ornament Hook/String */}
      <div className="relative flex flex-col items-center">
        {/* String */}
        <div className="w-[2px] h-3 bg-gradient-to-b from-gray-400 to-gray-600" />

        {/* Hook ring */}
        <div className={cn(
          "w-5 h-2.5 border-2 rounded-full -mt-0.5 z-20",
          colors.ring,
          "bg-black/50"
        )} />
      </div>

      {/* Main Ornament Ball with integrated cap */}
      <div className="relative -mt-1">
        {/* Cap (curved to fit circle) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className={cn(
            "w-6 h-3 rounded-t-full",
            colors.cap,
          )} />
          {/* Cap reflection */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Ornament Ball */}
        <div
          className={cn(
            "relative w-28 h-28 md:w-32 md:h-32 rounded-full",
            "border-4 transition-all duration-300",
            "backdrop-blur-sm bg-black/50",
            "flex items-center justify-center",
            "overflow-hidden",
            colors.border,
            colors.glow,
          )}
        >
          {/* Inner glow effect */}
          <div
            className="absolute inset-2 rounded-full opacity-20"
            style={{
              background: isHovering && canClick
                ? "radial-gradient(circle at 30% 30%, var(--neon-pink) 0%, transparent 60%)"
                : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)"
            }}
          />

          {/* Shine effect */}
          <div
            className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white/25 blur-sm"
          />

          {/* Avatar - smaller size */}
          <div
            className={cn(
              "relative transition-transform duration-300 z-10 scale-[0.6]",
              isHovering && canClick && "animate-pixel-wiggle",
            )}
          >
            <PixelAvatar avatarId={avatarId} size="lg" showMystery={false} />
          </div>

          {/* Revealed checkmark overlay */}
          {hasRevealed && !isCurrentPlayer && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <span className="text-2xl text-neon-yellow drop-shadow-[0_0_10px_var(--neon-yellow)]">✓</span>
            </div>
          )}
        </div>

        {/* Status indicator - YOU badge */}
        {isCurrentPlayer && (
          <span className="absolute top-6 -right-2 text-[10px] bg-black/80 text-neon-green px-1.5 py-0.5 border border-neon-green neon-glow-green rounded-full z-20">
            YOU
          </span>
        )}
      </div>

      {/* Click hint */}
      {canClick && isHovering && (
        <span className="mt-1 text-xs neon-text-pink animate-pulse">
          Click to reveal!
        </span>
      )}

      {/* Bottom reflection/decoration */}
      <div
        className={cn(
          "w-12 h-1 mt-1 rounded-full opacity-40 blur-sm",
          isCurrentPlayer ? "bg-neon-green" : isHovering && canClick ? "bg-neon-pink" : "bg-neon-cyan"
        )}
      />
    </button>
  );
}
