"use client";

import AvatarCard from "./AvatarCard";
import { AvailableParticipant } from "@/types";

interface AvatarGridProps {
  availableParticipants: AvailableParticipant[];
  onAvatarClick?: (participantId: string) => void;
  disabled?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export default function AvatarGrid({
  availableParticipants,
  onAvatarClick,
  disabled = false,
  onHoverStart,
  onHoverEnd,
}: AvatarGridProps) {
  if (availableParticipants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-frost-blue">No available participants...</p>
        <p className="text-lg text-gray-400 mt-2">
          Everyone has been chosen!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {availableParticipants.map((participant) => (
        <AvatarCard
          key={participant.id}
          avatarId={participant.avatarId}
          isCurrentPlayer={false}
          hasRevealed={false}
          onClick={() => onAvatarClick?.(participant.id)}
          disabled={disabled}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      ))}
    </div>
  );
}
