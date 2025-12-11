"use client";

import { Participant } from "@/types";
import PixelAvatar from "@/components/game/PixelAvatar";
import PixelButton from "@/components/ui/PixelButton";
import PixelCard from "@/components/ui/PixelCard";

interface ParticipantListProps {
  participants: Participant[];
  onRemove: (id: string) => Promise<void>;
  disabled?: boolean;
  showStatus?: boolean;
}

export default function ParticipantList({
  participants,
  onRemove,
  disabled,
  showStatus = false,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <PixelCard variant="dark" className="text-center py-8">
        <p className="text-xl text-frost-blue">No participants yet</p>
        <p className="text-gray-400 mt-2">Add some friends to get started!</p>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg text-frost-blue">
          Participants ({participants.length})
        </span>
        {participants.length < 3 && (
          <span className="text-sm text-gold">
            Need at least 3 to start
          </span>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 bg-midnight/50 border-2 border-frost-blue/30 p-2 hover:border-frost-blue transition-colors"
          >
            {/* Index */}
            <span className="text-gold w-6 text-center">{index + 1}</span>

            {/* Avatar */}
            <PixelAvatar avatarId={participant.avatarId} size="sm" />

            {/* Name */}
            <span className="flex-1 text-lg text-snow-white truncate">
              {participant.name}
            </span>

            {/* Status (for active game) */}
            {showStatus && (
              <span
                className={`text-sm px-2 py-1 ${
                  participant.hasRevealed
                    ? "bg-christmas-green text-snow-white"
                    : "bg-midnight text-gray-400"
                }`}
              >
                {participant.hasRevealed ? "Revealed" : "Pending"}
              </span>
            )}

            {/* Remove button */}
            {!disabled && (
              <PixelButton
                variant="danger"
                size="sm"
                onClick={() => onRemove(participant.id)}
                className="shrink-0"
              >
                X
              </PixelButton>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
