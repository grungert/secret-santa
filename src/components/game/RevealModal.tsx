"use client";

import { useState, useEffect, useRef } from "react";
import PixelAvatar from "./PixelAvatar";
import PixelButton from "@/components/ui/PixelButton";
import GlitchText from "@/components/effects/GlitchText";
import { cn } from "@/lib/utils";

interface RevealModalProps {
  isOpen: boolean;
  assignedToName: string;
  assignedToAvatarId: string;
  onClose: () => void;
  alreadyRevealed?: boolean;
}

// Neon confetti piece component
function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#39ff14", "#ff00ff", "#00ffff", "#ffff00", "#ff6600"];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 2;

  return (
    <div
      className="absolute w-3 h-3 animate-confetti"
      style={{
        left: `${left}%`,
        top: "-20px",
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    />
  );
}

export default function RevealModal({
  isOpen,
  assignedToName,
  assignedToAvatarId,
  onClose,
  alreadyRevealed = false,
}: RevealModalProps) {
  const [showVideo, setShowVideo] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowVideo(true);
      setVideoLoading(true);
      setAnimationStage(0);
      setShowConfetti(false);
      setVideoKey(prev => prev + 1); // Force video remount
    } else {
      // Also reset when modal closes (safeguard for stale state)
      setShowVideo(true);
      setVideoLoading(true);
      setAnimationStage(0);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Start reveal animation after video ends
  const startRevealAnimation = () => {
    setShowVideo(false);

    // Animation sequence
    setTimeout(() => setAnimationStage(1), 300);
    setTimeout(() => setAnimationStage(2), 1200);
    setTimeout(() => {
      setShowConfetti(true);
      setAnimationStage(3);
    }, 2000);
    setTimeout(() => setAnimationStage(4), 3000);
    setTimeout(() => setAnimationStage(5), 4000);
  };

  const handleVideoLoaded = () => {
    setVideoLoading(false);
    // Try to play after loaded
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked, user needs to interact:", err);
      });
    }
  };

  const handleVideoEnded = () => {
    startRevealAnimation();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    // Don't immediately skip - give it a chance to load
  };

  const handleSkipVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    startRevealAnimation();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop with neon gradient - more transparent to show 3D background */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(26, 10, 46, 0.7) 0%, rgba(10, 10, 15, 0.75) 100%)",
        }}
        onClick={animationStage >= 5 ? onClose : undefined}
      />

      {/* Video overlay - shows before reveal */}
      {showVideo && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          {/* Loading indicator */}
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-white text-xl animate-pulse">Loading video...</div>
            </div>
          )}
          <video
            key={videoKey}
            ref={videoRef}
            className="w-full h-full object-contain"
            onLoadedData={handleVideoLoaded}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            playsInline
            muted
            autoPlay
          >
            <source src="/imgs/video.mp4" type="video/mp4" />
          </video>
          {/* Skip button */}
          <button
            onClick={handleSkipVideo}
            className="absolute bottom-8 right-8 px-4 py-2 bg-black/50 rounded text-white/80 hover:text-white hover:bg-black/70 text-sm transition-all z-20"
          >
            Skip →
          </button>
        </div>
      )}

      {/* Neon Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 overflow-visible">
        {/* Avatar with zoom animation */}
        <div
          className={cn(
            "relative mx-auto inline-block",
            animationStage >= 1 && "animate-reveal-zoom"
          )}
        >
          <div className="relative">
            {/* Avatar container with neon border and glow - circular */}
            <div
              className="relative bg-black/80 p-6 backdrop-blur-sm rounded-full animate-combined-glow"
            >
              <PixelAvatar avatarId={assignedToAvatarId} size="md" />
            </div>
          </div>
        </div>

        {/* Title with glitch effect */}
        {animationStage >= 3 && (
          <div className="space-y-2">
            <p className="text-2xl neon-text-cyan animate-pulse">
              {alreadyRevealed
                ? "Your Secret Santa assignment:"
                : "You will buy a gift for..."}
            </p>
          </div>
        )}

        {/* Name reveal with dramatic entrance animation */}
        {animationStage >= 4 && (
          <div className="min-h-[100px] flex items-center justify-center overflow-visible">
            <div className="animate-name-reveal">
              <GlitchText
                text={`${assignedToName}!`}
                as="h2"
                className="text-5xl md:text-7xl font-bold neon-text-pink drop-shadow-[0_0_30px_var(--neon-pink)]"
                glitchIntensity="intense"
                continuous={false}
              />
            </div>
          </div>
        )}

        {/* Neon festive message */}
        {animationStage >= 4 && (
          <p className="text-xl animate-rainbow-neon">
            ★ AWESOME ★
          </p>
        )}

        {/* Close button */}
        {animationStage >= 5 && (
          <div className="pt-4">
            <PixelButton variant="neonCyan" size="lg" onClick={onClose}>
              Got it!
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
