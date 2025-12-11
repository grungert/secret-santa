"use client";

import { Avatar, AvatarType } from "@/types";
import { getAvatarById, mysteryAvatar } from "@/data/avatars";

interface PixelAvatarProps {
  avatarId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showMystery?: boolean;
}

// Pixel art SVG components for each avatar type
function SantaAvatar({ colors, cool }: { colors: Avatar["colors"]; cool?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Hat */}
      <rect x="8" y="2" width="16" height="4" fill={colors.primary} />
      <rect x="6" y="6" width="20" height="2" fill="#fffafa" />
      <rect x="22" y="0" width="4" height="4" fill="#fffafa" />
      {/* Face */}
      <rect x="8" y="8" width="16" height="12" fill="#ffd5b5" />
      {/* Eyes */}
      {cool ? (
        <>
          <rect x="10" y="12" width="4" height="2" fill="#1a1a2e" />
          <rect x="18" y="12" width="4" height="2" fill="#1a1a2e" />
        </>
      ) : (
        <>
          <rect x="11" y="12" width="2" height="2" fill="#1a1a2e" />
          <rect x="19" y="12" width="2" height="2" fill="#1a1a2e" />
        </>
      )}
      {/* Nose */}
      <rect x="15" y="14" width="2" height="2" fill="#e8a57d" />
      {/* Beard */}
      <rect x="6" y="18" width="20" height="10" fill="#fffafa" />
      <rect x="8" y="16" width="16" height="2" fill="#fffafa" />
      {/* Mouth */}
      <rect x="14" y="19" width="4" height="2" fill={colors.primary} />
      {/* Cheeks */}
      <rect x="8" y="14" width="2" height="2" fill="#ffb6c1" />
      <rect x="22" y="14" width="2" height="2" fill="#ffb6c1" />
    </svg>
  );
}

function ElfAvatar({ colors, mischief }: { colors: Avatar["colors"]; mischief?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Hat */}
      <rect x="10" y="0" width="12" height="2" fill={colors.primary} />
      <rect x="12" y="2" width="8" height="6" fill={colors.primary} />
      <rect x="18" y="6" width="4" height="2" fill={colors.accent} />
      {/* Ears */}
      <rect x="4" y="10" width="4" height="6" fill="#ffd5b5" />
      <rect x="24" y="10" width="4" height="6" fill="#ffd5b5" />
      {/* Face */}
      <rect x="8" y="8" width="16" height="14" fill="#ffd5b5" />
      {/* Eyes */}
      <rect x="11" y="12" width="2" height="2" fill="#1a1a2e" />
      <rect x="19" y="12" width="2" height="2" fill="#1a1a2e" />
      {mischief && (
        <>
          <rect x="10" y="11" width="4" height="1" fill="#1a1a2e" />
          <rect x="18" y="11" width="4" height="1" fill="#1a1a2e" />
        </>
      )}
      {/* Nose */}
      <rect x="15" y="14" width="2" height="2" fill="#e8a57d" />
      {/* Mouth */}
      <rect x="13" y="18" width="6" height="2" fill={mischief ? colors.secondary : "#ff6b6b"} />
      {/* Collar */}
      <rect x="8" y="22" width="16" height="4" fill={colors.secondary} />
      <rect x="14" y="24" width="4" height="4" fill={colors.accent} />
      {/* Body */}
      <rect x="10" y="26" width="12" height="6" fill={colors.primary} />
    </svg>
  );
}

function SnowmanAvatar({ colors, hasScarf }: { colors: Avatar["colors"]; hasScarf?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Hat */}
      <rect x="10" y="0" width="12" height="2" fill={colors.secondary} />
      <rect x="12" y="2" width="8" height="6" fill={colors.secondary} />
      {/* Head */}
      <rect x="8" y="8" width="16" height="12" fill={colors.primary} />
      {/* Eyes (coal) */}
      <rect x="11" y="12" width="2" height="2" fill="#1a1a2e" />
      <rect x="19" y="12" width="2" height="2" fill="#1a1a2e" />
      {/* Carrot nose */}
      <rect x="15" y="14" width="2" height="2" fill={colors.accent} />
      <rect x="17" y="14" width="2" height="2" fill={colors.accent} />
      {/* Mouth (coal) */}
      <rect x="12" y="17" width="2" height="1" fill="#1a1a2e" />
      <rect x="14" y="18" width="4" height="1" fill="#1a1a2e" />
      <rect x="18" y="17" width="2" height="1" fill="#1a1a2e" />
      {/* Scarf or buttons */}
      {hasScarf ? (
        <>
          <rect x="6" y="20" width="20" height="3" fill={colors.secondary} />
          <rect x="6" y="23" width="4" height="6" fill={colors.secondary} />
        </>
      ) : (
        <>
          <rect x="15" y="22" width="2" height="2" fill="#1a1a2e" />
          <rect x="15" y="26" width="2" height="2" fill="#1a1a2e" />
        </>
      )}
      {/* Body */}
      <rect x="6" y="20" width="20" height="12" fill={colors.primary} />
    </svg>
  );
}

function ReindeerAvatar({ colors, isRudolph }: { colors: Avatar["colors"]; isRudolph?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Antlers */}
      <rect x="4" y="0" width="2" height="8" fill={colors.primary} />
      <rect x="6" y="2" width="2" height="2" fill={colors.primary} />
      <rect x="26" y="0" width="2" height="8" fill={colors.primary} />
      <rect x="24" y="2" width="2" height="2" fill={colors.primary} />
      {/* Ears */}
      <rect x="6" y="8" width="4" height="4" fill={colors.primary} />
      <rect x="22" y="8" width="4" height="4" fill={colors.primary} />
      {/* Face */}
      <rect x="8" y="8" width="16" height="16" fill={colors.primary} />
      {/* Eyes */}
      <rect x="11" y="12" width="3" height="3" fill="#fffafa" />
      <rect x="18" y="12" width="3" height="3" fill="#fffafa" />
      <rect x="12" y="13" width="2" height="2" fill="#1a1a2e" />
      <rect x="18" y="13" width="2" height="2" fill="#1a1a2e" />
      {/* Nose */}
      <rect x="13" y="18" width="6" height="4" fill={isRudolph ? colors.secondary : "#1a1a2e"} />
      {isRudolph && (
        <rect x="14" y="19" width="4" height="2" fill="#ff4444" className="animate-pulse" />
      )}
      {/* Mouth */}
      <rect x="14" y="22" width="4" height="2" fill="#1a1a2e" />
      {/* Collar with bell */}
      <rect x="8" y="24" width="16" height="3" fill={colors.secondary} />
      <rect x="14" y="27" width="4" height="4" fill={colors.accent} />
    </svg>
  );
}

function PenguinAvatar({ colors }: { colors: Avatar["colors"] }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Santa hat */}
      <rect x="10" y="0" width="12" height="2" fill={colors.accent} />
      <rect x="12" y="2" width="8" height="4" fill={colors.accent} />
      <rect x="20" y="2" width="4" height="4" fill="#fffafa" />
      <rect x="8" y="6" width="16" height="2" fill="#fffafa" />
      {/* Body */}
      <rect x="6" y="8" width="20" height="20" fill={colors.primary} />
      {/* White belly */}
      <rect x="10" y="12" width="12" height="14" fill={colors.secondary} />
      {/* Eyes */}
      <rect x="10" y="10" width="4" height="4" fill="#fffafa" />
      <rect x="18" y="10" width="4" height="4" fill="#fffafa" />
      <rect x="11" y="11" width="2" height="2" fill="#1a1a2e" />
      <rect x="19" y="11" width="2" height="2" fill="#1a1a2e" />
      {/* Beak */}
      <rect x="14" y="15" width="4" height="2" fill="#ffa500" />
      <rect x="13" y="17" width="6" height="2" fill="#ffa500" />
      {/* Flippers */}
      <rect x="2" y="14" width="4" height="10" fill={colors.primary} />
      <rect x="26" y="14" width="4" height="10" fill={colors.primary} />
      {/* Feet */}
      <rect x="10" y="28" width="4" height="4" fill="#ffa500" />
      <rect x="18" y="28" width="4" height="4" fill="#ffa500" />
    </svg>
  );
}

function GingerbreadAvatar({ colors }: { colors: Avatar["colors"] }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Head */}
      <rect x="10" y="0" width="12" height="10" fill={colors.primary} />
      {/* Eyes */}
      <rect x="12" y="3" width="2" height="2" fill={colors.secondary} />
      <rect x="18" y="3" width="2" height="2" fill={colors.secondary} />
      {/* Mouth */}
      <rect x="13" y="6" width="6" height="2" fill={colors.secondary} />
      {/* Body */}
      <rect x="8" y="10" width="16" height="14" fill={colors.primary} />
      {/* Buttons */}
      <rect x="15" y="12" width="2" height="2" fill={colors.accent} />
      <rect x="15" y="16" width="2" height="2" fill={colors.accent} />
      <rect x="15" y="20" width="2" height="2" fill={colors.accent} />
      {/* Icing */}
      <rect x="8" y="10" width="16" height="2" fill={colors.secondary} />
      {/* Arms */}
      <rect x="2" y="12" width="6" height="4" fill={colors.primary} />
      <rect x="24" y="12" width="6" height="4" fill={colors.primary} />
      {/* Hands */}
      <rect x="0" y="12" width="2" height="4" fill={colors.primary} />
      <rect x="30" y="12" width="2" height="4" fill={colors.primary} />
      {/* Legs */}
      <rect x="10" y="24" width="4" height="8" fill={colors.primary} />
      <rect x="18" y="24" width="4" height="8" fill={colors.primary} />
      {/* Feet icing */}
      <rect x="10" y="30" width="4" height="2" fill={colors.secondary} />
      <rect x="18" y="30" width="4" height="2" fill={colors.secondary} />
    </svg>
  );
}

function PresentAvatar({ colors }: { colors: Avatar["colors"] }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Bow top */}
      <rect x="10" y="0" width="4" height="4" fill={colors.secondary} />
      <rect x="18" y="0" width="4" height="4" fill={colors.secondary} />
      <rect x="14" y="2" width="4" height="4" fill={colors.secondary} />
      {/* Bow knot */}
      <rect x="14" y="4" width="4" height="2" fill={colors.accent} />
      {/* Lid */}
      <rect x="4" y="6" width="24" height="4" fill={colors.primary} />
      {/* Box */}
      <rect x="6" y="10" width="20" height="18" fill={colors.primary} />
      {/* Vertical ribbon */}
      <rect x="14" y="6" width="4" height="22" fill={colors.secondary} />
      {/* Horizontal ribbon */}
      <rect x="6" y="16" width="20" height="4" fill={colors.secondary} />
      {/* Ribbon cross */}
      <rect x="14" y="16" width="4" height="4" fill={colors.accent} />
      {/* Highlights */}
      <rect x="8" y="12" width="4" height="2" fill={colors.primary} style={{ opacity: 0.7 }} />
    </svg>
  );
}

function MysteryAvatar({ colors }: { colors: Avatar["colors"] }) {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
      {/* Box */}
      <rect x="4" y="4" width="24" height="24" fill={colors.primary} />
      {/* Inner border */}
      <rect x="6" y="6" width="20" height="20" fill="transparent" stroke={colors.secondary} strokeWidth="2" />
      {/* Question mark */}
      <rect x="12" y="10" width="8" height="2" fill={colors.secondary} />
      <rect x="18" y="10" width="2" height="6" fill={colors.secondary} />
      <rect x="14" y="14" width="6" height="2" fill={colors.secondary} />
      <rect x="14" y="16" width="2" height="4" fill={colors.secondary} />
      <rect x="14" y="22" width="2" height="2" fill={colors.secondary} />
      {/* Sparkles */}
      <rect x="2" y="2" width="2" height="2" fill={colors.accent} className="animate-pixel-sparkle" />
      <rect x="28" y="2" width="2" height="2" fill={colors.accent} className="animate-pixel-sparkle" style={{ animationDelay: "0.5s" }} />
      <rect x="2" y="28" width="2" height="2" fill={colors.accent} className="animate-pixel-sparkle" style={{ animationDelay: "1s" }} />
      <rect x="28" y="28" width="2" height="2" fill={colors.accent} className="animate-pixel-sparkle" style={{ animationDelay: "1.5s" }} />
    </svg>
  );
}

function getAvatarComponent(avatar: Avatar): React.ReactElement {
  const { type, colors, id } = avatar;

  switch (type) {
    case "santa":
      return <SantaAvatar colors={colors} cool={id.includes("cool")} />;
    case "elf":
      return <ElfAvatar colors={colors} mischief={id.includes("mischief")} />;
    case "snowman":
      return <SnowmanAvatar colors={colors} hasScarf={id.includes("scarf")} />;
    case "reindeer":
      return <ReindeerAvatar colors={colors} isRudolph={id.includes("rudolph")} />;
    case "penguin":
      return <PenguinAvatar colors={colors} />;
    case "gingerbread":
      return <GingerbreadAvatar colors={colors} />;
    case "present":
      return <PresentAvatar colors={colors} />;
    case "mystery":
    default:
      return <MysteryAvatar colors={colors} />;
  }
}

export default function PixelAvatar({
  avatarId,
  size = "md",
  className = "",
  showMystery = false,
}: PixelAvatarProps) {
  const avatar = showMystery ? mysteryAvatar : (getAvatarById(avatarId) || mysteryAvatar);

  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      {getAvatarComponent(avatar)}
    </div>
  );
}
