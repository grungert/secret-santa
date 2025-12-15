"use client";

import PixelAvatar from "@/components/game/PixelAvatar";

interface NeonStatBarProps {
  playerAvatarId: string;
  revealedCount: number;
  totalParticipants: number;
  hasRevealed: boolean;
  onLogout: () => void;
}

export default function NeonStatBar({
  playerAvatarId,
  revealedCount,
  totalParticipants,
  hasRevealed,
  onLogout,
}: NeonStatBarProps) {
  const progress = totalParticipants > 0 ? (revealedCount / totalParticipants) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Neon stat bar container */}
      <div
        className="relative flex items-center justify-between gap-4 px-6 py-3 rounded-full border-2 border-neon-cyan"
        style={{
          background: "linear-gradient(180deg, rgba(0,255,255,0.1) 0%, rgba(0,0,0,0.8) 100%)",
          boxShadow: `
            0 0 10px var(--neon-cyan),
            0 0 20px var(--neon-cyan-glow),
            inset 0 0 15px rgba(0,255,255,0.1)
          `,
        }}
      >
        {/* Left - Avatar */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-neon-pink bg-black/50 flex items-center justify-center"
            style={{ boxShadow: "0 0 8px var(--neon-pink)" }}
          >
            <div className="scale-[0.6] origin-center">
              <PixelAvatar avatarId={playerAvatarId} size="sm" />
            </div>
          </div>
        </div>

        {/* Center - Progress bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm neon-text-green whitespace-nowrap">
            {revealedCount}/{totalParticipants} otkriveno
          </span>
          <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-neon-green/50">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--neon-green), var(--neon-cyan))",
                boxShadow: "0 0 10px var(--neon-green)",
              }}
            />
          </div>
        </div>

        {/* Right - Status & Logout */}
        <div className="flex items-center gap-4">
          {hasRevealed ? (
            <span className="text-sm neon-text-green">✓ Otkriveno</span>
          ) : (
            <span className="text-sm neon-text-yellow animate-pulse">Izaberi ukras!</span>
          )}
          <button
            onClick={onLogout}
            className="text-sm px-3 py-1 rounded border border-neon-pink/50 text-neon-pink hover:bg-neon-pink/20 hover:border-neon-pink transition-all"
            style={{
              textShadow: "0 0 8px var(--neon-pink)",
            }}
          >
            Odjava
          </button>
        </div>
      </div>
    </div>
  );
}
