"use client";

import { useState } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelCard from "@/components/ui/PixelCard";
import { GameStatus } from "@/types";

interface GameControlsProps {
  status: GameStatus;
  participantCount: number;
  revealedCount: number;
  onStartGame: () => Promise<void>;
  onResetGame: () => Promise<void>;
}

export default function GameControls({
  status,
  participantCount,
  revealedCount,
  onStartGame,
  onResetGame,
}: GameControlsProps) {
  const [loading, setLoading] = useState<"start" | "reset" | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canStart = status === "setup" && participantCount >= 3;

  const handleStart = async () => {
    setLoading("start");
    try {
      await onStartGame();
    } finally {
      setLoading(null);
    }
  };

  const handleReset = async () => {
    setLoading("reset");
    try {
      await onResetGame();
      setShowResetConfirm(false);
    } finally {
      setLoading(null);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "setup":
        return {
          label: "Setup",
          color: "text-gold",
          description: "Add participants and start the game",
        };
      case "active":
        return {
          label: "Active",
          color: "text-christmas-green",
          description: `${revealedCount}/${participantCount} players have revealed`,
        };
      case "completed":
        return {
          label: "Completed",
          color: "text-frost-blue",
          description: "Everyone has revealed their assignment!",
        };
      default:
        return {
          label: "Unknown",
          color: "text-gray-400",
          description: "",
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <PixelCard variant="highlight" className="space-y-4">
      {/* Status display */}
      <div className="text-center">
        <p className="text-lg text-frost-blue">Game Status</p>
        <p className={`text-3xl font-bold ${statusInfo.color}`}>
          {statusInfo.label}
        </p>
        <p className="text-sm text-gray-400 mt-1">{statusInfo.description}</p>
      </div>

      {/* Progress bar for active game */}
      {status === "active" && (
        <div className="w-full bg-midnight border-2 border-frost-blue/30 h-6">
          <div
            className="h-full bg-christmas-green transition-all duration-500"
            style={{
              width: `${(revealedCount / participantCount) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Start button */}
        {status === "setup" && (
          <PixelButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={!canStart || loading === "start"}
          >
            {loading === "start"
              ? "Starting..."
              : canStart
              ? "🎄 Start Game! 🎄"
              : `Need ${3 - participantCount} more`}
          </PixelButton>
        )}

        {/* Share link info */}
        {status === "active" && (
          <div className="text-center p-3 bg-midnight/50 border-2 border-frost-blue/30">
            <p className="text-sm text-frost-blue mb-2">
              Share this link with participants:
            </p>
            <code className="text-gold text-sm break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
            </code>
          </div>
        )}

        {/* Reset button */}
        {!showResetConfirm ? (
          <PixelButton
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => setShowResetConfirm(true)}
            disabled={loading !== null}
          >
            Reset Game
          </PixelButton>
        ) : (
          <div className="flex gap-2">
            <PixelButton
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={handleReset}
              disabled={loading === "reset"}
            >
              {loading === "reset" ? "..." : "Confirm Reset"}
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setShowResetConfirm(false)}
              disabled={loading === "reset"}
            >
              Cancel
            </PixelButton>
          </div>
        )}
      </div>
    </PixelCard>
  );
}
