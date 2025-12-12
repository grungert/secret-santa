"use client";

import { useState, useEffect } from "react";
import PixelCard from "@/components/ui/PixelCard";
import PixelAvatar from "@/components/game/PixelAvatar";
import PixelButton from "@/components/ui/PixelButton";
import SantaFace, { SantaExpression } from "@/components/game/SantaFace";

interface GameSidebarProps {
  playerName: string;
  playerAvatarId: string;
  revealedCount: number;
  totalParticipants: number;
  hasRevealed: boolean;
  onLogout: () => void;
  onMusicToggle?: () => void;
  isMusicPlaying?: boolean;
  santaExpression?: SantaExpression;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Target: Christmas 2025 or New Year 2026
      const christmas = new Date("2025-12-25T00:00:00");
      const newYear = new Date("2026-01-01T00:00:00");
      const now = new Date();

      // Use Christmas if before it, otherwise New Year
      const target = now < christmas ? christmas : newYear;
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const targetName = new Date() < new Date("2025-12-25") ? "Christmas" : "New Year";

  return (
    <div className="text-center">
      <p className="text-xs text-gray-400 mb-2">Until {targetName}</p>
      <div className="grid grid-cols-4 gap-1">
        {[
          { value: timeLeft.days, label: "D" },
          { value: timeLeft.hours, label: "H" },
          { value: timeLeft.minutes, label: "M" },
          { value: timeLeft.seconds, label: "S" },
        ].map((item, i) => (
          <div key={i} className="bg-black/60 border border-neon-cyan/30 p-1">
            <div className="text-lg neon-text-cyan font-bold">{String(item.value).padStart(2, "0")}</div>
            <div className="text-[10px] text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Progress</span>
        <span className="neon-text-green">{current}/{total}</span>
      </div>
      <div className="h-3 bg-black/60 border border-neon-green/30 overflow-hidden">
        <div
          className="h-full bg-neon-green transition-all duration-500 animate-neon-pulse"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function GameSidebar({
  playerName,
  playerAvatarId,
  revealedCount,
  totalParticipants,
  hasRevealed,
  onLogout,
  onMusicToggle,
  isMusicPlaying = false,
  santaExpression = "naughty",
}: GameSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 w-full md:w-64 lg:w-72">
      {/* Player Info Card */}
      <PixelCard variant="neonGreen" className="text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="bg-black/60 p-2 border-2 border-neon-green">
              <PixelAvatar avatarId={playerAvatarId} size="md" />
            </div>
            <span className="absolute -top-2 -right-2 bg-neon-green text-black text-xs px-2 py-0.5 font-bold">
              YOU
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-400">Playing as</p>
            <p className="text-xl neon-text-yellow font-bold">{playerName}</p>
          </div>
          {hasRevealed && (
            <span className="text-xs bg-neon-pink/20 text-neon-pink px-2 py-1 border border-neon-pink/50">
              Gift Assigned!
            </span>
          )}
        </div>
      </PixelCard>

      {/* How to Play */}
      <PixelCard variant="dark" className="text-left">
        <h3 className="text-sm neon-text-cyan mb-3 flex items-center gap-2">
          <span className="text-lg">📜</span> How to Play
        </h3>
        <ol className="text-xs text-gray-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="neon-text-pink font-bold">1.</span>
            <span>Click any avatar except yours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="neon-text-pink font-bold">2.</span>
            <span>Reveal your Secret Santa match</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="neon-text-pink font-bold">3.</span>
            <span>Buy them a thoughtful gift!</span>
          </li>
        </ol>
        {!hasRevealed && (
          <p className="text-[10px] text-neon-orange mt-3 animate-pulse">
            ★ You can only reveal once! Choose wisely!
          </p>
        )}
      </PixelCard>

      {/* Game Stats */}
      <PixelCard variant="dark">
        <h3 className="text-sm neon-text-cyan mb-3 flex items-center gap-2">
          <span className="text-lg">📊</span> Game Stats
        </h3>
        <ProgressBar current={revealedCount} total={totalParticipants} />
        <p className="text-xs text-center text-gray-400 mt-2">
          {revealedCount === totalParticipants
            ? "Everyone has revealed!"
            : `${totalParticipants - revealedCount} players still choosing...`}
        </p>
      </PixelCard>

      {/* Countdown Timer */}
      <PixelCard variant="dark">
        <h3 className="text-sm neon-text-cyan mb-3 flex items-center gap-2">
          <span className="text-lg">⏰</span> Countdown
        </h3>
        <CountdownTimer />
      </PixelCard>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        {onMusicToggle && (
          <PixelButton
            variant="neonCyan"
            size="sm"
            onClick={onMusicToggle}
            className="w-full text-xs"
          >
            {isMusicPlaying ? "🔊 Music On" : "🔇 Music Off"}
          </PixelButton>
        )}
        <button
          onClick={onLogout}
          className="text-xs text-gray-500 hover:text-neon-pink transition-colors py-2"
        >
          ← Logout
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="hidden md:flex justify-center gap-3 text-2xl opacity-60">
        <span className="animate-pixel-float" style={{ animationDelay: "0s" }}>❄️</span>
        <span className="animate-pixel-float" style={{ animationDelay: "0.5s" }}>🎄</span>
        <span className="animate-pixel-float" style={{ animationDelay: "1s" }}>⭐</span>
        <span className="animate-pixel-float" style={{ animationDelay: "1.5s" }}>🎁</span>
      </div>
    </aside>
  );
}
