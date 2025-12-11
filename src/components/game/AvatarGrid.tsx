"use client";

import AvatarCard from "./AvatarCard";
import { PlayerViewParticipant } from "@/types";

interface AvatarGridProps {
  participants: PlayerViewParticipant[];
  onAvatarClick?: (avatarId: string) => void;
  disabled?: boolean;
  selectedAvatarId?: string;
}

export default function AvatarGrid({
  participants,
  onAvatarClick,
  disabled = false,
  selectedAvatarId,
}: AvatarGridProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-frost-blue">No participants yet...</p>
        <p className="text-lg text-gray-400 mt-2">
          Wait for the admin to start the game!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {participants.map((participant, index) => (
        <AvatarCard
          key={`${participant.avatarId}-${index}`}
          avatarId={participant.avatarId}
          isCurrentPlayer={participant.isCurrentPlayer}
          hasRevealed={participant.hasRevealed}
          onClick={() => onAvatarClick?.(participant.avatarId)}
          disabled={disabled || participant.isCurrentPlayer}
          selected={selectedAvatarId === participant.avatarId}
        />
      ))}
    </div>
  );
}
