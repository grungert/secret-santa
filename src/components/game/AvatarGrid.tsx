"use client";

import AvatarCard from "./AvatarCard";
import { PlayerViewParticipant } from "@/types";

interface AvatarGridProps {
  participants: PlayerViewParticipant[];
  onAvatarClick?: (avatarId: string) => void;
  disabled?: boolean;
  selectedAvatarId?: string;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export default function AvatarGrid({
  participants,
  onAvatarClick,
  disabled = false,
  selectedAvatarId,
  onHoverStart,
  onHoverEnd,
}: AvatarGridProps) {
  // Filter out the current player - they're shown in the sidebar
  const otherParticipants = participants.filter(p => !p.isCurrentPlayer);

  if (otherParticipants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-frost-blue">No other participants yet...</p>
        <p className="text-lg text-gray-400 mt-2">
          Wait for more players to join!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {otherParticipants.map((participant, index) => (
        <AvatarCard
          key={`${participant.avatarId}-${index}`}
          avatarId={participant.avatarId}
          isCurrentPlayer={false}
          hasRevealed={participant.hasRevealed}
          onClick={() => onAvatarClick?.(participant.avatarId)}
          disabled={disabled}
          selected={selectedAvatarId === participant.avatarId}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      ))}
    </div>
  );
}
