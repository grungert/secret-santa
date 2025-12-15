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

// Video gallery list
const GALLERY_VIDEOS = [
  { name: "Video 1", src: "/imgs/video1.mp4" },
  { name: "Video 2", src: "/imgs/video2.mp4" },
  { name: "Video 3", src: "/imgs/video3.mp4" },
  { name: "Video 4", src: "/imgs/video4.mp4" },
  { name: "Video 5", src: "/imgs/video5.mp4" },
  { name: "Video 6", src: "/imgs/video6.mp4" },
  { name: "Video 7", src: "/imgs/video7.mp4" },
];

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

  // Video gallery state
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [galleryVideo, setGalleryVideo] = useState<string | null>(null);

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
    // Prevent clicks if: no player, already revealing, or already chose
    if (!playerName || revealing || gameView?.currentPlayer?.hasRevealed) return;

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

  // Just dismiss the modal, stay on game screen to see progress
  const handleDismissReveal = () => {
    setShowReveal(false);
    setRevealData(null);
    setSantaExpression("naughty");
    // Keep music playing - don't stop it
    // Refresh game view to show updated progress (including chosen avatars list)
    fetchGameView();
  };

  // Show reveal animation for users who already chose
  const handleShowMyChoice = () => {
    if (gameView?.currentPlayer?.hasRevealed && gameView.currentPlayer.assignedToName) {
      setRevealData({
        name: gameView.currentPlayer.assignedToName,
        avatarId: gameView.currentPlayer.assignedToAvatarId || "mystery",
        alreadyRevealed: true,
      });
      setShowReveal(true);
    }
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

  // Active game - show game screen with progress and available ornaments
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

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {/* See My Choice button - only for users who already chose */}
            {gameView.currentPlayer?.hasRevealed && gameView.currentPlayer.assignedToName && (
              <button
                onClick={handleShowMyChoice}
                className="px-6 py-2 rounded-full border-2 border-neon-pink text-neon-pink hover:bg-neon-pink/20 transition-all"
                style={{
                  textShadow: "0 0 10px var(--neon-pink)",
                  boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)",
                }}
              >
                🎁 See My Choice
              </button>
            )}

            {/* Videos button */}
            <button
              onClick={() => setShowVideoGallery(true)}
              className="px-6 py-2 rounded-full border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 transition-all"
              style={{
                textShadow: "0 0 10px var(--neon-cyan)",
                boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
              }}
            >
              🎬 Videos
            </button>
          </div>
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
            onDismiss={handleDismissReveal}
            onLogout={handleLogout}
            alreadyRevealed={revealData.alreadyRevealed}
          />
        )}

        {/* Video Gallery Modal */}
        {showVideoGallery && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => {
                setGalleryVideo(null);
                setShowVideoGallery(false);
              }}
            />

            {galleryVideo ? (
              // Video player view
              <div className="relative z-10 flex flex-col items-center">
                <video
                  src={galleryVideo}
                  controls
                  autoPlay
                  className="max-w-4xl max-h-[70vh] rounded-lg"
                  style={{
                    boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
                  }}
                />
                <button
                  onClick={() => setGalleryVideo(null)}
                  className="mt-4 px-6 py-2 rounded-full border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 transition-all"
                  style={{
                    textShadow: "0 0 10px var(--neon-cyan)",
                  }}
                >
                  ← Back to list
                </button>
              </div>
            ) : (
              // Video list view
              <div
                className="relative z-10 bg-black/90 p-6 rounded-xl border-2 border-neon-cyan min-w-[300px]"
                style={{
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
                }}
              >
                <h3 className="text-2xl neon-text-cyan text-center mb-6">
                  🎬 Videos
                </h3>
                <div className="flex flex-col gap-3">
                  {GALLERY_VIDEOS.map((video) => (
                    <button
                      key={video.src}
                      onClick={() => setGalleryVideo(video.src)}
                      className="px-6 py-3 rounded-lg border border-neon-pink/50 text-neon-pink hover:bg-neon-pink/20 hover:border-neon-pink transition-all text-left"
                      style={{
                        textShadow: "0 0 8px var(--neon-pink)",
                      }}
                    >
                      ▶ {video.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowVideoGallery(false)}
                  className="mt-6 w-full px-6 py-2 rounded-full border border-gray-500 text-gray-400 hover:text-white hover:border-white transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
