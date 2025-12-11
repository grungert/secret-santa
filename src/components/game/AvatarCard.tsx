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

  return (
    <button
      onClick={canClick ? onClick : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={!canClick}
      className={cn(
        "relative p-4 border-4 transition-all duration-300",
        "flex flex-col items-center justify-center gap-2",
        "backdrop-blur-sm",
        // Base styling
        "bg-black/40",
        // States
        canClick && "cursor-pointer hover:scale-105",
        canClick && isHovering && "border-neon-pink neon-glow-pink",
        !canClick && "cursor-default opacity-60",
        // Current player
        isCurrentPlayer && "border-neon-green bg-neon-green/10 neon-glow-green",
        // Selected
        selected && "border-neon-yellow bg-neon-yellow/10 scale-105 neon-glow-yellow",
        // Default border
        !isCurrentPlayer && !selected && !isHovering && "border-neon-cyan/30",
      )}
    >
      {/* Neon glow effect behind avatar on hover */}
      {canClick && isHovering && (
        <div
          className="absolute inset-0 opacity-30 blur-xl"
          style={{
            background: "radial-gradient(circle, var(--neon-pink) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Avatar */}
      <div
        className={cn(
          "relative transition-transform duration-300",
          isHovering && canClick && "animate-pixel-bounce",
          isHovering && canClick && "drop-shadow-[0_0_10px_var(--neon-pink)]"
        )}
      >
        <PixelAvatar avatarId={avatarId} size="lg" showMystery={false} />
      </div>

      {/* Status indicator - YOU badge */}
      {isCurrentPlayer && (
        <span className="absolute top-2 right-2 text-sm bg-black/60 text-neon-green px-2 py-1 border-2 border-neon-green neon-glow-green">
          YOU
        </span>
      )}

      {/* Revealed indicator */}
      {hasRevealed && !isCurrentPlayer && (
        <span className="absolute top-2 left-2 text-sm bg-black/60 text-neon-yellow px-2 py-1 border-2 border-neon-yellow">
          ✓
        </span>
      )}

      {/* Click hint */}
      {canClick && isHovering && (
        <span className="text-sm neon-text-pink animate-pulse">
          Click to reveal!
        </span>
      )}
    </button>
  );
}
