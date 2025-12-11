"use client";

import { useState, useEffect, useCallback } from "react";
import LoginForm from "@/components/game/LoginForm";
import AvatarGrid from "@/components/game/AvatarGrid";
import RevealModal from "@/components/game/RevealModal";
import PixelCard from "@/components/ui/PixelCard";
import PixelAvatar from "@/components/game/PixelAvatar";
import GlitchText from "@/components/effects/GlitchText";
import PixelButton from "@/components/ui/PixelButton";
import { PlayerGameView } from "@/types";

const STORAGE_KEY = "secret-santa-player";

export default function PlayerPage() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [gameView, setGameView] = useState<PlayerGameView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  // Reveal modal state
  const [showReveal, setShowReveal] = useState(false);
  const [revealData, setRevealData] = useState<{
    name: string;
    avatarId: string;
    alreadyRevealed: boolean;
  } | null>(null);
  const [revealing, setRevealing] = useState(false);

  // Load saved player name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { name } = JSON.parse(saved);
        setPlayerName(name);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Fetch game view for player
  const fetchGameView = useCallback(async () => {
    if (!playerName) return;

    try {
      const res = await fetch(`/api/game?player=${encodeURIComponent(playerName)}`);
      const data = await res.json();

      if (data.success) {
        const view = data.data as PlayerGameView;

        // Check if player exists in game
        if (!view.currentPlayer) {
          setLoginError("Name not found in game. Check with the admin!");
          setPlayerName(null);
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        setGameView(view);
        setLoginError("");
      }
    } catch {
      console.error("Failed to fetch game view");
    }
  }, [playerName]);

  useEffect(() => {
    if (playerName) {
      fetchGameView();
      // Poll for updates every 3 seconds
      const interval = setInterval(fetchGameView, 3000);
      return () => clearInterval(interval);
    }
  }, [playerName, fetchGameView]);

  const handleLogin = async (name: string) => {
    setLoading(true);
    setLoginError("");

    try {
      // Check if player exists
      const res = await fetch(`/api/game?player=${encodeURIComponent(name)}`);
      const data = await res.json();

      if (data.success && data.data.currentPlayer) {
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name }));
        setPlayerName(name);
        setGameView(data.data);
      } else {
        setLoginError("Name not found. Make sure you use the exact name the admin registered!");
      }
    } catch {
      setLoginError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayerName(null);
    setGameView(null);
  };

  const handleAvatarClick = async () => {
    if (!playerName || revealing) return;

    setRevealing(true);

    try {
      const res = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });

      const data = await res.json();

      if (data.success) {
        setRevealData({
          name: data.data.assignedTo.name,
          avatarId: data.data.assignedTo.avatarId,
          alreadyRevealed: data.data.alreadyRevealed,
        });
        setShowReveal(true);
        // Refresh game view
        fetchGameView();
      } else {
        alert(data.error || "Failed to reveal");
      }
    } catch {
      alert("Failed to connect. Please try again.");
    } finally {
      setRevealing(false);
    }
  };

  const handleCloseReveal = () => {
    setShowReveal(false);
  };

  const handleStart = () => {
    setShowStartScreen(false);
  };

  // Start screen - shows full background with START button
  if (showStartScreen) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-start pt-[15vh] p-4 relative">
        {/* Admin link in bottom right */}
        <a
          href="/admin"
          className="absolute bottom-4 right-4 text-sm text-gray-500 hover:text-neon-cyan transition-colors"
        >
          Admin Panel →
        </a>

        <div className="text-center">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-5xl md:text-7xl neon-text-pink mb-4"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-2xl neon-text-cyan animate-pulse mb-12">New Year 2026</p>

          <PixelButton
            onClick={handleStart}
            variant="neonPink"
            size="lg"
            className="text-2xl px-12 py-4 animate-neon-pulse"
          >
            ▶ START
          </PixelButton>
        </div>
      </main>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pixel-bounce mb-4">🎅</div>
          <p className="text-2xl neon-text-pink animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!playerName) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-4xl md:text-6xl neon-text-pink mb-2"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-xl neon-text-cyan animate-pulse">New Year 2026</p>
        </div>

        <LoginForm onLogin={handleLogin} error={loginError} loading={loading} />

        <div className="mt-8">
          <a
            href="/admin"
            className="text-sm text-gray-400 hover:text-neon-cyan transition-colors"
          >
            Admin Panel →
          </a>
        </div>
      </main>
    );
  }

  // Game not started
  if (!gameView || gameView.status === "setup") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-4xl md:text-6xl neon-text-pink mb-2"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-xl neon-text-cyan animate-pulse">New Year 2026</p>
        </div>

        <PixelCard variant="highlight" className="max-w-md text-center">
          <div className="text-4xl animate-pixel-float mb-4">⏳</div>
          <h2 className="text-2xl neon-text-yellow mb-2">
            Welcome, {gameView?.currentPlayer?.name || playerName}!
          </h2>
          <p className="text-neon-cyan mb-4">
            The game hasn&apos;t started yet. Wait for the admin to set everything up!
          </p>
          <p className="text-sm text-gray-400">
            This page will automatically update when the game starts.
          </p>
        </PixelCard>

        <button
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-400 hover:text-neon-cyan transition-colors"
        >
          Logout
        </button>
      </main>
    );
  }

  // Player already revealed - show their assignment
  if (gameView.currentPlayer?.hasRevealed && gameView.currentPlayer.assignedToName) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-4xl md:text-6xl neon-text-pink mb-2"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-xl neon-text-cyan animate-pulse">New Year 2026</p>
        </div>

        <PixelCard variant="highlight" className="max-w-md text-center">
          <p className="text-neon-cyan mb-4">
            Hey {gameView.currentPlayer.name}! Your Secret Santa assignment:
          </p>

          <div className="flex flex-col items-center gap-4 my-6">
            <div className="bg-black/60 p-4 border-4 border-neon-pink neon-glow-pink animate-neon-pulse">
              <PixelAvatar
                avatarId={gameView.currentPlayer.assignedToAvatarId || "mystery"}
                size="lg"
              />
            </div>
            <GlitchText
              text={gameView.currentPlayer.assignedToName}
              as="h2"
              className="text-4xl neon-text-yellow"
              glitchIntensity="subtle"
              continuous={false}
            />
          </div>

          <p className="neon-text-green animate-pulse">
            ★ Buy them a nice gift! ★
          </p>

          <div className="mt-6 text-sm text-gray-400">
            <p>
              {gameView.revealedCount}/{gameView.totalParticipants} players have revealed
            </p>
          </div>
        </PixelCard>

        <button
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-400 hover:text-neon-cyan transition-colors"
        >
          Logout
        </button>
      </main>
    );
  }

  // Active game - show avatar grid
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-4xl md:text-6xl neon-text-pink mb-2"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-xl neon-text-cyan animate-pulse">New Year 2026</p>
          <p className="text-lg text-white mt-4">
            Welcome, <span className="neon-text-yellow">{gameView.currentPlayer?.name}</span>!
          </p>
        </div>

        {/* Instructions */}
        <PixelCard variant="dark" className="mb-8 text-center">
          <p className="text-xl text-neon-cyan">
            Click on any avatar (except yours) to reveal who you&apos;ll buy a gift for!
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Choose wisely - you can only reveal once! ★
          </p>
        </PixelCard>

        {/* Avatar Grid */}
        <AvatarGrid
          participants={gameView.participants}
          onAvatarClick={handleAvatarClick}
          disabled={revealing}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            {gameView.revealedCount}/{gameView.totalParticipants} players have revealed
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-neon-cyan transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Reveal Modal */}
      {revealData && (
        <RevealModal
          isOpen={showReveal}
          assignedToName={revealData.name}
          assignedToAvatarId={revealData.avatarId}
          onClose={handleCloseReveal}
          alreadyRevealed={revealData.alreadyRevealed}
        />
      )}
    </main>
  );
}
