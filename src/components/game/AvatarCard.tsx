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
        "relative p-4 border-4 transition-all duration-200",
        "flex flex-col items-center justify-center gap-2",
        // Base styling
        "bg-midnight/60",
        // States
        canClick && "cursor-pointer hover:scale-105",
        canClick && isHovering && "border-gold animate-pulse-glow",
        !canClick && "cursor-default opacity-70",
        // Current player
        isCurrentPlayer && "border-christmas-green bg-christmas-green/20",
        // Selected
        selected && "border-gold bg-gold/20 scale-105",
        // Default border
        !isCurrentPlayer && !selected && !isHovering && "border-frost-blue/50",
        // Shadow
        "pixel-shadow"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "transition-transform duration-300",
        isHovering && canClick && "animate-pixel-bounce"
      )}>
        <PixelAvatar
          avatarId={avatarId}
          size="lg"
          showMystery={false}
        />
      </div>

      {/* Status indicator */}
      {isCurrentPlayer && (
        <span className="absolute top-2 right-2 text-sm bg-christmas-green px-2 py-1 border-2 border-christmas-green-dark">
          YOU
        </span>
      )}

      {/* Revealed indicator */}
      {hasRevealed && !isCurrentPlayer && (
        <span className="absolute top-2 left-2 text-sm bg-gold text-midnight px-2 py-1 border-2 border-yellow-600">
          ✓
        </span>
      )}

      {/* Click hint */}
      {canClick && isHovering && (
        <span className="text-sm text-gold animate-pulse">
          Click to reveal!
        </span>
      )}
    </button>
  );
}
