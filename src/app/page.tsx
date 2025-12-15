"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import LoginForm from "@/components/game/LoginForm";
import AvatarGrid from "@/components/game/AvatarGrid";
import ChosenAvatarsSidebar from "@/components/game/ChosenAvatarsSidebar";
import RevealModal from "@/components/game/RevealModal";
import PixelCard from "@/components/ui/PixelCard";
import PixelAvatar from "@/components/game/PixelAvatar";
import GlitchText from "@/components/effects/GlitchText";
import PixelButton from "@/components/ui/PixelButton";
import FloatingNames from "@/components/effects/FloatingNames";
import NewYearCountdown from "@/components/ui/NewYearCountdown";
import NeonStatBar from "@/components/ui/NeonStatBar";
import { PlayerGameView } from "@/types";
import SantaFace, { SantaExpression } from "@/components/game/SantaFace";

// Dynamically import ThreeBackground to avoid SSR issues with Three.js
const ThreeBackground = dynamic(
  () => import("@/components/effects/ThreeBackground"),
  { ssr: false }
);

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

  // Santa expression state
  const [santaExpression, setSantaExpression] = useState<SantaExpression>("naughty");

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  // Intro screen floating names
  const [introNames, setIntroNames] = useState<string[]>([]);

  // Track if we've shown the reveal animation this session (to avoid showing it on every poll)
  const hasShownRevealRef = useRef(false);

  // Fetch participant names for intro screen
  useEffect(() => {
    const fetchIntroNames = async () => {
      try {
        const res = await fetch("/api/game?publicNames=true");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setIntroNames(data.data);
        }
      } catch {
        // Silently fail - names are decorative
      }
    };
    fetchIntroNames();
  }, []);

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
        // Resume music when logging in
        setIsMusicPlaying(true);
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
    console.log("handleLogout called");
    localStorage.removeItem(STORAGE_KEY);
    setPlayerName(null);
    setGameView(null);
    hasShownRevealRef.current = false; // Reset so animation shows again on next login
    // Stop music using global function
    console.log("window.stopSecretSantaMusic exists:", !!window.stopSecretSantaMusic);
    if (typeof window !== "undefined" && window.stopSecretSantaMusic) {
      console.log("Calling stopSecretSantaMusic");
      window.stopSecretSantaMusic();
    }
    setIsMusicPlaying(false);
  };

  const handleAvatarClick = async (targetId: string) => {
    if (!playerName || revealing) return;

    setRevealing(true);
    // Set Santa to "Super Nice" expression immediately
    setSantaExpression("super-nice");

    try {
      const res = await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, targetId }),
      });

      const data = await res.json();

      if (data.success) {
        setRevealData({
          name: data.data.assignedTo.name,
          avatarId: data.data.assignedTo.avatarId,
          alreadyRevealed: data.data.alreadyRevealed,
        });

        // Delay showing the reveal modal to let Santa's "Super Nice" animation play
        // NOTE: Do NOT call fetchGameView() here - it would update hasRevealed=true
        // which triggers the static card view before modal can show
        setTimeout(() => {
          setShowReveal(true);
        }, 3000);
      } else {
        setSantaExpression("naughty");
        alert(data.error || "Failed to reveal");
      }
    } catch {
      setSantaExpression("naughty");
      alert("Failed to connect. Please try again.");
    } finally {
      setRevealing(false);
    }
  };

  const handleCloseReveal = () => {
    setShowReveal(false);
    setRevealData(null); // Reset to unmount modal completely - ensures fresh video state next time
    setSantaExpression("naughty");
    // Stop music immediately using global function before unmounting
    if (typeof window !== "undefined" && window.stopSecretSantaMusic) {
      window.stopSecretSantaMusic();
    }
    setIsMusicPlaying(false);
    // Redirect to intro screen
    setShowStartScreen(true);
  };

  // Santa expression handlers for ornament hover
  const handleOrnamentHoverStart = () => {
    if (!revealing) {
      setSantaExpression("nice");
    }
  };

  const handleOrnamentHoverEnd = () => {
    if (!revealing) {
      setSantaExpression("naughty");
    }
  };

  const handleStart = () => {
    setShowStartScreen(false);
  };

  // Start screen - shows full background with START button (2D layered background from layout)
  if (showStartScreen) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-start pt-[15vh] p-4 relative">
        {/* Floating participant names */}
        <FloatingNames names={introNames} />

        {/* Admin link in bottom right */}
        <a
          href="/admin"
          className="absolute bottom-4 right-4 text-sm text-gray-500 hover:text-neon-cyan transition-colors z-10"
        >
          Admin Panel →
        </a>

        {/* Play Game button in bottom left */}
        <PixelButton
          onClick={() => window.location.href = '/game/game.html'}
          variant="secondary"
          size="sm"
          className="absolute bottom-4 left-4 text-sm z-10"
        >
          🎄 PLAY GAME
        </PixelButton>

        <div className="text-center relative z-10">
          <GlitchText
            text="SECRET SANTA"
            as="h1"
            className="text-5xl md:text-7xl neon-text-pink mb-4"
            glitchIntensity="medium"
            continuous
          />
          <p className="text-2xl mb-12 animate-rainbow-neon tracking-widest">
            ✦ New Year 2026 ✦
          </p>

          <PixelButton
            onClick={handleStart}
            variant="retro"
            size="lg"
            className="text-3xl px-14 py-4"
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
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="text-6xl animate-pixel-bounce mb-4">🎅</div>
          <p className="text-2xl neon-text-pink animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen - show 2D background (LayeredBackground from layout)
  if (!playerName) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
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

  // Game not started - Player logged in, show 3D background
  if (!gameView || gameView.status === "setup") {
    return (
      <>
        <ThreeBackground musicEnabled={isMusicPlaying} />
        <FloatingNames names={introNames} />
        {/* Hide 2D background with CSS */}
        <style jsx global>{`
          .layered-bg, .snow-effect { display: none !important; }
        `}</style>
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
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
      </>
    );
  }

  // Player already revealed - show their assignment
  // NOTE: Also check !revealData to prevent race condition with polling interval
  // If revealData is set, the reveal modal is in progress and we should stay on active game view
  if (gameView.currentPlayer?.hasRevealed && gameView.currentPlayer.assignedToName && !revealData) {
    return (
      <>
        <ThreeBackground musicEnabled={isMusicPlaying} />
        <FloatingNames names={introNames} />
        {/* Hide 2D background with CSS */}
        <style jsx global>{`
          .layered-bg, .snow-effect { display: none !important; }
        `}</style>
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
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
      </>
    );
  }

  // Active game - show avatar grid (no sidebar)
  return (
    <>
      <ThreeBackground musicEnabled={isMusicPlaying} />
      <FloatingNames names={introNames} />
      {/* Hide 2D background with CSS */}
      <style jsx global>{`
        .layered-bg, .snow-effect { display: none !important; }
      `}</style>
      <main className="min-h-screen p-4 md:p-6 lg:p-8 relative z-10">
        {/* Header - Title with player name */}
        <div className="text-center mb-4 md:mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GlitchText
              text="SECRET SANTA"
              as="h1"
              className="text-3xl md:text-5xl lg:text-6xl neon-text-pink"
              glitchIntensity="medium"
              continuous
            />
            <span className="text-2xl md:text-4xl lg:text-5xl neon-text-cyan">is</span>
            <span className="text-3xl md:text-5xl lg:text-6xl neon-text-yellow font-bold uppercase">
              {gameView.currentPlayer?.name || playerName}
            </span>
          </div>

          {/* Countdown */}
          <p className="text-lg md:text-xl mb-4">
            <NewYearCountdown targetYear={2026} />
          </p>

          {/* Neon Stat Bar */}
          <NeonStatBar
            playerAvatarId={gameView.currentPlayer?.avatarId || "mystery"}
            revealedCount={gameView.revealedCount}
            totalParticipants={gameView.totalParticipants}
            hasRevealed={gameView.currentPlayer?.hasRevealed || false}
            onLogout={handleLogout}
          />
        </div>

        {/* Santa Face - Fixed Top Right */}
        <div className="fixed top-6 right-6 z-20 flex flex-col items-center">
          <SantaFace expression={santaExpression} />
          <div
            className="text-sm text-center mt-4 px-3 py-1 rounded-full"
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "var(--neon-yellow)",
              textShadow: "0 0 10px var(--neon-yellow)",
              border: "1px solid var(--neon-yellow)",
              boxShadow: "0 0 10px var(--neon-yellow-glow)",
            }}
          >
            {santaExpression === "naughty" && "Pick one!"}
            {santaExpression === "nice" && "Nice! 👍"}
            {santaExpression === "super-nice" && "★ Perfect! ★"}
          </div>
        </div>

        {/* Avatar Grid - Full Width */}
        <div className="max-w-6xl mx-auto">
          <AvatarGrid
            availableParticipants={gameView.availableParticipants}
            onAvatarClick={handleAvatarClick}
            disabled={revealing}
            onHoverStart={handleOrnamentHoverStart}
            onHoverEnd={handleOrnamentHoverEnd}
          />
        </div>

        {/* Chosen Avatars Sidebar */}
        <ChosenAvatarsSidebar
          chosenAvatars={gameView.chosenAvatars}
          totalParticipants={gameView.totalParticipants}
        />

        {/* Reveal Modal */}
        {revealData && (
          <RevealModal
            isOpen={showReveal}
            assignedToName={revealData.name}
            assignedToAvatarId={revealData.avatarId}
            onClose={handleCloseReveal}
            onLogout={handleLogout}
            alreadyRevealed={revealData.alreadyRevealed}
          />
        )}
      </main>
    </>
  );
}
