"use client";

import { useState, useEffect, useCallback } from "react";
import ParticipantForm from "@/components/admin/ParticipantForm";
import ParticipantList from "@/components/admin/ParticipantList";
import GameControls from "@/components/admin/GameControls";
import PixelCard from "@/components/ui/PixelCard";
import GlitchText from "@/components/effects/GlitchText";
import { GameState } from "@/types";

export default function AdminPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch("/api/game?admin=true");
      const data = await res.json();
      if (data.success) {
        setGameState(data.data);
      } else {
        setError(data.error || "Failed to fetch game state");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameState();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const handleAddParticipant = async (name: string) => {
    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_PARTICIPANT", name }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to add participant");
    }
    setGameState(data.data);
  };

  const handleRemoveParticipant = async (id: string) => {
    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REMOVE_PARTICIPANT", participantId: id }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to remove participant");
    }
    setGameState(data.data);
  };

  const handleStartGame = async () => {
    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "START_GAME" }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to start game");
    }
    setGameState(data.data);
  };

  const handleResetGame = async () => {
    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESET_GAME" }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to reset game");
    }
    setGameState(data.data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pixel-bounce mb-4">🎅</div>
          <p className="text-2xl neon-text-pink animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCard variant="dark" className="text-center p-8">
          <p className="text-2xl text-neon-red mb-4">Error</p>
          <p className="text-neon-cyan">{error}</p>
        </PixelCard>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  const isSetup = gameState.status === "setup";
  const revealedCount = gameState.participants.filter((p) => p.hasRevealed).length;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <GlitchText
            text="ADMIN PANEL"
            as="h1"
            className="text-4xl md:text-6xl neon-text-pink mb-2"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-xl neon-text-cyan animate-pulse">
            Secret Santa 2026
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: Participants */}
          <div className="space-y-4">
            <PixelCard>
              <h2 className="text-2xl neon-text-yellow mb-4">Participants</h2>

              {/* Add form - only in setup mode */}
              {isSetup && (
                <div className="mb-6">
                  <ParticipantForm
                    onAdd={handleAddParticipant}
                    disabled={!isSetup}
                  />
                </div>
              )}

              {/* Participant list */}
              <ParticipantList
                participants={gameState.participants}
                onRemove={handleRemoveParticipant}
                disabled={!isSetup}
                showStatus={!isSetup}
              />
            </PixelCard>
          </div>

          {/* Right column: Controls */}
          <div className="space-y-4">
            <GameControls
              status={gameState.status}
              participantCount={gameState.participants.length}
              revealedCount={revealedCount}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
            />

            {/* Instructions */}
            <PixelCard variant="dark">
              <h3 className="text-xl neon-text-green mb-3">How it works</h3>
              <ol className="space-y-2 text-neon-cyan text-sm">
                <li>1. Add all participant names</li>
                <li>2. Click &quot;Start Game&quot; to assign Secret Santas</li>
                <li>3. Share the main page link with everyone</li>
                <li>4. Each person logs in and clicks an avatar</li>
                <li>5. They see who they should buy a gift for!</li>
              </ol>
            </PixelCard>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center">
          <a
            href="/"
            className="text-neon-cyan hover:text-neon-pink transition-colors"
          >
            ← Go to Player Page
          </a>
        </div>
      </div>
    </main>
  );
}
